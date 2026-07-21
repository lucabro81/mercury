import { describe, it, expect } from "bun:test";
import { ensureEpisodicCollection, storeEpisodicSummary, searchEpisodicMemory, type QdrantClientLike } from "./episodic-store.ts";

describe("ensureEpisodicCollection", () => {
  it("creates the collection if it doesn't already exist", async () => {
    let created: unknown;
    const client: QdrantClientLike = {
      getCollections: async () => ({ collections: [] }),
      createCollection: async (name, params) => {
        created = { name, params };
        return {};
      },
      upsert: async () => ({}),
      search: async () => [],
    };

    await ensureEpisodicCollection(client, "episodic_memory", 768);

    expect(created).toEqual({
      name: "episodic_memory",
      params: { vectors: { size: 768, distance: "Cosine" } },
    });
  });

  it("does not recreate a collection that already exists", async () => {
    let createCalls = 0;
    const client: QdrantClientLike = {
      getCollections: async () => ({ collections: [{ name: "episodic_memory" }] }),
      createCollection: async () => {
        createCalls++;
        return {};
      },
      upsert: async () => ({}),
      search: async () => [],
    };

    await ensureEpisodicCollection(client, "episodic_memory", 768);

    expect(createCalls).toBe(0);
  });
});

describe("storeEpisodicSummary", () => {
  it("upserts a point with the embedded summary and the full payload", async () => {
    let upserted: { collection: string; points: unknown[] } | undefined;
    const client: QdrantClientLike = {
      getCollections: async () => ({ collections: [] }),
      createCollection: async () => ({}),
      upsert: async (collection, params) => {
        upserted = { collection, points: params.points };
        return {};
      },
      search: async () => [],
    };
    const embed = async (text: string) => [text.length, 0, 0];

    await storeEpisodicSummary(client, "episodic_memory", embed, {
      userId: "users/42",
      sessionKey: "spaces/X:users/42",
      summary: "discussed KAN-1 status",
      timestamp: "2026-07-17T12:00:00.000Z",
    });

    expect(upserted?.collection).toBe("episodic_memory");
    expect(upserted?.points).toHaveLength(1);
    const point = upserted!.points[0] as { id: string; vector: number[]; payload: Record<string, unknown> };
    expect(point.vector).toEqual([22, 0, 0]);
    expect(point.payload).toEqual({
      userId: "users/42",
      sessionKey: "spaces/X:users/42",
      summary: "discussed KAN-1 status",
      timestamp: "2026-07-17T12:00:00.000Z",
    });
    expect(typeof point.id).toBe("string");
  });
});

// The narrow need this serves: "how many times have I already notified
// this user about this item" — not a general-purpose semantic
// consolidation/pattern-extraction engine (that doesn't exist here).
// Filters by
// userId so one user's history never leaks into another's notification
// tone/frequency reasoning.
describe("searchEpisodicMemory", () => {
  it("embeds queryText, searches scoped to userId, and maps payloads back to EpisodicSummary", async () => {
    let receivedArgs: { collection: string; params: unknown } | undefined;
    const client: QdrantClientLike = {
      getCollections: async () => ({ collections: [] }),
      createCollection: async () => ({}),
      upsert: async () => ({}),
      search: async (collection, params) => {
        receivedArgs = { collection, params };
        return [
          {
            id: "p1",
            score: 0.91,
            payload: {
              userId: "users/42",
              sessionKey: "spaces/X:users/42",
              summary: "Mercury ha notificato KAN-1 il 2026-07-15",
              timestamp: "2026-07-15T09:00:00.000Z",
            },
          },
        ];
      },
    };
    const embed = async (text: string) => [text.length, 0, 0];

    const results = await searchEpisodicMemory(client, "episodic_memory", embed, {
      userId: "users/42",
      queryText: "notifiche per KAN-1",
    });

    expect(receivedArgs?.collection).toBe("episodic_memory");
    expect(receivedArgs?.params).toEqual({
      vector: [19, 0, 0],
      filter: { must: [{ key: "userId", match: { value: "users/42" } }] },
      limit: 5,
    });
    expect(results).toEqual([
      {
        userId: "users/42",
        sessionKey: "spaces/X:users/42",
        summary: "Mercury ha notificato KAN-1 il 2026-07-15",
        timestamp: "2026-07-15T09:00:00.000Z",
      },
    ]);
  });

  it("respects a custom limit instead of the default", async () => {
    let receivedLimit: number | undefined;
    const client: QdrantClientLike = {
      getCollections: async () => ({ collections: [] }),
      createCollection: async () => ({}),
      upsert: async () => ({}),
      search: async (_collection, params) => {
        receivedLimit = params.limit;
        return [];
      },
    };
    const embed = async () => [0, 0, 0];

    await searchEpisodicMemory(client, "episodic_memory", embed, { userId: "users/42", queryText: "x", limit: 2 });

    expect(receivedLimit).toBe(2);
  });

  // Qdrant allows a null payload on a point — skip it rather than crash
  // or return a malformed EpisodicSummary.
  it("skips results with a missing or malformed payload instead of throwing", async () => {
    const client: QdrantClientLike = {
      getCollections: async () => ({ collections: [] }),
      createCollection: async () => ({}),
      upsert: async () => ({}),
      search: async () => [
        { id: "p1", score: 0.9, payload: null },
        { id: "p2", score: 0.8, payload: { summary: 42 } }, // wrong type
        {
          id: "p3",
          score: 0.7,
          payload: {
            userId: "users/42",
            sessionKey: "terminal",
            summary: "valid one",
            timestamp: "2026-07-15T09:00:00.000Z",
          },
        },
      ],
    };
    const embed = async () => [0, 0, 0];

    const results = await searchEpisodicMemory(client, "episodic_memory", embed, { userId: "users/42", queryText: "x" });

    expect(results).toEqual([
      { userId: "users/42", sessionKey: "terminal", summary: "valid one", timestamp: "2026-07-15T09:00:00.000Z" },
    ]);
  });

  it("returns an empty array when nothing matches", async () => {
    const client: QdrantClientLike = {
      getCollections: async () => ({ collections: [] }),
      createCollection: async () => ({}),
      upsert: async () => ({}),
      search: async () => [],
    };
    const embed = async () => [0, 0, 0];

    expect(await searchEpisodicMemory(client, "episodic_memory", embed, { userId: "users/42", queryText: "x" })).toEqual(
      [],
    );
  });
});
