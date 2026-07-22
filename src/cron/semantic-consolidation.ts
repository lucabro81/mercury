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
import type { writeInferredNote } from "../wiki/wiki-note.ts";
import type { SemanticFactEntry } from "../memory/semantic-facts-store.ts";

type ClusterFn = (userId: string, topic: string, limit: number) => Promise<SemanticFactEntry[]>;
type Confidence = "low" | "medium" | "high";

export type ConsolidationDeps = {
  vaultPath: string;
  clusterFn: ClusterFn;
  readWikiFileFn: typeof readWikiFile;
  writeInferredNoteFn: typeof writeInferredNote;
  k: number;
  confidenceForCount: (dominantCount: number, k: number) => Confidence;
  now?: () => string;
};

function dominantValue(entries: SemanticFactEntry[]): { value: string; supportingTimestamps: string[] } | null {
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

/** Re-clusters `topic` for `userId`, and promotes the dominant value to a wiki note if it beats the current incumbent's count. No-op if the cluster is empty or has no single dominant value. */
export async function consolidateSemanticFact(userId: string, topic: string, deps: ConsolidationDeps): Promise<void> {
  const cluster = (await deps.clusterFn(userId, topic, deps.k)).filter((e) => e.topic === topic);

  const dominant = dominantValue(cluster);
  if (!dominant) {
    return;
  }

  const incumbentCount = await readIncumbentCount(deps, userId, topic);
  if (dominant.supportingTimestamps.length <= incumbentCount) {
    return;
  }

  const now = deps.now ?? (() => new Date().toISOString());
  await deps.writeInferredNoteFn(
    deps.vaultPath,
    userId,
    topic,
    {
      confidence: deps.confidenceForCount(dominant.supportingTimestamps.length, deps.k),
      derived_from: dominant.supportingTimestamps,
      last_reviewed: now(),
    },
    dominant.value,
  );
}
