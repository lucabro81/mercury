/**
 * Layer 3 (Qdrant) procedural-correction staging — separate collection
 * from `semantic-facts-store.ts`: that one is keyed by userId (a fact
 * about a specific person), this one is keyed by tool (a fact about a
 * CLI, true for whoever uses it next). Kept as its own collection rather
 * than overloading `semantic-facts-store.ts`'s `userId` field with a tool
 * name — a tool name in a field called `userId` would be a standing
 * source of confusion for anyone reading this collection later.
 */
import type { QdrantClientLike } from "./episodic-store.ts";

/** Creates `collectionName` (cosine distance, `vectorSize`-dim) if it doesn't already exist — safe to call on every startup. */
export async function ensureToolCorrectionsCollection(
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

export type ToolCorrectionEntry = {
  tool: string;
  topic: string;
  value: string;
  timestamp: string;
};

/** Embeds `entry.topic` alone (never `topic + value`), same reasoning as `storeSemanticFact` — upserts a new point, never an update-in-place. */
export async function storeToolCorrection(
  client: QdrantClientLike,
  collectionName: string,
  embed: (text: string) => Promise<number[]>,
  entry: ToolCorrectionEntry,
): Promise<void> {
  const vector = await embed(entry.topic);
  await client.upsert(collectionName, {
    points: [{ id: crypto.randomUUID(), vector, payload: { ...entry } }],
  });
}

const DEFAULT_SEARCH_LIMIT = 5;

function isToolCorrectionEntry(payload: Record<string, unknown> | null): payload is ToolCorrectionEntry {
  return (
    payload !== null &&
    typeof payload.tool === "string" &&
    typeof payload.topic === "string" &&
    typeof payload.value === "string" &&
    typeof payload.timestamp === "string"
  );
}

/** Past corrections for a specific tool, clustered by topic similarity — filters by `tool` so one tool's corrections never leak into another's cluster. */
export async function searchToolCorrectionsByTopic(
  client: QdrantClientLike,
  collectionName: string,
  embed: (text: string) => Promise<number[]>,
  query: { tool: string; topic: string; limit?: number },
): Promise<ToolCorrectionEntry[]> {
  const vector = await embed(query.topic);
  const results = await client.search(collectionName, {
    vector,
    filter: { must: [{ key: "tool", match: { value: query.tool } }] },
    limit: query.limit ?? DEFAULT_SEARCH_LIMIT,
  });
  return results.map((r) => r.payload ?? null).filter(isToolCorrectionEntry);
}
