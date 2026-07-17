/**
 * Model-invocable wiki tools (`list_files`/`read_file`/`write_file`/
 * `grep`, per SPEC.md's Layer 2), wrapping the plain functions in
 * wiki-read.ts and wiki-note.ts in `tool()` — same split as
 * cli-executor.ts/cli-tool.ts for the external CLIs. `write_file` only
 * ever reaches `writeCuratedNote`: `writeInferredNote` is deliberately
 * never wired into a tool here, since inferred/ is written exclusively
 * by the deterministic consolidation engine, never by model
 * choice. Every `execute` returns `{ ok, ... }` instead of throwing, so
 * a rejected/invalid call is a self-correctable model turn, not a
 * crashed tool call.
 */
import { tool } from "ai";
import { z } from "zod";
import { listWikiFiles, readWikiFile, grepWiki } from "./wiki-read.ts";
import { writeCuratedNote } from "./wiki-note.ts";

export type WikiToolsDeps = { vaultPath: string; userId: string };

/** Builds the four wiki tools scoped to `deps.userId` (curated/ fully, only their own inferred/users/<userId>/). */
export function createWikiTools(deps: WikiToolsDeps) {
  const { vaultPath, userId } = deps;

  const list_files = tool({
    description:
      "List every wiki document visible to you: all of curated/ (team knowledge) plus your own inferred/ " +
      "semantic notes for the current user. Other users' inferred notes are never listed. Returns paths " +
      "relative to the vault root.",
    inputSchema: z.object({}),
    execute: async () => {
      const files = await listWikiFiles(vaultPath, userId);
      return { ok: true as const, files };
    },
  });

  const read_file = tool({
    description:
      'Read a wiki document by path (relative to the vault root, e.g. "curated/standards/jira-fields.md" or ' +
      '"inferred/users/<your userId>/some-topic.md"). Only curated/ and your own inferred/ notes are readable.',
    inputSchema: z.object({ path: z.string().min(1) }),
    execute: async ({ path }) => {
      try {
        const content = await readWikiFile(vaultPath, userId, path);
        return { ok: true as const, content };
      } catch (err) {
        return { ok: false as const, error: String(err) };
      }
    },
  });

  const write_file = tool({
    description:
      'Write or update a curated wiki document (team knowledge — conventions, standards, decisions). "path" ' +
      'is relative to curated/, e.g. "standards/jira-fields.md". This can only write under curated/ — your ' +
      "own semantic notes are managed automatically by the memory consolidation process, not through this tool.",
    inputSchema: z.object({ path: z.string().min(1), content: z.string() }),
    execute: async ({ path, content }) => {
      try {
        await writeCuratedNote(vaultPath, path, { last_updated: new Date().toISOString().slice(0, 10) }, content);
        return { ok: true as const };
      } catch (err) {
        return { ok: false as const, error: String(err) };
      }
    },
  });

  const grep = tool({
    description:
      "Search wiki documents (curated/ plus your own inferred/ notes) for a regular expression pattern. " +
      "Returns matching lines with their file path and line number.",
    inputSchema: z.object({ pattern: z.string().min(1) }),
    execute: async ({ pattern }) => {
      try {
        const matches = await grepWiki(vaultPath, userId, pattern);
        return { ok: true as const, matches };
      } catch (err) {
        return { ok: false as const, error: String(err) };
      }
    },
  });

  return { list_files, read_file, write_file, grep };
}
