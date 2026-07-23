/**
 * Admin panel's Tool-log tab: a bounded, process-wide history of tool
 * calls across both channels. Nothing today keeps this beyond the current
 * turn (`src/index.ts`'s terminal-only `lastSteps` resets every turn,
 * Google Chat's `onStepFinish` only logs to stderr) — `recordStep` is
 * called additively from both channels' existing `onStepFinish` wiring,
 * changing neither channel's own behavior.
 */
import { truncateForDisplay } from "../router/tool-log.ts";
import type { StepInfo } from "../session/agent-turn.ts";

export type ToolLogChannel = "terminal" | "google-chat";

export type ToolLogEntry = {
  timestamp: string;
  channel: ToolLogChannel;
  toolName: string;
  input: string;
  output: string;
};

const MAX_ENTRIES = 200;
const MAX_CHARS = 2000;

const buffer: ToolLogEntry[] = [];

export function recordStep(channel: ToolLogChannel, step: StepInfo): void {
  for (const call of step.toolCalls) {
    const result = step.toolResults.find((r) => r.toolCallId === call.toolCallId);
    const errorPart = step.content.find((p) => p.type === "tool-error" && p.toolCallId === call.toolCallId);
    const output = result
      ? truncateForDisplay(result.output, MAX_CHARS)
      : errorPart
        ? `[error] ${truncateForDisplay(errorPart.error, MAX_CHARS)}`
        : "(none)";

    buffer.push({
      timestamp: new Date().toISOString(),
      channel,
      toolName: call.toolName,
      input: truncateForDisplay(call.input, MAX_CHARS),
      output,
    });
    if (buffer.length > MAX_ENTRIES) {
      buffer.shift();
    }
  }
}

/** Most recent entries first. */
export function getToolLog(): ToolLogEntry[] {
  return [...buffer].reverse();
}
