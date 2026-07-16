/**
 * Read-side access to the wiki vault: listing, reading, and searching.
 * Every function is scoped to `curated/` (visible to everyone) plus
 * `inferred/users/<userId>/` for the *calling* userId only — never
 * another user's semantic notes (D-15's per-user isolation, applied to
 * Layer 2 the same way it already applies to Layer 3/Qdrant). Plain
 * functions, not model-invocable tools — wiki-tools.ts wraps a subset of
 * these in `tool()` for the model, same split as
 * cli-executor.ts/cli-tool.ts.
 */
import { readFile, stat } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";

async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function allowedRoots(vaultPath: string, userId: string): string[] {
  const vaultRoot = resolve(vaultPath);
  return [resolve(vaultRoot, "curated"), resolve(vaultRoot, "inferred", "users", userId)];
}

/**
 * Resolves `relativePath` against the vault and checks it falls under
 * one of the caller's allowed roots (curated/, or their own
 * inferred/users/<userId>/) — rejects both vault escape (`..`) and
 * cross-user access to someone else's inferred notes.
 */
function resolveAllowedWikiPath(vaultPath: string, userId: string, relativePath: string): string {
  const vaultRoot = resolve(vaultPath);
  const target = resolve(vaultRoot, relativePath);
  const roots = allowedRoots(vaultPath, userId);
  const allowed = roots.some((root) => target === root || target.startsWith(root + sep));
  if (!allowed) {
    throw new Error(`path not accessible: ${relativePath}`);
  }
  return target;
}

async function listFilesUnder(root: string, vaultRoot: string): Promise<string[]> {
  if (!(await pathExists(root))) return [];
  const glob = new Bun.Glob("**/*.md");
  const results: string[] = [];
  for await (const rel of glob.scan({ cwd: root })) {
    results.push(relative(vaultRoot, join(root, rel)));
  }
  return results;
}

/** Lists every `.md` file visible to `userId`: all of curated/, plus only their own inferred/users/<userId>/. */
export async function listWikiFiles(vaultPath: string, userId: string): Promise<string[]> {
  const vaultRoot = resolve(vaultPath);
  const roots = allowedRoots(vaultPath, userId);
  const lists = await Promise.all(roots.map((root) => listFilesUnder(root, vaultRoot)));
  return lists.flat().sort();
}

/** Reads a single wiki file. Throws if `relativePath` falls outside the caller's allowed scope. */
export async function readWikiFile(vaultPath: string, userId: string, relativePath: string): Promise<string> {
  const fullPath = resolveAllowedWikiPath(vaultPath, userId, relativePath);
  return readFile(fullPath, "utf-8");
}

export type WikiGrepMatch = { path: string; line: number; text: string };

/** Searches every file visible to `userId` for `pattern` (a regular expression), line by line. */
export async function grepWiki(vaultPath: string, userId: string, pattern: string): Promise<WikiGrepMatch[]> {
  const regex = new RegExp(pattern);
  const files = await listWikiFiles(vaultPath, userId);
  const matches: WikiGrepMatch[] = [];

  for (const file of files) {
    const content = await readWikiFile(vaultPath, userId, file);
    const lines = content.split("\n");
    lines.forEach((text, index) => {
      if (regex.test(text)) {
        matches.push({ path: file, line: index + 1, text });
      }
    });
  }

  return matches;
}
