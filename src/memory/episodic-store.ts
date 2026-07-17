/**
 * Layer 3 (Qdrant) episodic storage, D-20/D-34: one point per closed,
 * summarized session — a raw, dated "what happened", not an
 * interpretation. Consolidation into semantic memory (D-22/D-34's
 * per-topic promotion into the wiki) is a separate, later concern that
 * reads from this collection; this module only ever writes to it.
 *
 * `QdrantClientLike` describes only the subset of `@qdrant/js-client-rest`'s
 * `QdrantClient` this file actually calls — real client instances satisfy
 * it structurally, tests use a plain object instead of a real connection.
 */
export type QdrantClientLike = {
  getCollections(): Promise<{ collections: Array<{ name: string }> }>;
  createCollection(
    name: string,
    params: { vectors: { size: number; distance: "Cosine" | "Euclid" | "Dot" | "Manhattan" } },
  ): Promise<unknown>;
  upsert(
    name: string,
    params: { points: Array<{ id: string; vector: number[]; payload: Record<string, unknown> }> },
  ): Promise<unknown>;
};

/** Creates `collectionName` (cosine distance, `vectorSize`-dim) if it doesn't already exist — safe to call on every startup. */
export async function ensureEpisodicCollection(
  client: QdrantClientLike,
  collectionName: string,
  vectorSize: number,
): Promise<void> {
  const { collections } = await client.getCollections();
  if (collections.some((c) => c.name === collectionName)) {
    return;
  }
  await client.createCollection(collectionName, { vectors: { size: vectorSize, distance: "Cosine" } });
}

export type EpisodicSummary = {
  userId: string;
  sessionKey: string;
  summary: string;
  timestamp: string;
};

/** Embeds `entry.summary` and upserts it as a new point in `collectionName`, payload carrying the full entry. */
export async function storeEpisodicSummary(
  client: QdrantClientLike,
  collectionName: string,
  embed: (text: string) => Promise<number[]>,
  entry: EpisodicSummary,
): Promise<void> {
  const vector = await embed(entry.summary);
  await client.upsert(collectionName, {
    points: [
      {
        id: crypto.randomUUID(),
        vector,
        payload: { ...entry },
      },
    ],
  });
}
