import { describe, it, expect } from "bun:test";
import {
  ensureVerbatimCollection,
  appendVerbatimMessage,
  searchVerbatim,
} from "./verbatim-archive-store.ts";
import type { QdrantClientLike } from "./episodic-store.ts";

describe("ensureVerbatimCollection", () => {
  it("creates the collection if it doesn't already exist", async () => {
    let created: unknown;
    const client: QdrantClientLike = {
      getCollections: async () => ({ collections: [] }),
      createCollection: async (name, params) => {
        created = { name, params };
        return {};
      },
      upsert: async () => ({}),
      query: async () => ({ points: [] }),
    };

    await ensureVerbatimCollection(client, "verbatim_archive", 768);

    expect(created).toEqual({
      name: "verbatim_archive",
      params: { vectors: { size: 768, distance: "Cosine" } },
    });
  });

  it("does not recreate a collection that already exists", async () => {
    let createCalls = 0;
    const client: QdrantClientLike = {
      getCollections: async () => ({ collections: [{ name: "verbatim_archive" }] }),
      createCollection: async () => {
        createCalls++;
        return {};
      },
      upsert: async () => ({}),
      query: async () => ({ points: [] }),
    };

    await ensureVerbatimCollection(client, "verbatim_archive", 768);

    expect(createCalls).toBe(0);
  });

  // searchVerbatim filters by userId server-side; a keyword index on the
  // field keeps that filter usable as the archive grows. Ensured
  // unconditionally (not only on fresh creation) so a collection made
  // before this existed self-heals — same self-healing reasoning as
  // episodic-store's index guard.
  it("creates the userId payload index when creating a new collection", async () => {
    const indexCalls: Array<{ name: string; params: unknown }> = [];
    const client: QdrantClientLike = {
      getCollections: async () => ({ collections: [] }),
      createCollection: async () => ({}),
      upsert: async () => ({}),
      query: async () => ({ points: [] }),
      createPayloadIndex: async (name, params) => {
        indexCalls.push({ name, params });
        return {};
      },
    };

    await ensureVerbatimCollection(client, "verbatim_archive", 768);

    expect(indexCalls).toEqual([
      { name: "verbatim_archive", params: { field_name: "userId", field_schema: "keyword" } },
    ]);
  });

  it("creates the userId payload index even when the collection already exists", async () => {
    const indexCalls: Array<{ name: string; params: unknown }> = [];
    const client: QdrantClientLike = {
      getCollections: async () => ({ collections: [{ name: "verbatim_archive" }] }),
      createCollection: async () => ({}),
      upsert: async () => ({}),
      query: async () => ({ points: [] }),
      createPayloadIndex: async (name, params) => {
        indexCalls.push({ name, params });
        return {};
      },
    };

    await ensureVerbatimCollection(client, "verbatim_archive", 768);

    expect(indexCalls).toHaveLength(1);
  });

  it("does not throw when the client doesn't support createPayloadIndex", async () => {
    const client: QdrantClientLike = {
      getCollections: async () => ({ collections: [] }),
      createCollection: async () => ({}),
      upsert: async () => ({}),
      query: async () => ({ points: [] }),
    };

    await expect(ensureVerbatimCollection(client, "verbatim_archive", 768)).resolves.toBeUndefined();
  });
});

describe("appendVerbatimMessage", () => {
  it("embeds the message content and upserts a point with the full verbatim payload", async () => {
    let upserted: { collection: string; points: unknown[] } | undefined;
    const client: QdrantClientLike = {
      getCollections: async () => ({ collections: [] }),
      createCollection: async () => ({}),
      upsert: async (collection, params) => {
        upserted = { collection, points: params.points };
        return {};
      },
      query: async () => ({ points: [] }),
    };
    const embed = async (text: string) => [text.length, 0, 0];

    await appendVerbatimMessage(client, "verbatim_archive", embed, {
      userId: "users/42",
      sessionKey: "spaces/X:users/42",
      role: "user",
      content: "come sta KAN-1?",
      timestamp: "2026-09-22T12:00:00.000Z",
    });

    expect(upserted?.collection).toBe("verbatim_archive");
    expect(upserted?.points).toHaveLength(1);
    const point = upserted!.points[0] as { id: string; vector: number[]; payload: Record<string, unknown> };
    expect(point.vector).toEqual(["come sta KAN-1?".length, 0, 0]);
    expect(point.payload).toEqual({
      userId: "users/42",
      sessionKey: "spaces/X:users/42",
      role: "user",
      content: "come sta KAN-1?",
      timestamp: "2026-09-22T12:00:00.000Z",
    });
    expect(typeof point.id).toBe("string");
  });

  it("embeds the assistant role's content just the same", async () => {
    let payload: Record<string, unknown> | undefined;
    const client: QdrantClientLike = {
      getCollections: async () => ({ collections: [] }),
      createCollection: async () => ({}),
      upsert: async (_collection, params) => {
        payload = (params.points[0] as { payload: Record<string, unknown> }).payload;
        return {};
      },
      query: async () => ({ points: [] }),
    };
    const embed = async () => [1, 2, 3];

    await appendVerbatimMessage(client, "verbatim_archive", embed, {
      userId: "users/42",
      sessionKey: "terminal",
      role: "assistant",
      content: "KAN-1 è In Progress.",
      timestamp: "2026-09-22T12:00:05.000Z",
    });

    expect(payload?.role).toBe("assistant");
    expect(payload?.content).toBe("KAN-1 è In Progress.");
  });
});

describe("searchVerbatim", () => {
  it("embeds queryText, searches scoped to userId, and maps payloads back to VerbatimMessage", async () => {
    let receivedArgs: { collection: string; params: unknown } | undefined;
    const client: QdrantClientLike = {
      getCollections: async () => ({ collections: [] }),
      createCollection: async () => ({}),
      upsert: async () => ({}),
      query: async (collection, params) => {
        receivedArgs = { collection, params };
        return {
          points: [
            {
              id: "p1",
              score: 0.88,
              payload: {
                userId: "users/42",
                sessionKey: "spaces/X:users/42",
                role: "user",
                content: "la settimana scorsa dicevamo di KAN-1",
                timestamp: "2026-09-15T09:00:00.000Z",
              },
            },
          ],
        };
      },
    };
    const embed = async (text: string) => [text.length, 0, 0];

    const results = await searchVerbatim(client, "verbatim_archive", embed, {
      userId: "users/42",
      queryText: "cosa dicevamo di KAN-1",
    });

    expect(receivedArgs?.collection).toBe("verbatim_archive");
    expect(receivedArgs?.params).toEqual({
      query: ["cosa dicevamo di KAN-1".length, 0, 0],
      filter: { must: [{ key: "userId", match: { value: "users/42" } }] },
      limit: 5,
      with_payload: true,
    });
    expect(results).toEqual([
      {
        userId: "users/42",
        sessionKey: "spaces/X:users/42",
        role: "user",
        content: "la settimana scorsa dicevamo di KAN-1",
        timestamp: "2026-09-15T09:00:00.000Z",
      },
    ]);
  });

  it("respects a custom limit instead of the default", async () => {
    let receivedLimit: number | undefined;
    const client: QdrantClientLike = {
      getCollections: async () => ({ collections: [] }),
      createCollection: async () => ({}),
      upsert: async () => ({}),
      query: async (_collection, params) => {
        receivedLimit = params.limit;
        return { points: [] };
      },
    };
    const embed = async () => [0, 0, 0];

    await searchVerbatim(client, "verbatim_archive", embed, { userId: "users/42", queryText: "x", limit: 10 });

    expect(receivedLimit).toBe(10);
  });

  // Qdrant allows a null payload on a point, and a malformed one could
  // exist from an older schema — skip rather than crash or return a
  // malformed VerbatimMessage.
  it("skips results with a missing or malformed payload instead of throwing", async () => {
    const client: QdrantClientLike = {
      getCollections: async () => ({ collections: [] }),
      createCollection: async () => ({}),
      upsert: async () => ({}),
      query: async () => ({
        points: [
          { id: "p1", score: 0.9, payload: null },
          { id: "p2", score: 0.8, payload: { content: 42 } }, // wrong type
          { id: "p3", score: 0.7, payload: { userId: "users/42", sessionKey: "t", role: "captain", content: "hi", timestamp: "2026-09-15T09:00:00.000Z" } }, // invalid role
          {
            id: "p4",
            score: 0.6,
            payload: {
              userId: "users/42",
              sessionKey: "terminal",
              role: "assistant",
              content: "valid one",
              timestamp: "2026-09-15T09:00:00.000Z",
            },
          },
        ],
      }),
    };
    const embed = async () => [0, 0, 0];

    const results = await searchVerbatim(client, "verbatim_archive", embed, { userId: "users/42", queryText: "x" });

    expect(results).toEqual([
      {
        userId: "users/42",
        sessionKey: "terminal",
        role: "assistant",
        content: "valid one",
        timestamp: "2026-09-15T09:00:00.000Z",
      },
    ]);
  });

  it("returns an empty array when nothing matches", async () => {
    const client: QdrantClientLike = {
      getCollections: async () => ({ collections: [] }),
      createCollection: async () => ({}),
      upsert: async () => ({}),
      query: async () => ({ points: [] }),
    };
    const embed = async () => [0, 0, 0];

    expect(await searchVerbatim(client, "verbatim_archive", embed, { userId: "users/42", queryText: "x" })).toEqual([]);
  });
});
