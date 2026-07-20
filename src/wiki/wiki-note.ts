/**
 * Typed writers for wiki notes — the "template" that takes
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
 * exclusively by the deterministic consolidation engine — never
 * exposed to the model, since that would reopen the question of letting
 * the LLM decide when to write semantic memory, deliberately kept
 * mechanical/deterministic instead.
 *
 * Path segments coming from outside Mercury's own code (userId, topic)
 * are resolved and checked against the vault root before any write — a
 * topic string is LLM-produced free text, nothing upstream guarantees
 * it can't contain `..` or `/`.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { resolve, sep, dirname, relative } from "node:path";
import { stringify as stringifyYaml } from "yaml";
import {
  CuratedFrontmatterSchema,
  InferredFrontmatterSchema,
  ResolvedFrontmatterSchema,
  type CuratedFrontmatter,
  type InferredFrontmatter,
  type ResolvedFrontmatter,
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

// Mercury's own git identity, passed inline on every commit (`-c
// user.email=...`) rather than relying on global/system git config —
// self-contained, works the same in a fresh dev checkout, in tests, and in
// any deployment, with nothing to set up out-of-band. Distinct from any
// human's own git identity, so `git log --author`/`git blame` cleanly
// separate Mercury's automated writes from a maintainer's — the actual
// provenance mechanism D-16 already relies on, not a schema-level flag.
const MERCURY_GIT_AUTHOR = { email: "mercury@comperio.local", name: "Mercury" };

async function runGit(cwd: string, args: string[]): Promise<void> {
  const proc = Bun.spawn(["git", ...args], { cwd, stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  if (exitCode !== 0) {
    // git prints some failure reasons (e.g. "nothing to commit") to
    // stdout, not stderr — found by hand via the maintenance CLI, where a
    // stderr-only message came back empty and gave no clue what failed.
    throw new Error(`git ${args.join(" ")} failed in ${cwd}: ${stderr || stdout}`);
  }
}

/** True if `git add` staged at least one real change — i.e. there's
 * something for `git commit` to actually record. */
async function hasStagedChanges(cwd: string): Promise<boolean> {
  const proc = Bun.spawn(["git", "diff", "--cached", "--quiet"], { cwd });
  const exitCode = await proc.exited;
  return exitCode !== 0; // --quiet: 0 = no differences, 1 = differences
}

// git add/commit against the same repo aren't safe to run concurrently
// (index lock races) — every writer below shares one vault/repo, so this
// chain is shared across all of them, not per-function. `.then(fn, fn)`
// runs the next write regardless of whether the previous one succeeded or
// failed, so one bad commit doesn't wedge every write after it; the
// rejection itself still propagates to that specific caller via `result`.
// If the file write already landed on disk before a later git step throws
// (disk full, corrupt repo), `writeNoteFile` logs a dedicated
// `[wiki-vault] ... written to disk but not committed` line before
// rethrowing — distinguishable from a generic failure by whatever reads
// stderr (`docker compose logs` today; routed to DECISIONS.md D-35's admin
// space once M4's monitoring exists).
let commitChain: Promise<void> = Promise.resolve();

function serializeCommit<T>(fn: () => Promise<T>): Promise<T> {
  const result = commitChain.then(fn, fn);
  commitChain = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

/**
 * D-16: every vault write is a commit — audit trail + `git revert` as a
 * safety net. The file write itself goes through the same queue as the
 * commit (not just git add/commit) — two writers targeting the same path
 * must never race directly on disk content; queuing only the git half
 * left that race open (found and fixed during M3). This makes "two
 * writers, one path" deterministic (whichever is processed second wins,
 * cleanly) rather than a data-loss race with confusing spurious errors —
 * it does not attempt any merge of old vs new content, by design: nothing
 * here promises the vault is edited "live" merge-safely, only that each
 * write, once it runs, is a clean, whole-file, versioned commit.
 */
async function writeNoteFile(
  vaultPath: string,
  fullPath: string,
  frontmatter: CuratedFrontmatter | InferredFrontmatter | ResolvedFrontmatter,
  body: string,
  commitMessage: string,
): Promise<void> {
  const content = `---\n${stringifyYaml(frontmatter)}---\n\n${body}\n`;

  await serializeCommit(async () => {
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, content, "utf-8");
    const relPath = relative(vaultPath, fullPath);
    try {
      await runGit(vaultPath, ["add", relPath]);
      // Byte-identical content to what's already committed stages no diff —
      // asking the vault to contain X when it already contains exactly X is
      // a no-op, not a failure, so skip the commit instead of letting `git
      // commit` fail with "nothing to commit".
      if (!(await hasStagedChanges(vaultPath))) {
        return;
      }
      await runGit(vaultPath, [
        "-c",
        `user.email=${MERCURY_GIT_AUTHOR.email}`,
        "-c",
        `user.name=${MERCURY_GIT_AUTHOR.name}`,
        "commit",
        "-m",
        commitMessage,
      ]);
    } catch (err) {
      console.error(`[wiki-vault] ${relPath} written to disk but not committed: ${String(err)}`);
      throw err;
    }
  });
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
  await writeNoteFile(vaultPath, fullPath, frontmatter, body, `curated: ${relativePath}`);
}

/** Writes a semantic note at `inferred/users/<userId>/<topic>.md`. */
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
  await writeNoteFile(vaultPath, fullPath, frontmatter, body, `inferred: ${userId}/${topic}`);
}

/**
 * Writes the deterministic id->display-name lookup at
 * `inferred/users/<encoded userId>/resolved-name.md` — always exactly one
 * fact per user (unlike `writeInferredNote`'s LLM-chosen `topic`), so
 * there's no topic parameter, just a fixed filename.
 *
 * Unlike `writeInferredNote`'s `userId` (checked via
 * `assertNoPathSeparator`), this `userId` is a deterministic,
 * Mercury-controlled value that legitimately contains `/` in its normal
 * shape (Google Chat's `users/<id>` resource name) — rejecting it would
 * reject the expected input. It's `encodeURIComponent`-encoded into a
 * single safe path segment instead, so it can never represent more than
 * one directory level regardless of content — the same containment
 * `resolveWithinRoot` already guarantees for every writer here, just
 * arrived at without a separate reject-on-slash check.
 */
export async function writeResolvedNote(
  vaultPath: string,
  userId: string,
  fields: { resolvedAt: string },
  displayName: string,
): Promise<void> {
  const frontmatter = ResolvedFrontmatterSchema.parse({
    type: "resolved",
    source: "api",
    resolved_at: fields.resolvedAt,
    display_name: displayName,
  });
  const inferredUserRoot = resolve(vaultPath, "inferred", "users", encodeURIComponent(userId));
  const fullPath = resolveWithinRoot(inferredUserRoot, "resolved-name.md");
  await writeNoteFile(vaultPath, fullPath, frontmatter, displayName, `resolved: ${userId}`);
}
