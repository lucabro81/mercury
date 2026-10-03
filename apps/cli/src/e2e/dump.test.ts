/**
 * Reading a turn out of the REPL's `/dump` file: the AI SDK's step results,
 * whose `content` holds the tool calls, their results and the final text.
 */
import { describe, expect, test } from "bun:test";
import { turnFromDump } from "./dump.ts";

/** A dump shaped like the one `/dump` writes: three steps, the last one the answer. */
const DUMP = [
  {
    stepNumber: 0,
    content: [
      { type: "reasoning", text: "Load the skill." },
      { type: "tool-call", toolCallId: "a", toolName: "read_skill", input: { name: "jira" } },
      { type: "tool-result", toolCallId: "a", toolName: "read_skill", input: { name: "jira" }, output: { ok: true, data: "…" } },
    ],
  },
  {
    stepNumber: 1,
    content: [
      { type: "tool-call", toolCallId: "b", toolName: "jiraCommand", input: { command: "jira issue get SUP-1" } },
      { type: "tool-result", toolCallId: "b", toolName: "jiraCommand", input: { command: "jira issue get SUP-1" }, output: { ok: false, error: "refusing" } },
      { type: "tool-call", toolCallId: "c", toolName: "jiraCommand", input: { command: "jira issue get SUP-1 --select key" } },
      { type: "tool-error", toolCallId: "c", toolName: "jiraCommand", input: {}, error: "boom" },
    ],
  },
  {
    stepNumber: 2,
    content: [
      { type: "reasoning", text: "Answer." },
      { type: "text", text: "The title is " },
      { type: "text", text: "Login fails." },
    ],
  },
];

describe("turnFromDump", () => {
  test("every tool call in order, with its input, its output and whether it worked", () => {
    expect(turnFromDump(DUMP).calls).toEqual([
      { tool: "read_skill", input: { name: "jira" }, output: { ok: true, data: "…" }, ok: true, pending: false },
      { tool: "jiraCommand", input: { command: "jira issue get SUP-1" }, output: { ok: false, error: "refusing" }, ok: false, pending: false },
      { tool: "jiraCommand", input: { command: "jira issue get SUP-1 --select key" }, output: { error: "boom" }, ok: false, pending: false },
    ]);
  });

  test("the answer is the last step's text, reasoning left out", () => {
    expect(turnFromDump(DUMP).answer).toBe("The title is Login fails.");
  });

  test("a result without ok counts as worked; a call without a result as not", () => {
    const turn = turnFromDump([
      {
        content: [
          { type: "tool-call", toolCallId: "a", toolName: "present", input: { ref: "d1" } },
          { type: "tool-result", toolCallId: "a", toolName: "present", output: "shown" },
          { type: "tool-call", toolCallId: "b", toolName: "jiraCommand", input: { command: "x" } },
        ],
      },
    ]);
    expect(turn.calls.map((c) => c.ok)).toEqual([true, false]);
    expect(turn.calls[1]?.output).toBeUndefined();
  });

  // #131 review: a staged irreversible command answers ok: false with
  // pendingConfirmation, which noFailedCalls counted as a failure.
  test("a command staged for confirmation is pending, not failed", () => {
    const output = { ok: false, pendingConfirmation: true, token: "AB12", summary: "jira issue delete SUP-1" };
    const turn = turnFromDump([
      {
        content: [
          { type: "tool-call", toolCallId: "a", toolName: "jiraCommand", input: { command: "jira issue delete SUP-1" } },
          { type: "tool-result", toolCallId: "a", toolName: "jiraCommand", output },
        ],
      },
    ]);
    expect(turn.calls).toEqual([{ tool: "jiraCommand", input: { command: "jira issue delete SUP-1" }, output, ok: true, pending: true }]);
  });

  test("an empty dump is a turn with no calls and no answer", () => {
    expect(turnFromDump([])).toEqual({ calls: [], answer: "" });
  });

  test("something that isn't a dump is an error", () => {
    expect(() => turnFromDump({ steps: [] })).toThrow("isn't a /dump of steps");
  });
});
