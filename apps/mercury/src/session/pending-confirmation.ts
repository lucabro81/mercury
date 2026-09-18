/**
 * Detects a confirm-required staging within a single turn's step: a structured
 * `{pendingConfirmation: true, token, summary}` tool result, distinct from an
 * ordinary success or failure. Two callers: `agent-turn.ts` uses it to stop the
 * tool-calling loop right there (`pendingConfirmationStop`) so the model never
 * gets a further step to comment on it; each provider
 * (`terminal-provider.ts`/`google-chat-provider.ts`) uses it to build its own
 * channel-specific confirmation UI (a printed token, a card) from the same
 * detection — never a message meant to be shown verbatim.
 *
 * The detection is generic: it keys on the `pendingConfirmation` flag any tool
 * may set on its result, not on a specific tool name. The tool that staged the
 * action puts the human-readable `summary` on that result; the core reads it
 * without knowing whether the action was a CLI command or anything else.
 */
import type { StepInfo } from "./step-info.ts";

export type PendingConfirmation = { token: string; summary: string };

/** Returns the first confirm-required staging found in `step` (in tool-call
 * order), or `null` if none. */
export function detectPendingConfirmation(step: StepInfo): PendingConfirmation | null {
  for (const call of step.toolCalls) {
    const result = step.toolResults.find((r) => r.toolCallId === call.toolCallId);
    const output = result?.output as { pendingConfirmation?: unknown; token?: unknown; summary?: unknown } | undefined;
    if (!output || output.pendingConfirmation !== true || typeof output.token !== "string") continue;

    return { token: output.token, summary: typeof output.summary === "string" ? output.summary : "" };
  }
  return null;
}
