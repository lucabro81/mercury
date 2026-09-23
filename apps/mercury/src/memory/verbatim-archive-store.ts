/**
 * The verbatim conversation archive (issue #4): a durable, lossless
 * Qdrant collection holding the complete user↔model exchange, one point
 * per message, distinct from every other memory layer.
 *
 * How it differs from the neighbours in this directory:
 * - Layer-1 history (`../session/history.ts`) is a sliding window that
 *   summarizes itself away — lossy by design.
 * - The episodic store (`./episodic-store.ts`) captures a *summary* of a
 *   closed session — derived, not raw.
 * This archive instead keeps what was actually said, verbatim, so a later
 * session can resurface it and re-read it in light of new facts. It only
 * ever appends and reads; nothing here evicts (retention bounding is a
 * separate, later concern).
 *
 * Reuses `episodic-store.ts`'s structural `QdrantClientLike` — the same
 * subset of the real client every store in this directory shares.
 */
import type { QdrantClientLike } from "./episodic-store.ts";

/**
 * Creates `collectionName` (cosine distance, `vectorSize`-dim) if it
 * doesn't already exist, then ensures the `userId` keyword payload index
 * regardless — `searchVerbatim` filters by `userId` server-side, and the
 * index keeps that filter usable as the archive grows. Idempotent
 * (Qdrant no-ops re-creating an existing index), so safe to call on every
 * startup, including against a collection created before this existed.
 */
export async function ensureVerbatimCollection(
  client: QdrantClientLike,
  collectionName: string,
  vectorSize: number,
): Promise<void> {
  const { collections } = await client.getCollections();
  if (!collections.some((c) => c.name === collectionName)) {
    await client.createCollection(collectionName, { vectors: { size: vectorSize, distance: "Cosine" } });
  }
  if (client.createPayloadIndex) {
    await client.createPayloadIndex(collectionName, { field_name: "userId", field_schema: "keyword" });
  }
}

/** A single verbatim message as it was emitted in chat. `timestamp` (ISO 8601, ms precision) is the durable ordering key. */
export type VerbatimMessage = {
  userId: string;
  sessionKey: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

/** Embeds `entry.content` and upserts it as a new point in `collectionName`, payload carrying the full verbatim message. */
export async function appendVerbatimMessage(
  client: QdrantClientLike,
  collectionName: string,
  embed: (text: string) => Promise<number[]>,
  entry: VerbatimMessage,
): Promise<void> {
  const vector = await embed(entry.content);
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

/** Narrows an arbitrary payload to a `VerbatimMessage`, rejecting null/malformed points (e.g. from an older schema). */
function isVerbatimMessage(payload: Record<string, unknown> | null): payload is VerbatimMessage {
  return (
    payload !== null &&
    typeof payload.userId === "string" &&
    typeof payload.sessionKey === "string" &&
    (payload.role === "user" || payload.role === "assistant") &&
    typeof payload.content === "string" &&
    typeof payload.timestamp === "string"
  );
}

/**
 * The verbatim messages for a specific user most relevant to `queryText`
 * — e.g. "what did we say about KAN-1 last week". Filtered by `userId` so
 * one user's transcript never leaks into another's. Only reads; returns
 * the raw messages, ordering left to the caller (each carries its own
 * `timestamp`).
 */
export async function searchVerbatim(
  client: QdrantClientLike,
  collectionName: string,
  embed: (text: string) => Promise<number[]>,
  query: { userId: string; queryText: string; limit?: number },
): Promise<VerbatimMessage[]> {
  const vector = await embed(query.queryText);
  const results = await client.query(collectionName, {
    query: vector,
    filter: { must: [{ key: "userId", match: { value: query.userId } }] },
    limit: query.limit ?? DEFAULT_SEARCH_LIMIT,
    with_payload: true,
  });
  return results.points.map((r) => r.payload ?? null).filter(isVerbatimMessage);
}
