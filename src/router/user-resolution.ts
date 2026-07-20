/**
 * Lazy id->display-name resolution for Google Chat senders: the Chat API
 * never exposes a display name on `message.sender` (confirmed live and
 * in official docs), so the first time Mercury sees an unfamiliar
 * `users/<id>`, it resolves it via `getUser` (People API through
 * `google-chat users get`) and caches the result in the wiki vault
 * (`writeResolvedNote`) so later turns hit the cache instead of calling
 * the CLI again.
 *
 * Deliberately NOT routed through `wiki-tools.ts`'s model-facing
 * `read_file`/`grep` tools — there's no proactive loading of vault
 * content into context today, so a lookup the model would have to
 * remember to make on every single turn isn't reliable. This reads the
 * cache directly instead (same "deterministic, not model-decided"
 * philosophy as `confirm-flow.ts`), building the exact same
 * `encodeURIComponent`-encoded path `writeResolvedNote` writes to —
 * `wiki-read.ts`'s own `readWikiFile` assumes `userId` is already a
 * clean single path segment, which a real `users/<id>` sender id isn't,
 * so it can't be reused here as-is.
 *
 * Never throws and never blocks the turn: any failure (CLI error,
 * missing displayName, cross-domain sender) is logged server-side and
 * resolves to `null`, so the caller can just omit the name marker rather
 * than surface a raw id or crash a turn over a nice-to-have.
 */
import { readFile as realReadFile } from "node:fs/promises";
import { parse as parseYaml } from "yaml";
import type { getUser } from "./channels/google-chat-client.ts";
import type { writeResolvedNote } from "../wiki/wiki-note.ts";
import type { runCli } from "../tools/cli-executor.ts";

function resolvedNotePath(vaultPath: string, userId: string): string {
  return `${vaultPath}/inferred/users/${encodeURIComponent(userId)}/resolved-name.md`;
}

async function readCachedDisplayName(
  vaultPath: string,
  userId: string,
  readFileFn: (path: string, encoding: "utf-8") => Promise<string>,
): Promise<string | null> {
  let text: string;
  try {
    text = await readFileFn(resolvedNotePath(vaultPath, userId), "utf-8");
  } catch {
    return null; // cache miss (file doesn't exist yet) — not an error
  }
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!match) {
    return null; // malformed/unexpected content — treat as a miss, don't throw
  }
  const frontmatter = parseYaml(match[1] as string) as { display_name?: unknown };
  return typeof frontmatter.display_name === "string" ? frontmatter.display_name : null;
}

export async function resolveSenderName(
  userId: string,
  deps: {
    vaultPath: string;
    getUserFn: typeof getUser;
    runCliFn: typeof runCli;
    writeResolvedNoteFn: typeof writeResolvedNote;
    readFileFn?: (path: string, encoding: "utf-8") => Promise<string>;
    now?: () => Date;
  },
): Promise<string | null> {
  const readFileFn = deps.readFileFn ?? realReadFile;
  const cached = await readCachedDisplayName(deps.vaultPath, userId, readFileFn);
  if (cached) {
    return cached;
  }

  try {
    const { displayName, email } = await deps.getUserFn(userId, deps.runCliFn);
    const resolvedAt = (deps.now?.() ?? new Date()).toISOString();
    await deps.writeResolvedNoteFn(deps.vaultPath, userId, { resolvedAt, email }, displayName);
    return displayName;
  } catch (err) {
    console.error(`[user-resolution] failed to resolve ${userId}: ${String(err)}`);
    return null;
  }
}
