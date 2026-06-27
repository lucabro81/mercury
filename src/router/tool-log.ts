/**
 * Helpers for the terminal channel's tool-call visibility (see
 * `src/index.ts`'s `onStepFinish` wiring): tool results can be
 * arbitrarily large — a single Jira issue search can return tens of KB
 * of raw API JSON — so printing them in full on every turn isn't
 * readable. `truncateForDisplay` bounds what gets printed live;
 * `parseDumpCommand` + `writeDump` back the terminal-only `/dump`
 * command, for when the full untruncated output is actually needed.
 *
 * This module is stateless and doesn't know about turns or sessions —
 * `src/index.ts` owns the per-turn step history and decides when to call
 * these.
 */
import { tmpdir } from "node:os";
import type { StepInfo } from "../session/agent-turn.ts";

/**
 * Stringifies `value` as JSON, truncating to `maxChars` and appending a
 * marker with the real total length and a pointer to `/dump` when it
 * doesn't fit — so a human watching the terminal sees something bounded
 * but still knows more is available and how to get it.
 */
export function truncateForDisplay(value: unknown, maxChars: number): string {
  const json = JSON.stringify(value);
  if (json.length <= maxChars) {
    return json;
  }
  return `${json.slice(0, maxChars)}… (truncated, ${json.length} chars total — run /dump to write the full output to a file)`;
}

/**
 * Builds the file `/dump` writes to when the user doesn't give an
 * explicit path. Lands in the OS temp dir, not the process's cwd — in
 * the Docker image that's `/app`, owned by root, where the `mercury`
 * user can read/execute existing files but not create new ones (every
 * default-path `/dump` failed with EACCES until this). Includes a
 * timestamp (colons/dots replaced since they aren't valid in filenames
 * on every filesystem) so repeated `/dump` calls land in separate files
 * instead of silently overwriting a fixed default each time.
 */
export function defaultDumpPath(now: Date = new Date()): string {
  return `${tmpdir()}/mercury-last-tools-${now.toISOString().replace(/[:.]/g, "-")}.json`;
}

/**
 * Parses a `/dump [path]` command line. Returns null for anything that
 * isn't exactly this command (including regular conversation input, and
 * a slash-prefixed word that merely starts with "dump") — the caller
 * uses this to tell a real command from a message meant for the model.
 * `path` is undefined when none was given — the caller decides the
 * default (see `defaultDumpPath`), since computing "now" here would make
 * this function's output depend on when it happens to run.
 */
export function parseDumpCommand(line: string): { path: string | undefined } | null {
  const match = line.trim().match(/^\/dump(?:\s+(\S+))?$/);
  if (!match) {
    return null;
  }
  return { path: match[1] };
}

/**
 * Writes `steps` to `path` as indented JSON — human-readable, since this
 * is the path a person opens by hand to inspect what a tool actually
 * returned, not something machine-parsed downstream.
 */
export async function writeDump(path: string, steps: StepInfo[]): Promise<void> {
  await Bun.write(path, JSON.stringify(steps, null, 2));
}
