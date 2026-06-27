import { describe, it, expect } from "bun:test";
import { runTurn, buildGenerateTextParams, buildStreamTextParams } from "./agent-turn.ts";
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
});

describe("buildGenerateTextParams", () => {
  // Regression test: generateText's stopWhen defaults to stepCountIs(1),
  // meaning it stops after a single step. If the model's first step is a
  // tool call (no accompanying text), generateText never gets a second
  // step to synthesize a final answer from the tool result — text comes
  // back empty. Observed for real: asking Mercury a Jira question made it
  // call jiraCli and return an empty string, with no error anywhere.
  it("includes a stopWhen that allows more than one step, so a tool call isn't the final step", () => {
    const params = buildGenerateTextParams({
      model: "fake-model" as never,
      messages: [],
      tools: {},
      system: SYSTEM,
    });

    expect(params.stopWhen).toBeDefined();
  });
});

describe("buildStreamTextParams", () => {
  // Same regression as buildGenerateTextParams's, for the streaming path:
  // a tool-call-only first step must not be the stream's last step.
  it("includes a stopWhen that allows more than one step, so a tool call isn't the final step", () => {
    const params = buildStreamTextParams({
      model: "fake-model" as never,
      messages: [],
      tools: {},
      system: SYSTEM,
    });

    expect(params.stopWhen).toBeDefined();
  });
});
