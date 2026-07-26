/**
 * Detects a confirm-required `runCommand` staging within a single turn's
 * step (see `cli-tool.ts`'s `confirm-required` branch): a structured
 * `{pendingConfirmation: true, token}` tool result, distinct from an
 * ordinary success or failure. How the user is actually told to confirm
 * is channel-specific (see `terminal-provider.ts`/`google-chat-provider.ts`)
 * — this helper only extracts what a channel needs to build its own
 * confirmation UI, never a message meant to be shown verbatim.
 */
import type { StepInfo } from "./agent-turn.ts";

export type PendingConfirmation = { token: string; command: string };

/** Returns the first confirm-required staging found in `step`, or `null` if none. */
export function detectPendingConfirmation(step: StepInfo): PendingConfirmation | null {
  for (const call of step.toolCalls) {
    if (call.toolName !== "runCommand") continue;
    const input = call.input as { command?: unknown };
    if (typeof input.command !== "string") continue;

    const result = step.toolResults.find((r) => r.toolCallId === call.toolCallId);
    const output = result?.output as { pendingConfirmation?: unknown; token?: unknown } | undefined;
    if (!output || output.pendingConfirmation !== true || typeof output.token !== "string") continue;

    return { token: output.token, command: input.command };
  }
  return null;
}
