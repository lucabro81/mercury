/**
 * Typed writers for wiki notes (D-34) — the "template" that takes
 * structured fields instead of a free-form file write: each function
 * validates its fields against the frontmatter schema
 * (frontmatter-schema.ts), serializes YAML frontmatter + markdown body,
 * and writes the result under the vault path (vault-init.ts creates the
 * surrounding curated/inferred directories).
 *
 * These are plain functions, not model-invocable tools — mirrors the
 * split already used for CLIs (cli-executor.ts/command-parser.ts do the
 * work, cli-tool.ts wraps a subset in `tool()` for the model). Whether
 * either of these gets a `tool()` wrapper is a separate, later decision:
 * `writeInferredNote` in particular must stay internal-only, called
 * exclusively by the deterministic consolidation engine (D-34) — never
 * exposed to the model, since that would reopen the LLM-judgment
 * question D-34 closed.
 *
 * Path segments coming from outside Mercury's own code (userId, topic)
 * are resolved and checked against the vault root before any write — a
 * topic string is LLM-produced free text, nothing upstream guarantees
 * it can't contain `..` or `/`.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { resolve, sep, dirname } from "node:path";
import { stringify as stringifyYaml } from "yaml";
import {
  CuratedFrontmatterSchema,
  InferredFrontmatterSchema,
  type CuratedFrontmatter,
  type InferredFrontmatter,
} from "./frontmatter-schema.ts";

/**
 * Resolves `segments` against `root` and checks the result stays inside
 * `root` — not just inside the vault as a whole. `root` must already be
 * the *specific* subtree a given write is scoped to (`curated/`, or one
 * user's `inferred/users/<userId>/`): checking only against the vault
 * root would let a relativePath like `"../inferred/users/x/y.md"` escape
 * `curated/` while still landing somewhere else inside the vault.
 */
function resolveWithinRoot(root: string, ...segments: string[]): string {
  const resolvedRoot = resolve(root);
  const target = resolve(resolvedRoot, ...segments);
  if (target !== resolvedRoot && !target.startsWith(resolvedRoot + sep)) {
    throw new Error(`refusing to write outside ${root}: ${segments.join("/")}`);
  }
  return target;
}

function assertNoPathSeparator(label: string, value: string): void {
  if (value === "" || value.includes("/") || value.includes("\\") || value === "." || value === "..") {
    throw new Error(`invalid ${label}: ${JSON.stringify(value)}`);
  }
}

async function writeNoteFile(
  fullPath: string,
  frontmatter: CuratedFrontmatter | InferredFrontmatter,
  body: string,
): Promise<void> {
  const content = `---\n${stringifyYaml(frontmatter)}---\n\n${body}\n`;
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, content, "utf-8");
}

/** Writes a curated doc at `curated/<relativePath>` (e.g. "standards/jira-fields.md"). */
export async function writeCuratedNote(
  vaultPath: string,
  relativePath: string,
  fields: { author?: string; last_updated?: string },
  body: string,
): Promise<void> {
  const frontmatter = CuratedFrontmatterSchema.parse({ type: "curated", ...fields });
  const curatedRoot = resolve(vaultPath, "curated");
  const fullPath = resolveWithinRoot(curatedRoot, relativePath);
  await writeNoteFile(fullPath, frontmatter, body);
}

/** Writes a semantic note at `inferred/users/<userId>/<topic>.md` (D-34). */
export async function writeInferredNote(
  vaultPath: string,
  userId: string,
  topic: string,
  fields: { confidence: "low" | "medium" | "high"; derived_from: string[]; last_reviewed: string | null },
  body: string,
): Promise<void> {
  assertNoPathSeparator("userId", userId);
  assertNoPathSeparator("topic", topic);
  const frontmatter = InferredFrontmatterSchema.parse({ type: "inferred", source: "agent", ...fields });
  const inferredUserRoot = resolve(vaultPath, "inferred", "users", userId);
  const fullPath = resolveWithinRoot(inferredUserRoot, `${topic}.md`);
  await writeNoteFile(fullPath, frontmatter, body);
}
