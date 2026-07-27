/**
 * Detects a confirm-required `runCommand` staging within a single turn's
 * step (see `cli-tool.ts`'s `confirm-required` branch): a structured
 * `{pendingConfirmation: true, token}` tool result, distinct from an
 * ordinary success or failure. Two callers: `agent-turn.ts` uses it to
 * stop the tool-calling loop right there (`pendingConfirmationStop`) so
 * the model never gets a further step to comment on it; each provider
 * (`terminal-provider.ts`/`google-chat-provider.ts`) uses it to build its
 * own channel-specific confirmation UI (a printed token, a card) from the
 * same detection — never a message meant to be shown verbatim.
 */
import type { StepInfo } from "./step-info.ts";

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
