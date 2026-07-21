/**
 * Layer 3 (Qdrant) episodic storage: one point per closed,
 * summarized session — a raw, dated "what happened", not an
 * interpretation. Consolidation into semantic memory (per-topic
 * promotion into the wiki) is a separate, later concern that
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
  search(
    name: string,
    params: { vector: number[]; filter: Record<string, unknown>; limit: number },
  ): Promise<Array<{ id: string | number; score: number; payload?: Record<string, unknown> | null }>>;
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

const DEFAULT_SEARCH_LIMIT = 5;

function isEpisodicSummary(payload: Record<string, unknown> | null): payload is EpisodicSummary {
  return (
    payload !== null &&
    typeof payload.userId === "string" &&
    typeof payload.sessionKey === "string" &&
    typeof payload.summary === "string" &&
    typeof payload.timestamp === "string"
  );
}

/**
 * Past episodic events for a specific user, most relevant to `queryText`
 * (e.g. "notifications about KAN-123") — lets Mercury see how many times
 * it already notified this user about a given item before composing a
 * message. Not a general-purpose semantic consolidation/pattern-extraction
 * engine (that doesn't exist here) — this only ever reads, never writes
 * or promotes anything.
 */
export async function searchEpisodicMemory(
  client: QdrantClientLike,
  collectionName: string,
  embed: (text: string) => Promise<number[]>,
  query: { userId: string; queryText: string; limit?: number },
): Promise<EpisodicSummary[]> {
  const vector = await embed(query.queryText);
  const results = await client.search(collectionName, {
    vector,
    filter: { must: [{ key: "userId", match: { value: query.userId } }] },
    limit: query.limit ?? DEFAULT_SEARCH_LIMIT,
  });
  return results.map((r) => r.payload ?? null).filter(isEpisodicSummary);
}
