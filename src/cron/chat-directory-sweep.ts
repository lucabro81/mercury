/**
 * Proactively resolves every human member of each configured Chat space
 * (GOOGLE_CHAT_SPACES) to {displayName, email} and caches them via
 * writeResolvedNote — same cache resolveSenderName (user-resolution.ts)
 * reads lazily, just pre-populated up front instead of waiting for each
 * person to send a message or falling back to the identity bridge's
 * admin-space notice. One bad space's CLI call is logged and skipped,
 * not fatal to the rest — same "log and continue" convention as every
 * other cron loop in this repo.
 */
import type { runCli } from "../tools/cli-executor.ts";
import type { writeResolvedNote } from "../wiki/wiki-note.ts";

type PersonProfile = {
  resourceName?: string;
  names?: { displayName?: string; metadata?: { primary?: boolean } }[];
  emailAddresses?: { value?: string; metadata?: { primary?: boolean } }[];
};

function pickPrimaryOrFirst<T extends { metadata?: { primary?: boolean } }>(entries: T[]): T | undefined {
  return entries.find((e) => e.metadata?.primary) ?? entries[0];
}

/** Mirrors the real Chat user id format (`users/<id>`, same as `sender.name`) from the People API's `people/<id>`. */
function toChatUserId(resourceName: string): string {
  return resourceName.replace(/^people\//, "users/");
}

export type SpaceSweepResult =
  | { space: string; resolved: number; skipped: number }
  | { space: string; error: string };

async function sweepOneSpace(
  space: string,
  deps: {
    vaultPath: string;
    runCliFn: typeof runCli;
    writeResolvedNoteFn: typeof writeResolvedNote;
    now?: () => Date;
  },
): Promise<{ resolved: number; skipped: number }> {
  const result = await deps.runCliFn("google-chat", ["spaces", "members", "list", "--space", space, "--select-all"]);
  if (!result.ok) {
    throw new Error(result.error);
  }
  const data = result.data as { members?: PersonProfile[] };
  const members = data.members ?? [];
  const resolvedAt = (deps.now?.() ?? new Date()).toISOString();

  let resolved = 0;
  let skipped = 0;
  for (const member of members) {
    const primaryName = pickPrimaryOrFirst(member.names ?? []);
    if (!primaryName?.displayName || !member.resourceName) {
      skipped++;
      continue;
    }
    const primaryEmail = pickPrimaryOrFirst(member.emailAddresses ?? []);
    await deps.writeResolvedNoteFn(
      deps.vaultPath,
      toChatUserId(member.resourceName),
      { resolvedAt, email: primaryEmail?.value ?? null },
      primaryName.displayName,
    );
    resolved++;
  }
  return { resolved, skipped };
}

/** Sweeps every space in `spaces`, one at a time — a failure on one space is logged and doesn't stop the rest. */
export async function sweepChatDirectory(
  spaces: string[],
  deps: {
    vaultPath: string;
    runCliFn: typeof runCli;
    writeResolvedNoteFn: typeof writeResolvedNote;
    now?: () => Date;
    log?: (msg: string) => void;
  },
): Promise<SpaceSweepResult[]> {
  const log = deps.log ?? ((msg: string) => console.error(msg));
  const results: SpaceSweepResult[] = [];

  for (const space of spaces) {
    try {
      const { resolved, skipped } = await sweepOneSpace(space, deps);
      results.push({ space, resolved, skipped });
    } catch (err) {
      const message = String(err instanceof Error ? err.message : err);
      log(`[chat-directory-sweep] ${space} failed: ${message}`);
      results.push({ space, error: message });
    }
  }

  return results;
}
