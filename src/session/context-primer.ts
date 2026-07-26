/**
 * Builds the synthetic primer text seeded into a brand-new Google Chat
 * session's history (see `history.ts`'s `primer` param): the wiki facts the
 * user's last closed session actually reinforced, plus that same session's
 * own episodic entries. Empty string when there's nothing — enrichment, a
 * caller must work fine without it. Deliberately not similarity retrieval:
 * there's no query yet to compare against at session start, only "what
 * happened last time" (see `getLastSessionEpisodicSummaries`).
 */
import { resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import type { EpisodicSummary } from "../memory/episodic-store.ts";
import type { listWikiFilesInRoots, readWikiFileInRoots } from "../wiki/wiki-read.ts";

export type ContextPrimerDeps = {
  vaultPath: string;
  /** Already scoped to the last closed session's own sessionKey — see `getLastSessionEpisodicSummaries`. */
  getLastSessionEntries: (userId: string) => Promise<EpisodicSummary[]>;
  listWikiFilesInRootsFn: typeof listWikiFilesInRoots;
  readWikiFileInRootsFn: typeof readWikiFileInRoots;
};

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n/;

/** Same frontmatter shape `semantic-consolidation.ts` already parses (`derived_from: string[]`) — only `inferred` notes carry it, a `resolved`/`curated` note yields none. */
function derivedFromTimestamps(text: string): string[] {
  const match = FRONTMATTER_RE.exec(text);
  if (!match) {
    return [];
  }
  const frontmatter = parseYaml(match[1] as string) as { derived_from?: unknown };
  return Array.isArray(frontmatter.derived_from) ? frontmatter.derived_from : [];
}

/** The note's content after its frontmatter block — matches `writeNoteFile`'s `---\n<yaml>---\n\n<body>\n` layout. */
function noteBody(text: string): string {
  const match = FRONTMATTER_RE.exec(text);
  return (match ? text.slice(match[0].length) : text).trim();
}

/**
 * Text of the primer for `userId`, built from injected deps only — never
 * touches Qdrant or the filesystem directly, so tests supply fakes and
 * `index.ts` supplies the real Qdrant-backed episodic query and wiki reads.
 */
export async function buildContextPrimer(userId: string, deps: ContextPrimerDeps): Promise<string> {
  const entries = await deps.getLastSessionEntries(userId);
  if (entries.length === 0) {
    return "";
  }

  const entryTimestamps = new Set(entries.map((e) => e.timestamp));
  const inferredRoot = resolve(deps.vaultPath, "inferred", "users", encodeURIComponent(userId));
  const files = await deps.listWikiFilesInRootsFn(deps.vaultPath, [inferredRoot]);

  const facts: string[] = [];
  for (const file of files) {
    const text = await deps.readWikiFileInRootsFn(deps.vaultPath, [inferredRoot], file);
    const timestamps = derivedFromTimestamps(text);
    if (!timestamps.some((ts) => entryTimestamps.has(ts))) {
      continue;
    }
    const topic = file.split("/").pop()!.replace(/\.md$/, "");
    const body = noteBody(text);
    if (body) {
      facts.push(`${topic}: ${body}`);
    }
  }

  const sections: string[] = [];
  if (facts.length > 0) {
    sections.push(`Known facts:\n${facts.map((f) => `- ${f}`).join("\n")}`);
  }
  sections.push(`Last session:\n${entries.map((e) => `- ${e.summary}`).join("\n")}`);

  return sections.join("\n\n");
}
