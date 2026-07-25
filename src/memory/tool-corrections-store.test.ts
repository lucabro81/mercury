import { describe, it, expect } from "bun:test";
import { ensureToolCorrectionsCollection, storeToolCorrection, searchToolCorrectionsByTopic } from "./tool-corrections-store.ts";
import type { QdrantClientLike } from "./episodic-store.ts";

describe("ensureToolCorrectionsCollection", () => {
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

    await ensureToolCorrectionsCollection(client, "tool_corrections", 768);

    expect(created).toEqual({ name: "tool_corrections", params: { vectors: { size: 768, distance: "Cosine" } } });
  });

  it("does not recreate a collection that already exists", async () => {
    let createCalls = 0;
    const client: QdrantClientLike = {
      getCollections: async () => ({ collections: [{ name: "tool_corrections" }] }),
      createCollection: async () => {
        createCalls++;
        return {};
      },
      upsert: async () => ({}),
      search: async () => [],
    };

    await ensureToolCorrectionsCollection(client, "tool_corrections", 768);

    expect(createCalls).toBe(0);
  });
});

describe("storeToolCorrection", () => {
  it("embeds only the topic, not the value, and upserts the full payload", async () => {
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

    await storeToolCorrection(client, "tool_corrections", embed, {
      tool: "jira",
      topic: "select-prefix",
      value: "ogni --select deve iniziare per issues.",
      timestamp: "2026-07-25T12:00:00.000Z",
    });

    expect(upserted?.collection).toBe("tool_corrections");
    const point = upserted!.points[0] as { vector: number[]; payload: Record<string, unknown> };
    expect(point.vector).toEqual([13, 0, 0]); // "select-prefix".length
    expect(point.payload).toEqual({
      tool: "jira",
      topic: "select-prefix",
      value: "ogni --select deve iniziare per issues.",
      timestamp: "2026-07-25T12:00:00.000Z",
    });
  });
});

describe("searchToolCorrectionsByTopic", () => {
  it("embeds the query topic, searches scoped to tool, and maps payloads back", async () => {
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
            score: 0.95,
            payload: { tool: "jira", topic: "select-prefix", value: "v", timestamp: "2026-07-20T09:00:00.000Z" },
          },
        ];
      },
    };
    const embed = async (text: string) => [text.length, 0, 0];

    const results = await searchToolCorrectionsByTopic(client, "tool_corrections", embed, {
      tool: "jira",
      topic: "select-prefix",
    });

    expect(receivedArgs?.collection).toBe("tool_corrections");
    expect(receivedArgs?.params).toEqual({
      vector: [13, 0, 0],
      filter: { must: [{ key: "tool", match: { value: "jira" } }] },
      limit: 5,
    });
    expect(results).toEqual([{ tool: "jira", topic: "select-prefix", value: "v", timestamp: "2026-07-20T09:00:00.000Z" }]);
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

    await searchToolCorrectionsByTopic(client, "tool_corrections", embed, { tool: "jira", topic: "x", limit: 1 });

    expect(receivedLimit).toBe(1);
  });

  it("skips results with a missing or malformed payload instead of throwing", async () => {
    const client: QdrantClientLike = {
      getCollections: async () => ({ collections: [] }),
      createCollection: async () => ({}),
      upsert: async () => ({}),
      search: async () => [
        { id: "p1", score: 0.9, payload: null },
        { id: "p2", score: 0.8, payload: { topic: "x" } },
        { id: "p3", score: 0.7, payload: { tool: "jira", topic: "y", value: "v", timestamp: "2026-07-15T09:00:00.000Z" } },
      ],
    };
    const embed = async () => [0, 0, 0];

    const results = await searchToolCorrectionsByTopic(client, "tool_corrections", embed, { tool: "jira", topic: "x" });

    expect(results).toEqual([{ tool: "jira", topic: "y", value: "v", timestamp: "2026-07-15T09:00:00.000Z" }]);
  });

  it("returns an empty array when nothing matches", async () => {
    const client: QdrantClientLike = {
      getCollections: async () => ({ collections: [] }),
      createCollection: async () => ({}),
      upsert: async () => ({}),
      search: async () => [],
    };
    const embed = async () => [0, 0, 0];

    expect(await searchToolCorrectionsByTopic(client, "tool_corrections", embed, { tool: "jira", topic: "x" })).toEqual([]);
  });
});
