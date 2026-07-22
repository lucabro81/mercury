import { describe, it, expect } from "bun:test";
import { ensureSemanticFactsCollection } from "./semantic-facts-store.ts";
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
