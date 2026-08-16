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

export type SemanticFactEntry = {
  userId: string;
  topic: string;
  value: string;
  timestamp: string;
};

/**
 * Embeds `entry.topic` alone (never `topic + value`) and upserts it as a
 * new point in `collectionName`, payload carrying the full entry. One
 * point per extracted fact, never an update-in-place — consolidation
 * reads the whole history back via `searchSemanticFactsByTopic` and
 * decides what to promote.
 */
export async function storeSemanticFact(
  client: QdrantClientLike,
  collectionName: string,
  embed: (text: string) => Promise<number[]>,
  entry: SemanticFactEntry,
): Promise<void> {
  const vector = await embed(entry.topic);
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

const DEFAULT_SEARCH_LIMIT = 5;

function isSemanticFactEntry(payload: Record<string, unknown> | null): payload is SemanticFactEntry {
  return (
    payload !== null &&
    typeof payload.userId === "string" &&
    typeof payload.topic === "string" &&
    typeof payload.value === "string" &&
    typeof payload.timestamp === "string"
  );
}

/**
 * Past facts for a specific user, clustered by topic similarity — the
 * read side consolidation uses to gather "every occurrence of roughly
 * this topic" before counting a dominant value. Filters by userId so
 * one user's facts never leak into another's cluster.
 */
export async function searchSemanticFactsByTopic(
  client: QdrantClientLike,
  collectionName: string,
  embed: (text: string) => Promise<number[]>,
  query: { userId: string; topic: string; limit?: number },
): Promise<SemanticFactEntry[]> {
  const vector = await embed(query.topic);
  const results = await client.search(collectionName, {
    vector,
    filter: { must: [{ key: "userId", match: { value: query.userId } }] },
    limit: query.limit ?? DEFAULT_SEARCH_LIMIT,
  });
  return results.map((r) => r.payload ?? null).filter(isSemanticFactEntry);
}
