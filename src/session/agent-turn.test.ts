import { describe, it, expect } from "bun:test";
import { runTurn, buildGenerateTextParams, buildStreamTextParams, EMPTY_RESPONSE_FALLBACK } from "./agent-turn.ts";
import { createSessionHistory } from "./history.ts";
import type { Message } from "./history.ts";
import type { Tool } from "ai";

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
  // producing a final answer — see src/router/terminal.ts.
  it("passes an onStepFinish callback through to the generation call when provided", async () => {
    const history = createSessionHistory(neverSummarize);
    let receivedOnStepFinish: unknown;
    const generateTextFn = async (params: { onStepFinish?: unknown }) => {
      receivedOnStepFinish = params.onStepFinish;
      return { text: "ok" };
    };
    const onStepFinish = () => {};

    await runTurn(history, "hi", {
      model: "fake-model" as never,
      tools: {},
      system: SYSTEM,
      generateTextFn,
      onStepFinish,
    });

    expect(receivedOnStepFinish).toBe(onStepFinish);
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

  it("passes an onStepFinish callback through to the streaming call too", async () => {
    async function* fakeStream() {}
    const history = createSessionHistory(neverSummarize);
    let received: unknown;
    const streamTextFn = async (params: { onStepFinish?: unknown }) => {
      received = params.onStepFinish;
      return { textStream: fakeStream() };
    };
    const onStepFinish = () => {};

    await runTurn(history, "hi", {
      model: "fake-model" as never,
      tools: {},
      system: SYSTEM,
      streamTextFn,
      onTextChunk: () => {},
      onStepFinish,
    });

    expect(received).toBe(onStepFinish);
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
  // textStream that yields nothing at all: no error, no chunk, and
  // (before this fix) nothing ever reached the user — Google Chat's
  // streamer had literally nothing to flush, leaving a "might be stuck"
  // status line unresolved forever. A turn must never end in total
  // silence: an empty final answer becomes an explicit fallback message
  // instead, delivered the same way real content would have been.
  it("delivers an explicit fallback via onTextChunk, and records it, when the streamed answer is entirely empty", async () => {
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

    expect(received).toEqual([EMPTY_RESPONSE_FALLBACK]);
    expect(result).toBe(EMPTY_RESPONSE_FALLBACK);
    expect(history.getMessages()).toEqual([
      { role: "user", content: "hi" },
      { role: "assistant", content: EMPTY_RESPONSE_FALLBACK },
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

    expect(result).toBe(EMPTY_RESPONSE_FALLBACK);
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
  it("substitutes the fallback when generateText returns empty text", async () => {
    const history = createSessionHistory(neverSummarize);
    const generateTextFn = async () => ({ text: "" });

    const result = await runTurn(history, "hi", {
      model: "fake-model" as never,
      tools: {},
      system: SYSTEM,
      generateTextFn,
    });

    expect(result).toBe(EMPTY_RESPONSE_FALLBACK);
    expect(history.getMessages()).toEqual([
      { role: "user", content: "hi" },
      { role: "assistant", content: EMPTY_RESPONSE_FALLBACK },
    ]);
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

    const stopWhen = params.stopWhen as (opts: { steps: unknown[] }) => Promise<boolean> | boolean;
    expect(await stopWhen({ steps: new Array(99).fill({}) })).toBe(false);
    expect(await stopWhen({ steps: new Array(100).fill({}) })).toBe(true);
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

    const stopWhen = params.stopWhen as (opts: { steps: unknown[] }) => Promise<boolean> | boolean;
    expect(await stopWhen({ steps: new Array(99).fill({}) })).toBe(false);
    expect(await stopWhen({ steps: new Array(100).fill({}) })).toBe(true);
  });
});
