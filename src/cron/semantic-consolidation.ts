/**
 * Deterministic promotion of clustered semantic facts to a standing wiki
 * note — the consolidation half of D-22/D-34, paired with
 * `semantic-fact-extractor.ts` (the LLM half, which only ever proposes
 * candidate facts). Zero model judgment here: given the last `k`
 * occurrences of a topic for a user, count the most common value and
 * compare it against whatever's already written at
 * `inferred/users/<userId>/<topic>.md` — write only if the challenger's
 * count strictly exceeds the incumbent's (never on a tie, and never when
 * no single value is unambiguously dominant in the current window).
 */
import { parse as parseYaml } from "yaml";
import type { readWikiFile } from "../wiki/wiki-read.ts";
import type { writeInferredNote, writeToolCorrectionNote } from "../wiki/wiki-note.ts";
import type { SemanticFactEntry } from "../memory/semantic-facts-store.ts";
import type { ToolCorrectionEntry } from "../memory/tool-corrections-store.ts";

type ClusterFn = (userId: string, topic: string, limit: number) => Promise<SemanticFactEntry[]>;
type Confidence = "low" | "medium" | "high";

export type ConsolidationDeps = {
  vaultPath: string;
  clusterFn: ClusterFn;
  readWikiFileFn: typeof readWikiFile;
  writeInferredNoteFn: typeof writeInferredNote;
  k?: number;
  confidenceForCount?: (dominantCount: number, k: number) => Confidence;
  now?: () => string;
};

type ToolCorrectionClusterFn = (tool: string, topic: string, limit: number) => Promise<ToolCorrectionEntry[]>;

/**
 * Same shape as `ConsolidationDeps`, keyed by `tool` instead of `userId` —
 * `readNoteFn`/`writeNoteFn` deliberately don't take a userId at all
 * (unlike `readWikiFileFn`/`writeInferredNoteFn` above): a procedural
 * correction lives under `curated/standards/`, visible to every session
 * regardless of who asks, never scoped to one user's own
 * `inferred/users/<userId>/`.
 */
export type ToolCorrectionConsolidationDeps = {
  vaultPath: string;
  clusterFn: ToolCorrectionClusterFn;
  readNoteFn: (vaultPath: string, relativePath: string) => Promise<string>;
  writeNoteFn: typeof writeToolCorrectionNote;
  k?: number;
  confidenceForCount?: (dominantCount: number, k: number) => Confidence;
  now?: () => string;
};

/** Window size for consolidation — how many recent occurrences of a topic to consider. Uncalibrated: chosen without real usage data, to revisit once there's actual traffic to tune against. */
export const DEFAULT_CONSOLIDATION_K = 3;

/**
 * Uncalibrated confidence bands, count relative to `k`: a single
 * occurrence is unconfirmed (low); repeated but not unanimous within the
 * tracked window is medium; the dominant value filling the whole window
 * is high. Same "revisit with real usage" caveat as `DEFAULT_CONSOLIDATION_K`.
 */
export function defaultConfidenceForCount(dominantCount: number, k: number): Confidence {
  if (dominantCount >= k) {
    return "high";
  }
  if (dominantCount > 1) {
    return "medium";
  }
  return "low";
}

// Generic over anything shaped like {value, timestamp} — both
// SemanticFactEntry and ToolCorrectionEntry satisfy this structurally,
// reused by consolidateSemanticFact and consolidateToolCorrection alike.
function dominantValue(
  entries: Array<{ value: string; timestamp: string }>,
): { value: string; supportingTimestamps: string[] } | null {
  const byValue = new Map<string, string[]>();
  for (const e of entries) {
    const timestamps = byValue.get(e.value) ?? [];
    timestamps.push(e.timestamp);
    byValue.set(e.value, timestamps);
  }

  let best: { value: string; timestamps: string[] } | null = null;
  let tie = false;
  for (const [value, timestamps] of byValue) {
    if (!best || timestamps.length > best.timestamps.length) {
      best = { value, timestamps };
      tie = false;
    } else if (timestamps.length === best.timestamps.length) {
      tie = true;
    }
  }

  if (!best || tie) {
    return null;
  }
  return { value: best.value, supportingTimestamps: best.timestamps };
}

async function readIncumbentCount(deps: ConsolidationDeps, userId: string, topic: string): Promise<number> {
  let text: string;
  try {
    text = await deps.readWikiFileFn(deps.vaultPath, userId, `inferred/users/${userId}/${topic}.md`);
  } catch {
    return 0;
  }

  const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!match) {
    return 0;
  }
  const frontmatter = parseYaml(match[1] as string) as { derived_from?: unknown };
  return Array.isArray(frontmatter.derived_from) ? frontmatter.derived_from.length : 0;
}

/**
 * Re-clusters `topic` for `userId`, and promotes the dominant value to a
 * wiki note if it beats the current incumbent's count. No-op if the
 * cluster is empty or has no single dominant value.
 *
 * `userId` here is Qdrant's own storage form (e.g. `"users/42"`, a raw
 * Google Chat resource name) — `clusterFn` above searches with it as-is,
 * matching how `storeSemanticFact` wrote it. The wiki's
 * `inferred/users/<userId>/` convention expects a different,
 * `encodeURIComponent`-encoded form instead (the same one
 * `writeResolvedNote`/the model's own wiki tools already use) — a raw
 * userId containing "/" would otherwise be rejected outright by
 * `writeInferredNote`'s own path-separator guard, and even without that
 * guard would land in a directory the model's wiki tools never look at.
 * Two different representations of the same identity, for two different
 * purposes — `wikiUserId` below is used only for the wiki-facing calls,
 * never for `clusterFn`.
 */
export async function consolidateSemanticFact(userId: string, topic: string, deps: ConsolidationDeps): Promise<void> {
  const k = deps.k ?? DEFAULT_CONSOLIDATION_K;
  const confidenceForCount = deps.confidenceForCount ?? defaultConfidenceForCount;
  const cluster = (await deps.clusterFn(userId, topic, k)).filter((e) => e.topic === topic);

  const dominant = dominantValue(cluster);
  if (!dominant) {
    return;
  }

  const wikiUserId = encodeURIComponent(userId);
  const incumbentCount = await readIncumbentCount(deps, wikiUserId, topic);
  if (dominant.supportingTimestamps.length <= incumbentCount) {
    return;
  }

  const now = deps.now ?? (() => new Date().toISOString());
  await deps.writeInferredNoteFn(
    deps.vaultPath,
    wikiUserId,
    topic,
    {
      confidence: confidenceForCount(dominant.supportingTimestamps.length, k),
      derived_from: dominant.supportingTimestamps,
      last_reviewed: now(),
    },
    dominant.value,
  );
}

async function readToolCorrectionIncumbentCount(
  deps: ToolCorrectionConsolidationDeps,
  tool: string,
  topic: string,
): Promise<number> {
  let text: string;
  try {
    // Full vault-root-relative path, matching how readWikiFileInRoots (the
    // real implementation) resolves it — always against the vault root,
    // never against whichever specific root in the allowed list happens to
    // match (same convention readIncumbentCount above uses for
    // inferred/users/<userId>/<topic>.md).
    text = await deps.readNoteFn(deps.vaultPath, `curated/standards/${tool}-${topic}.md`);
  } catch {
    return 0;
  }

  const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!match) {
    return 0;
  }
  const frontmatter = parseYaml(match[1] as string) as { derived_from?: unknown };
  return Array.isArray(frontmatter.derived_from) ? frontmatter.derived_from.length : 0;
}

/**
 * Same promotion logic as `consolidateSemanticFact` — re-clusters `topic`
 * for `tool`, promotes the dominant value if it beats the incumbent's
 * count — but keyed by `tool` (a CLI, not a person) and writing to
 * `curated/standards/<tool>-<topic>.md` (global) instead of
 * `inferred/users/<userId>/<topic>.md` (per-user). No userId encoding
 * needed here: a tool name (e.g. "jira") never contains a path separator.
 */
export async function consolidateToolCorrection(
  tool: string,
  topic: string,
  deps: ToolCorrectionConsolidationDeps,
): Promise<void> {
  const k = deps.k ?? DEFAULT_CONSOLIDATION_K;
  const confidenceForCount = deps.confidenceForCount ?? defaultConfidenceForCount;
  const cluster = (await deps.clusterFn(tool, topic, k)).filter((e) => e.topic === topic);

  const dominant = dominantValue(cluster);
  if (!dominant) {
    return;
  }

  const incumbentCount = await readToolCorrectionIncumbentCount(deps, tool, topic);
  if (dominant.supportingTimestamps.length <= incumbentCount) {
    return;
  }

  const now = deps.now ?? (() => new Date().toISOString());
  await deps.writeNoteFn(
    deps.vaultPath,
    tool,
    topic,
    {
      confidence: confidenceForCount(dominant.supportingTimestamps.length, k),
      derived_from: dominant.supportingTimestamps,
      last_reviewed: now(),
    },
    dominant.value,
  );
}
