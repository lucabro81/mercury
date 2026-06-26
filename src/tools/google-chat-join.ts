/**
 * Model-invocable tool that lets a user, in any conversation (terminal
 * or a Google Chat space), ask Mercury to start participating in a
 * specific space right away, instead of waiting for the next periodic
 * discovery tick (see `src/router/channels/google-chat-events.ts`).
 *
 * Unlike `jiraCli` or the Google Chat channel transport itself
 * (reading/sending messages, never model-invocable), this genuinely is
 * something the model decides to call, triggered by an explicit user
 * request — "go join space X" is an action, not a transport detail.
 *
 * This does not add Mercury to the space (no such capability exists in
 * the CLI, and arguably shouldn't be something Mercury grants itself) —
 * it assumes Mercury is already a member (added by a human through
 * Chat's own UI) and only starts listening immediately rather than
 * waiting for discovery to notice.
 *
 * Used by: `src/index.ts` (wiring), which only includes this tool in
 * `runTurn`'s `tools` map when the Google Chat channel is actually
 * enabled on this instance (`GOOGLE_CHAT_PUBSUB_TOPIC` set) — same
 * reasoning as `jiraCli` only being wired in when `jira` is enabled.
 */
import { tool } from "ai";
import { z } from "zod";
import type { ChannelManager } from "../router/channels/google-chat-events.ts";

/**
 * Builds the `joinSpace` tool. `ensureChannel` is injected (normally
 * `ChannelManager.ensureChannel` from the running Google Chat channel
 * manager) so this stays testable without a real manager/CLI.
 */
export function createJoinSpaceTool(ensureChannel: ChannelManager["ensureChannel"]) {
  const joinSpace = tool({
    description:
      "Start listening to a Google Chat space immediately, without waiting for periodic discovery. Assumes Mercury is already a member of that space.",
    inputSchema: z.object({ space: z.string() }),
    execute: async ({ space }) => {
      try {
        await ensureChannel(space);
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : String(err) };
      }
    },
  });

  return { joinSpace };
}
