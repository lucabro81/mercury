import { describe, it, expect } from "bun:test";
import { runTurn, buildGenerateTextParams, buildStreamTextParams, PENDING_CONFIRMATION_NOTE } from "./agent-turn.ts";
import { createSessionHistory } from "./history.ts";
import type { Message } from "./history.ts";
import type { Tool } from "ai";
import type { StepInfo } from "./step-info.ts";

/** A step that staged a confirm-required command — see pending-confirmation.ts. */
const PENDING_CONFIRMATION_STEP: StepInfo = {
  toolCalls: [{ toolCallId: "1", toolName: "runCommand", input: { command: "jira issue delete KAN-1" } }],
  toolResults: [{ toolCallId: "1", toolName: "runCommand", output: { pendingConfirmation: true, token: "TOK1" } }],
  content: [],
};

/** Mirrors the AI SDK's own `isStopConditionMet`: true if *any* condition in the array is true (confirmed against `node_modules/ai/dist/index.js`'s `.some(result => result)`). */
async function stopConditionsMet(stopWhen: unknown, steps: unknown[]): Promise<boolean> {
  const conditions = stopWhen as Array<(opts: { steps: unknown[] }) => Promise<boolean> | boolean>;
  return (await Promise.all(conditions.map((c) => c({ steps })))).some(Boolean);
}

function neverSummarize(): Promise<string> {
  throw new Error("should not be called in these tests");
}

const SYSTEM = "you are a test assistant";

describe("runTurn", () => {
  it("adds the user input to history before generating", async () => {
    const history = createSessionHistory(neverSummarize);
    let messagesAtGenerateTime: Message[] = [];
    const generateTextFn = async (params: { messages: Message[] }) => {
      messagesAtGenerateTime = params.messages;
      return { text: "ok" };
    };

    await runTurn(history, "hello", {
      model: "fake-model" as never,
      tools: {},
      system: SYSTEM,
      generateTextFn,
    });

    expect(messagesAtGenerateTime).toEqual([{ role: "user", content: "hello" }]);
  });

  it("returns exactly the text produced by the fake generator", async () => {
    const history = createSessionHistory(neverSummarize);
    const generateTextFn = async () => ({ text: "fixed response" });

    const result = await runTurn(history, "hi", {
      model: "fake-model" as never,
      tools: {},
      system: SYSTEM,
      generateTextFn,
    });

    expect(result).toBe("fixed response");
  });

  it("adds the assistant's response to history after generating", async () => {
    const history = createSessionHistory(neverSummarize);
    const generateTextFn = async () => ({ text: "fixed response" });

    await runTurn(history, "hi", {
      model: "fake-model" as never,
      tools: {},
      system: SYSTEM,
      generateTextFn,
    });

    expect(history.getMessages()).toEqual([
      { role: "user", content: "hi" },
      { role: "assistant", content: "fixed response" },
    ]);
  });

  it("passes the provided tools through to the generation call", async () => {
    const history = createSessionHistory(neverSummarize);
    const fakeTool = {} as Tool;
    let receivedTools: Record<string, Tool> | undefined;
    const generateTextFn = async (params: { tools: Record<string, Tool> }) => {
      receivedTools = params.tools;
      return { text: "ok" };
    };

    await runTurn(history, "hi", {
      model: "fake-model" as never,
      tools: { jiraCli: fakeTool },
      system: SYSTEM,
      generateTextFn,
    });

    expect(receivedTools).toEqual({ jiraCli: fakeTool });
  });

  it("passes the provided system prompt through to the generation call unchanged", async () => {
    const history = createSessionHistory(neverSummarize);
    let receivedSystem: string | undefined;
    const generateTextFn = async (params: { system: string }) => {
      receivedSystem = params.system;
      return { text: "ok" };
    };

    await runTurn(history, "hi", {
      model: "fake-model" as never,
      tools: {},
      system: SYSTEM,
      generateTextFn,
    });

    expect(receivedSystem).toBe(SYSTEM);
  });

  // The terminal channel uses this to print tool calls as they happen,
  // since otherwise there's no visibility into what Mercury did before
  // producing a final answer — see src/router/terminal.ts. runTurn wraps
  // the caller's callback (to track the last step for
  // resolveEmptyText/pendingConfirmationStop), so identity isn't
  // preserved — only that a step reaching the wrapper reaches the
  // original too.
  it("forwards each step to the caller's onStepFinish when provided, on the generation path", async () => {
    const history = createSessionHistory(neverSummarize);
    const ordinaryStep: StepInfo = { toolCalls: [], toolResults: [], content: [] };
    const receivedSteps: StepInfo[] = [];
    const generateTextFn = async (params: { onStepFinish?: (step: StepInfo) => void }) => {
      params.onStepFinish?.(ordinaryStep);
      return { text: "ok" };
    };

    await runTurn(history, "hi", {
      model: "fake-model" as never,
      tools: {},
      system: SYSTEM,
      generateTextFn,
      onStepFinish: (step) => receivedSteps.push(step),
    });

    expect(receivedSteps).toEqual([ordinaryStep]);
  });

  // The terminal channel uses onTextChunk to print Mercury's answer as it
  // arrives instead of waiting for the whole thing — see
  // src/router/terminal.ts. Google Chat never sets onTextChunk, so it
  // keeps using the generateTextFn path above unchanged.
  it("streams chunks via onTextChunk and returns the full joined text, when onTextChunk is provided", async () => {
    async function* fakeStream(chunks: string[]) {
      for (const chunk of chunks) {
        yield chunk;
      }
    }
    const history = createSessionHistory(neverSummarize);
    const received: string[] = [];
    const streamTextFn = async () => ({ textStream: fakeStream(["Hel", "lo, ", "world"]) });

    const result = await runTurn(history, "hi", {
      model: "fake-model" as never,
      tools: {},
      system: SYSTEM,
      streamTextFn,
      onTextChunk: (chunk) => received.push(chunk),
    });

    expect(received).toEqual(["Hel", "lo, ", "world"]);
    expect(result).toBe("Hello, world");
  });

  it("records the full joined streamed text as the assistant's message", async () => {
    async function* fakeStream(chunks: string[]) {
      for (const chunk of chunks) {
        yield chunk;
      }
    }
    const history = createSessionHistory(neverSummarize);
    const streamTextFn = async () => ({ textStream: fakeStream(["foo", "bar"]) });

    await runTurn(history, "hi", {
      model: "fake-model" as never,
      tools: {},
      system: SYSTEM,
      streamTextFn,
      onTextChunk: () => {},
    });

    expect(history.getMessages()).toEqual([
      { role: "user", content: "hi" },
      { role: "assistant", content: "foobar" },
    ]);
  });

  it("forwards each step to the caller's onStepFinish when provided, on the streaming path too", async () => {
    async function* fakeStream() {}
    const history = createSessionHistory(neverSummarize);
    const ordinaryStep: StepInfo = { toolCalls: [], toolResults: [], content: [] };
    const receivedSteps: StepInfo[] = [];
    const streamTextFn = async (params: { onStepFinish?: (step: StepInfo) => void }) => {
      params.onStepFinish?.(ordinaryStep);
      return { textStream: fakeStream() };
    };

    await runTurn(history, "hi", {
      model: "fake-model" as never,
      tools: {},
      system: SYSTEM,
      streamTextFn,
      onTextChunk: () => {},
      onStepFinish: (step) => receivedSteps.push(step),
    });

    expect(receivedSteps).toEqual([ordinaryStep]);
  });

  // The terminal channel shows this next to the prompt as a real (not
  // estimated) context-usage indicator — see src/router/tool-log.ts's
  // formatContextUsage and src/index.ts's wiring.
  it("passes the real inputTokens from totalUsage to onUsage, on the generateText path", async () => {
    const history = createSessionHistory(neverSummarize);
    let receivedInputTokens: number | undefined;
    const generateTextFn = async () => ({
      text: "ok",
      totalUsage: { inputTokens: 1234 },
    });

    await runTurn(history, "hi", {
      model: "fake-model" as never,
      tools: {},
      system: SYSTEM,
      generateTextFn,
      onUsage: (inputTokens) => {
        receivedInputTokens = inputTokens;
      },
    });

    expect(receivedInputTokens).toBe(1234);
  });

  it("passes the real inputTokens from totalUsage to onUsage, on the streaming path", async () => {
    async function* fakeStream() {
      yield "ok";
    }
    const history = createSessionHistory(neverSummarize);
    let receivedInputTokens: number | undefined;
    const streamTextFn = async () => ({
      textStream: fakeStream(),
      totalUsage: Promise.resolve({ inputTokens: 5678 }),
    });

    await runTurn(history, "hi", {
      model: "fake-model" as never,
      tools: {},
      system: SYSTEM,
      streamTextFn,
      onTextChunk: () => {},
      onUsage: (inputTokens) => {
        receivedInputTokens = inputTokens;
      },
    });

    expect(receivedInputTokens).toBe(5678);
  });

  // Regression: observed live — a turn that spent its entire tool-call
  // budget on retries (e.g. jira's required --select, guessed wrong a
  // couple of times) can reach the model's step limit with no step left
  // to actually write an answer. streamText then resolves with a
  // textStream that yields nothing at all: no error, no chunk. Left
  // empty on purpose (no fallback message) — silence in this genuinely-
  // stuck case is an accepted tradeoff, not solved here (see
  // PENDING_CONFIRMATION_NOTE's doc comment in agent-turn.ts).
  it("leaves the streamed answer empty, and sends nothing via onTextChunk, when it's genuinely empty", async () => {
    async function* emptyStream() {
      // yields nothing — the model ran out of steps before writing text
    }
    const history = createSessionHistory(neverSummarize);
    const received: string[] = [];
    const streamTextFn = async () => ({ textStream: emptyStream() });

    const result = await runTurn(history, "hi", {
      model: "fake-model" as never,
      tools: {},
      system: SYSTEM,
      streamTextFn,
      onTextChunk: (chunk) => received.push(chunk),
    });

    expect(received).toEqual([]);
    expect(result).toBe("");
    expect(history.getMessages()).toEqual([
      { role: "user", content: "hi" },
      { role: "assistant", content: "" },
    ]);
  });

  it("treats a whitespace-only streamed answer the same as an empty one", async () => {
    async function* whitespaceStream() {
      yield "   \n";
    }
    const history = createSessionHistory(neverSummarize);
    const streamTextFn = async () => ({ textStream: whitespaceStream() });

    const result = await runTurn(history, "hi", {
      model: "fake-model" as never,
      tools: {},
      system: SYSTEM,
      streamTextFn,
      onTextChunk: () => {},
    });

    expect(result).toBe("");
  });

  it("does not touch a non-empty streamed answer", async () => {
    async function* fakeStream() {
      yield "a real answer";
    }
    const history = createSessionHistory(neverSummarize);
    const streamTextFn = async () => ({ textStream: fakeStream() });

    const result = await runTurn(history, "hi", {
      model: "fake-model" as never,
      tools: {},
      system: SYSTEM,
      streamTextFn,
      onTextChunk: () => {},
    });

    expect(result).toBe("a real answer");
  });

  // Same regression, non-streaming path (currently unused in production —
  // both real channels always set onTextChunk — but kept correct since
  // it's still a public, directly tested code path.
  it("leaves the text empty when generateText returns empty text and the last step wasn't a pending confirmation", async () => {
    const history = createSessionHistory(neverSummarize);
    const generateTextFn = async () => ({ text: "" });

    const result = await runTurn(history, "hi", {
      model: "fake-model" as never,
      tools: {},
      system: SYSTEM,
      generateTextFn,
    });

    expect(result).toBe("");
    expect(history.getMessages()).toEqual([
      { role: "user", content: "hi" },
      { role: "assistant", content: "" },
    ]);
  });

  // The actual point of stopping the loop early on a pending confirmation
  // (see buildGenerateTextParams/buildStreamTextParams below): the model
  // never gets a step to write anything after staging the command, so
  // there's nothing to substitute a fallback for except this fixed,
  // non-model-generated note — never the token, never model prose.
  it("records PENDING_CONFIRMATION_NOTE instead of leaving it empty when the last step staged a confirm-required command (non-streaming)", async () => {
    const history = createSessionHistory(neverSummarize);
    const generateTextFn = async (params: { onStepFinish?: (step: StepInfo) => void }) => {
      params.onStepFinish?.(PENDING_CONFIRMATION_STEP);
      return { text: "" };
    };

    const result = await runTurn(history, "hi", {
      model: "fake-model" as never,
      tools: {},
      system: SYSTEM,
      generateTextFn,
    });

    expect(result).toBe(PENDING_CONFIRMATION_NOTE);
    expect(history.getMessages()).toEqual([
      { role: "user", content: "hi" },
      { role: "assistant", content: PENDING_CONFIRMATION_NOTE },
    ]);
  });

  it("records PENDING_CONFIRMATION_NOTE instead of leaving it empty when the last step staged a confirm-required command (streaming)", async () => {
    async function* emptyStream() {}
    const history = createSessionHistory(neverSummarize);
    const received: string[] = [];
    const streamTextFn = async (params: { onStepFinish?: (step: StepInfo) => void }) => {
      params.onStepFinish?.(PENDING_CONFIRMATION_STEP);
      return { textStream: emptyStream() };
    };

    const result = await runTurn(history, "hi", {
      model: "fake-model" as never,
      tools: {},
      system: SYSTEM,
      streamTextFn,
      onTextChunk: (chunk) => received.push(chunk),
    });

    expect(received).toEqual([PENDING_CONFIRMATION_NOTE]);
    expect(result).toBe(PENDING_CONFIRMATION_NOTE);
  });
});

describe("buildGenerateTextParams", () => {
  // Regression test: generateText's stopWhen defaults to stepCountIs(1),
  // meaning it stops after a single step. If the model's first step is a
  // tool call (no accompanying text), generateText never gets a second
  // step to synthesize a final answer from the tool result — text comes
  // back empty. Observed for real: asking Mercury a Jira question made it
  // call jiraCli and return an empty string, with no error anywhere.
  //
  // The cap was raised from an original 5: observed live, a conversation
  // combining wiki lookups with a jira search (which always needs
  // --select, so almost always costs 2 attempts) routinely spent all 5
  // steps on tool calls alone, leaving zero steps for the model to ever
  // write an answer. First raised to 20 (matching this SDK's own default
  // for its higher-level agent construct, see ai/dist/index.d.ts's
  // ToolLoopAgentSettings), then to 100 for extra headroom during this
  // research phase — the model should be free to make as many tool calls
  // as it needs, not be cut off by an arbitrary ceiling.
  it("configures a step cap of 100, so tool-heavy turns aren't cut off before the model gets to answer", async () => {
    const params = buildGenerateTextParams({
      model: "fake-model" as never,
      messages: [],
      tools: {},
      system: SYSTEM,
    });

    const ordinaryStep: StepInfo = { toolCalls: [], toolResults: [], content: [] };
    const stopped = async (n: number) => stopConditionsMet(params.stopWhen, new Array(n).fill(ordinaryStep));
    expect(await stopped(99)).toBe(false);
    expect(await stopped(100)).toBe(true);
  });

  // The actual reason a second stop condition exists alongside the step
  // cap: a confirm-required command must stop the loop immediately,
  // regardless of how many steps are left in the budget — see
  // PENDING_CONFIRMATION_NOTE's doc comment for why.
  it("stops immediately when the last step staged a confirm-required command, regardless of step count", async () => {
    const params = buildGenerateTextParams({
      model: "fake-model" as never,
      messages: [],
      tools: {},
      system: SYSTEM,
    });

    expect(await stopConditionsMet(params.stopWhen, [PENDING_CONFIRMATION_STEP])).toBe(true);
  });
});

describe("buildStreamTextParams", () => {
  // Same regression as buildGenerateTextParams's, for the streaming path.
  it("configures a step cap of 100, so tool-heavy turns aren't cut off before the model gets to answer", async () => {
    const params = buildStreamTextParams({
      model: "fake-model" as never,
      messages: [],
      tools: {},
      system: SYSTEM,
    });

    const ordinaryStep: StepInfo = { toolCalls: [], toolResults: [], content: [] };
    const stopped = async (n: number) => stopConditionsMet(params.stopWhen, new Array(n).fill(ordinaryStep));
    expect(await stopped(99)).toBe(false);
    expect(await stopped(100)).toBe(true);
  });

  it("stops immediately when the last step staged a confirm-required command, regardless of step count", async () => {
    const params = buildStreamTextParams({
      model: "fake-model" as never,
      messages: [],
      tools: {},
      system: SYSTEM,
    });

    expect(await stopConditionsMet(params.stopWhen, [PENDING_CONFIRMATION_STEP])).toBe(true);
  });
});
