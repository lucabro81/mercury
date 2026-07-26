import { describe, it, expect } from "bun:test";
import { detectPendingConfirmation } from "./pending-confirmation.ts";
import type { StepInfo } from "./agent-turn.ts";

function runCommandCall(toolCallId: string, command: string) {
  return { toolCallId, toolName: "runCommand", input: { command } };
}

function runCommandResult(toolCallId: string, output: unknown) {
  return { toolCallId, toolName: "runCommand", output };
}

function step(toolCalls: StepInfo["toolCalls"], toolResults: StepInfo["toolResults"]): StepInfo {
  return { toolCalls, toolResults, content: [] };
}

describe("detectPendingConfirmation", () => {
  it("extracts token and command from a confirm-required runCommand result", () => {
    const s = step(
      [runCommandCall("1", "jira issue delete KAN-1 --confirm")],
      [runCommandResult("1", { ok: false, pendingConfirmation: true, token: "TOK1", error: "..." })],
    );

    expect(detectPendingConfirmation(s)).toEqual({ token: "TOK1", command: "jira issue delete KAN-1 --confirm" });
  });

  it("returns null when there's no runCommand call at all", () => {
    const s = step([{ toolCallId: "1", toolName: "list_files", input: {} }], [runCommandResult("1", { ok: true, files: [] })]);

    expect(detectPendingConfirmation(s)).toBeNull();
  });

  it("returns null when the runCommand result is an ordinary success (no pendingConfirmation)", () => {
    const s = step(
      [runCommandCall("1", "jira issue search --jql x --select issues.key")],
      [runCommandResult("1", { ok: true, data: {} })],
    );

    expect(detectPendingConfirmation(s)).toBeNull();
  });

  it("returns null when the runCommand result is an ordinary failure (no pendingConfirmation)", () => {
    const s = step(
      [runCommandCall("1", "jira issue search --jql x")],
      [runCommandResult("1", { ok: false, error: "refusing to print without --select" })],
    );

    expect(detectPendingConfirmation(s)).toBeNull();
  });

  it("returns null when the call has no matching tool result", () => {
    const s = step([runCommandCall("1", "jira issue delete KAN-1 --confirm")], []);

    expect(detectPendingConfirmation(s)).toBeNull();
  });

  it("returns the first confirm-required staging when a step has more than one runCommand call", () => {
    const s = step(
      [runCommandCall("1", "jira issue search --jql x --select issues.key"), runCommandCall("2", "jira issue delete KAN-1 --confirm")],
      [runCommandResult("1", { ok: true, data: {} }), runCommandResult("2", { ok: false, pendingConfirmation: true, token: "TOK2" })],
    );

    expect(detectPendingConfirmation(s)).toEqual({ token: "TOK2", command: "jira issue delete KAN-1 --confirm" });
  });
});
