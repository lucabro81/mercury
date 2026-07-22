import { describe, it, expect } from "bun:test";
import { ensureSemanticFactsCollection, storeSemanticFact, searchSemanticFactsByTopic } from "./semantic-facts-store.ts";
import type { QdrantClientLike } from "./episodic-store.ts";

describe("ensureSemanticFactsCollection", () => {
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

    await ensureSemanticFactsCollection(client, "semantic_facts", 768);

    expect(created).toEqual({
      name: "semantic_facts",
      params: { vectors: { size: 768, distance: "Cosine" } },
    });
  });

  it("does not recreate a collection that already exists", async () => {
    let createCalls = 0;
    const client: QdrantClientLike = {
      getCollections: async () => ({ collections: [{ name: "semantic_facts" }] }),
      createCollection: async () => {
        createCalls++;
        return {};
      },
      upsert: async () => ({}),
      search: async () => [],
    };

    await ensureSemanticFactsCollection(client, "semantic_facts", 768);

    expect(createCalls).toBe(0);
  });
});

describe("storeSemanticFact", () => {
  // The vector is embedded on `topic` alone, never `topic + value` — embedding
  // the whole fact would make clustering conflate "same topic, different
  // value" with "different topic entirely", defeating the point of the search.
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

    await storeSemanticFact(client, "semantic_facts", embed, {
      userId: "users/42",
      topic: "preferred-language",
      value: "italiano",
      timestamp: "2026-07-22T12:00:00.000Z",
    });

    expect(upserted?.collection).toBe("semantic_facts");
    expect(upserted?.points).toHaveLength(1);
    const point = upserted!.points[0] as { id: string; vector: number[]; payload: Record<string, unknown> };
    expect(point.vector).toEqual([18, 0, 0]); // "preferred-language".length
    expect(point.payload).toEqual({
      userId: "users/42",
      topic: "preferred-language",
      value: "italiano",
      timestamp: "2026-07-22T12:00:00.000Z",
    });
    expect(typeof point.id).toBe("string");
  });
});

describe("searchSemanticFactsByTopic", () => {
  it("embeds the query topic, searches scoped to userId, and maps payloads back to SemanticFactEntry", async () => {
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
            payload: {
              userId: "users/42",
              topic: "preferred-language",
              value: "italiano",
              timestamp: "2026-07-15T09:00:00.000Z",
            },
          },
        ];
      },
    };
    const embed = async (text: string) => [text.length, 0, 0];

    const results = await searchSemanticFactsByTopic(client, "semantic_facts", embed, {
      userId: "users/42",
      topic: "preferred-language",
    });

    expect(receivedArgs?.collection).toBe("semantic_facts");
    expect(receivedArgs?.params).toEqual({
      vector: [18, 0, 0],
      filter: { must: [{ key: "userId", match: { value: "users/42" } }] },
      limit: 5,
    });
    expect(results).toEqual([
      {
        userId: "users/42",
        topic: "preferred-language",
        value: "italiano",
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

    await searchSemanticFactsByTopic(client, "semantic_facts", embed, { userId: "users/42", topic: "x", limit: 20 });

    expect(receivedLimit).toBe(20);
  });

  it("skips results with a missing or malformed payload instead of throwing", async () => {
    const client: QdrantClientLike = {
      getCollections: async () => ({ collections: [] }),
      createCollection: async () => ({}),
      upsert: async () => ({}),
      search: async () => [
        { id: "p1", score: 0.9, payload: null },
        { id: "p2", score: 0.8, payload: { topic: "x" } }, // missing fields
        {
          id: "p3",
          score: 0.7,
          payload: { userId: "users/42", topic: "team", value: "platform", timestamp: "2026-07-15T09:00:00.000Z" },
        },
      ],
    };
    const embed = async () => [0, 0, 0];

    const results = await searchSemanticFactsByTopic(client, "semantic_facts", embed, { userId: "users/42", topic: "x" });

    expect(results).toEqual([
      { userId: "users/42", topic: "team", value: "platform", timestamp: "2026-07-15T09:00:00.000Z" },
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

    expect(
      await searchSemanticFactsByTopic(client, "semantic_facts", embed, { userId: "users/42", topic: "x" }),
    ).toEqual([]);
  });
});
