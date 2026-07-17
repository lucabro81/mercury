import { describe, it, expect } from "bun:test";
import { ensureEpisodicCollection, storeEpisodicSummary, type QdrantClientLike } from "./episodic-store.ts";

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
