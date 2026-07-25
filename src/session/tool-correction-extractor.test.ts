import { describe, it, expect } from "bun:test";
import { createToolCorrectionExtractor, type ProceduralCorrection } from "./tool-correction-extractor.ts";
import type { LanguageModel } from "ai";
import type { StepInfo } from "./agent-turn.ts";

const MODEL = "fake-model" as unknown as LanguageModel;

function runCommandCall(toolCallId: string, command: string) {
  return { toolCallId, toolName: "runCommand", input: { command } };
}

function runCommandResult(toolCallId: string, output: { ok: boolean; error?: string; data?: unknown }) {
  return { toolCallId, toolName: "runCommand", output };
}

function step(toolCalls: StepInfo["toolCalls"], toolResults: StepInfo["toolResults"]): StepInfo {
  return { toolCalls, toolResults, content: [] };
}

describe("createToolCorrectionExtractor", () => {
  it("pairs a failed call with the next successful call for the same binary, and asks the model to describe the correction", async () => {
    const steps: StepInfo[] = [
      step(
        [runCommandCall("1", 'jira issue search --jql "x" --fields summary')],
        [runCommandResult("1", { ok: false, error: "refusing to print without --select" })],
      ),
      step(
        [runCommandCall("2", 'jira issue search --jql "x" --select issues.key')],
        [runCommandResult("2", { ok: true, data: {} })],
      ),
    ];

    let receivedPrompt: string | undefined;
    const generateObjectFn = async (params: { prompt: string }) => {
      receivedPrompt = params.prompt;
      return { object: [{ topic: "select-prefix", value: "ogni --select deve iniziare per issues." }] };
    };

    const extract = createToolCorrectionExtractor(MODEL, generateObjectFn);
    const result = await extract(steps);

    expect(result).toEqual([
      { tool: "jira", topic: "select-prefix", value: "ogni --select deve iniziare per issues." },
    ]);
    expect(receivedPrompt).toContain('jira issue search --jql "x" --fields summary');
    expect(receivedPrompt).toContain("refusing to print without --select");
    expect(receivedPrompt).toContain('jira issue search --jql "x" --select issues.key');
  });

  it("does not pair a failure with a success from a different binary", async () => {
    const steps: StepInfo[] = [
      step([runCommandCall("1", "jira issue search --jql x")], [runCommandResult("1", { ok: false, error: "e" })]),
      step([runCommandCall("2", "bitbucket pr list")], [runCommandResult("2", { ok: true, data: {} })]),
    ];

    let calls = 0;
    const generateObjectFn = async () => {
      calls++;
      return { object: [] };
    };

    const extract = createToolCorrectionExtractor(MODEL, generateObjectFn);
    const result = await extract(steps);

    expect(calls).toBe(0);
    expect(result).toEqual([]);
  });

  it("returns nothing when a failure is never followed by a success for the same binary", async () => {
    const steps: StepInfo[] = [
      step([runCommandCall("1", "jira issue search --jql x")], [runCommandResult("1", { ok: false, error: "e" })]),
    ];

    let calls = 0;
    const generateObjectFn = async () => {
      calls++;
      return { object: [] };
    };

    const extract = createToolCorrectionExtractor(MODEL, generateObjectFn);
    const result = await extract(steps);

    expect(calls).toBe(0);
    expect(result).toEqual([]);
  });

  it("returns nothing when every call already succeeded (no failure to learn from)", async () => {
    const steps: StepInfo[] = [
      step([runCommandCall("1", "jira issue search --jql x --select-all")], [runCommandResult("1", { ok: true, data: {} })]),
    ];

    const generateObjectFn = async () => ({ object: [] });
    const extract = createToolCorrectionExtractor(MODEL, generateObjectFn);
    const result = await extract(steps);

    expect(result).toEqual([]);
  });

  it("lets the model decide a candidate pair isn't a real correction, by returning an empty array", async () => {
    const steps: StepInfo[] = [
      step([runCommandCall("1", "jira issue search --jql x")], [runCommandResult("1", { ok: false, error: "e" })]),
      step([runCommandCall("2", "jira issue search --jql y")], [runCommandResult("2", { ok: true, data: {} })]),
    ];

    const generateObjectFn = async () => ({ object: [] });
    const extract = createToolCorrectionExtractor(MODEL, generateObjectFn);
    const result = await extract(steps);

    expect(result).toEqual([]);
  });

  it("normalizes the topic returned by the model", async () => {
    const steps: StepInfo[] = [
      step([runCommandCall("1", "jira issue search --jql x")], [runCommandResult("1", { ok: false, error: "e" })]),
      step([runCommandCall("2", "jira issue search --jql x --select issues.key")], [runCommandResult("2", { ok: true, data: {} })]),
    ];

    const generateObjectFn = async () => ({ object: [{ topic: "  Select Prefix  ", value: "v" }] });
    const extract = createToolCorrectionExtractor(MODEL, generateObjectFn);
    const result = await extract(steps);

    expect(result).toEqual([{ tool: "jira", topic: "select-prefix", value: "v" }]);
  });

  it("ignores tool calls other than runCommand", async () => {
    const steps: StepInfo[] = [
      step(
        [{ toolCallId: "1", toolName: "read_file", input: { path: "x" } }],
        [{ toolCallId: "1", toolName: "read_file", output: { ok: false, error: "nope" } }],
      ),
      step(
        [{ toolCallId: "2", toolName: "read_file", input: { path: "y" } }],
        [{ toolCallId: "2", toolName: "read_file", output: { ok: true, content: "hi" } }],
      ),
    ];

    let calls = 0;
    const generateObjectFn = async () => {
      calls++;
      return { object: [] };
    };

    const extract = createToolCorrectionExtractor(MODEL, generateObjectFn);
    const result = await extract(steps);

    expect(calls).toBe(0);
    expect(result).toEqual([]);
  });

  it("a generateObjectFn failure for one pair is caught and logged, doesn't stop other pairs", async () => {
    const steps: StepInfo[] = [
      step([runCommandCall("1", "jira issue search --jql x")], [runCommandResult("1", { ok: false, error: "e" })]),
      step([runCommandCall("2", "jira issue search --jql x --select issues.key")], [runCommandResult("2", { ok: true, data: {} })]),
      step([runCommandCall("3", "bitbucket pr list --bad")], [runCommandResult("3", { ok: false, error: "e2" })]),
      step([runCommandCall("4", "bitbucket pr list")], [runCommandResult("4", { ok: true, data: {} })]),
    ];

    let call = 0;
    const generateObjectFn = async () => {
      call++;
      if (call === 1) throw new Error("model unreachable");
      return { object: [{ topic: "list-flag", value: "no --bad flag" }] };
    };

    const loggedMessages: string[] = [];
    const extract = createToolCorrectionExtractor(MODEL, generateObjectFn, { log: (msg) => loggedMessages.push(msg) });
    const result = await extract(steps);

    expect(result).toEqual([{ tool: "bitbucket", topic: "list-flag", value: "no --bad flag" }]);
    expect(loggedMessages.some((m) => m.includes("model unreachable"))).toBe(true);
  });
});
