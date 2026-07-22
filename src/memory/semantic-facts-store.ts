/**
 * Layer 3 (Qdrant) semantic facts storage — one collection, separate from
 * `episodic-store.ts`. Episodic points are a raw dated account of a whole
 * session; semantic facts are `{topic, value}` pairs extracted from a
 * session, clustered per user+topic, and deterministically promoted to a
 * standing wiki note. This module only owns the collection lifecycle;
 * extraction, clustering, and promotion are separate concerns built on
 * top of it.
 */
import type { QdrantClientLike } from "./episodic-store.ts";

/** Creates `collectionName` (cosine distance, `vectorSize`-dim) if it doesn't already exist — safe to call on every startup. */
export async function ensureSemanticFactsCollection(
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
