/**
 * The nightly self-review job's own tool set — distinct from
 * `wiki-tools.ts` (the model-invocable tools a normal conversation gets),
 * same reasoning already applied to `writeInferredNote` never being
 * wired into those: this is a separate trust context (a stateless admin
 * batch job, not a live conversation), scoped via `selfReviewRoots`
 * (curated/ + raw/, never inferred/ — off-limits to any LLM-judgment
 * writer per D-22/D-34) and with capabilities no conversational tool
 * has (deleting an entry, rewriting the index).
 *
 * All three nightly sub-passes (`self-review-runner.ts`) share this
 * exact tool set — they differ only in system prompt and pre-computed
 * input data, not in which tools they can call.
 */
import { tool } from "ai";
import { z } from "zod";
import { listWikiFilesInRoots, readWikiFileInRoots, grepWikiInRoots, selfReviewRoots } from "./wiki-read.ts";
import { writeCuratedNote, writeIndexFile, deleteRawEntry, deleteCuratedEntry } from "./wiki-note.ts";

export type SelfReviewToolsDeps = { vaultPath: string };

export function createSelfReviewTools(deps: SelfReviewToolsDeps) {
  const { vaultPath } = deps;
  const roots = selfReviewRoots(vaultPath);

  const list_files = tool({
    description: "List every file under curated/ and raw/ (never inferred/). Returns paths relative to the vault root.",
    inputSchema: z.object({}),
    execute: async () => {
      const files = await listWikiFilesInRoots(vaultPath, roots);
      return { ok: true as const, files };
    },
  });

  const read_file = tool({
    description: 'Read a file by path, e.g. "curated/standards/x.md" or "raw/notes/y.md". Only curated/ and raw/ are readable.',
    inputSchema: z.object({ path: z.string().min(1) }),
    execute: async ({ path }) => {
      try {
        const content = await readWikiFileInRoots(vaultPath, roots, path);
        return { ok: true as const, content };
      } catch (err) {
        return { ok: false as const, error: String(err) };
      }
    },
  });

  const grep = tool({
    description: "Search curated/ and raw/ files for a regular expression pattern. Returns matching lines with their file path and line number.",
    inputSchema: z.object({ pattern: z.string().min(1) }),
    execute: async ({ pattern }) => {
      try {
        const matches = await grepWikiInRoots(vaultPath, roots, pattern);
        return { ok: true as const, matches };
      } catch (err) {
        return { ok: false as const, error: String(err) };
      }
    },
  });

  const write_curated = tool({
    description: 'Create or overwrite a curated doc. "path" is relative to curated/, e.g. "standards/jira-fields.md".',
    inputSchema: z.object({ path: z.string().min(1), content: z.string() }),
    execute: async ({ path, content }) => {
      try {
        await writeCuratedNote(vaultPath, path, {}, content);
        return { ok: true as const };
      } catch (err) {
        return { ok: false as const, error: String(err) };
      }
    },
  });

  const write_index = tool({
    description: "Overwrite index.md at the vault root with the given content — one line per curated doc, short description.",
    inputSchema: z.object({ content: z.string() }),
    execute: async ({ content }) => {
      try {
        await writeIndexFile(vaultPath, content);
        return { ok: true as const };
      } catch (err) {
        return { ok: false as const, error: String(err) };
      }
    },
  });

  const delete_raw = tool({
    description: 'Delete a raw/ entry once it has been triaged (merged, promoted, or discarded). "path" must start with "raw/".',
    inputSchema: z.object({ path: z.string().min(1) }),
    execute: async ({ path }) => {
      if (!path.startsWith("raw/")) {
        return { ok: false as const, error: `path must start with "raw/" (got "${path}")` };
      }
      try {
        await deleteRawEntry(vaultPath, path.slice("raw/".length));
        return { ok: true as const };
      } catch (err) {
        return { ok: false as const, error: String(err) };
      }
    },
  });

  const delete_curated = tool({
    description: 'Delete a curated doc that is redundant or superseded. "path" must start with "curated/". Remove its index.md line too, if it has one.',
    inputSchema: z.object({ path: z.string().min(1) }),
    execute: async ({ path }) => {
      if (!path.startsWith("curated/")) {
        return { ok: false as const, error: `path must start with "curated/" (got "${path}")` };
      }
      try {
        await deleteCuratedEntry(vaultPath, path.slice("curated/".length));
        return { ok: true as const };
      } catch (err) {
        return { ok: false as const, error: String(err) };
      }
    },
  });

  return { list_files, read_file, grep, write_curated, write_index, delete_raw, delete_curated };
}
