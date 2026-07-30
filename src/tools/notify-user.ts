/**
 * Model-invocable tool that lets the model message a third party
 * mid-conversation — e.g. "avvisa Marco di questo ticket" while talking to
 * Mercury on a different channel. A plain native AI-SDK tool, same shape
 * as the wiki tools, **not** a CLI string: no real external binary
 * sits behind "send a message," so faking the `runCommand`-style
 * tokenize/allowlist/spawn dance would protect nothing (D-07's rationale —
 * the LLM already knows CLI syntax, zero token waste on schema injection —
 * is about *model-facing external integrations*, not this).
 *
 * Recipient resolution is email-only, not free-text name search: name
 * search needs a Workspace directory lookup, which needs domain-wide
 * delegation, which is confirmed blocked (no super-admin has authorized
 * it) — see the plan this was built from. Reuses `findChatUserByEmail`
 * (`src/cron/identity-bridge.ts`) exactly as the stale-ticket/stale-PR
 * crons already do, rather than inventing a second resolution path.
 */
import { tool } from "ai";
import { z } from "zod";
import type { Notifier } from "../router/provider.ts";
import type { findChatUserByEmail } from "../cron/identity-bridge.ts";

export type NotifyUserToolDeps = {
  notifier: Notifier;
  vaultPath: string;
  findChatUserByEmailFn: typeof findChatUserByEmail;
};

/** Builds the `notifyUser` tool, scoped to `deps.vaultPath`'s cached Chat-user directory. */
export function createNotifyUserTool(deps: NotifyUserToolDeps) {
  const notifyUser = tool({
    description:
      "Send a message to a specific person on Google Chat, identified by their email address — not a name. " +
      "If you only have a first name, ask the user for the person's email before calling this.",
    inputSchema: z.object({ email: z.string().email(), text: z.string() }),
    execute: async ({ email, text }) => {
      const found = await deps.findChatUserByEmailFn(deps.vaultPath, email);
      if (!found) {
        return { ok: false as const, error: `no cached Chat user for "${email}"` };
      }
      const { sessionKey } = await deps.notifier.notify(found.userId, text);
      return { ok: true as const, sessionKey };
    },
  });

  return { notifyUser };
}
