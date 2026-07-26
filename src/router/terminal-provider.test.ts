import { describe, expect, test } from "bun:test";
import { createTerminalProvider } from "./terminal-provider.ts";
import type { HandleTurn, InboundTurn, TurnSink } from "./provider.ts";

type CapturedHandleInput = (input: string, onChunk: (chunk: string) => void) => Promise<string>;

function fakeConfirmDeps() {
  return {
    store: {} as any,
    runCliFn: (async () => ({ ok: true as const, data: {} })) as any,
    vaultPath: "/vault",
    writeSuppressionNoteFn: (async () => {}) as any,
    recordSuppressionEventFn: async () => {},
  };
}

describe("createTerminalProvider", () => {
  test("/dump short-circuits without calling handleTurn", async () => {
    let capturedHandleInput!: CapturedHandleInput;
    let handleTurnCalled = false;

    const provider = createTerminalProvider({
      confirmDeps: fakeConfirmDeps(),
      ollamaHost: "http://host",
      ollamaModel: "model",
      getLoadedContextLengthFn: async () => 4096,
      startTerminalReplFn: async (handleInput) => {
        capturedHandleInput = handleInput;
      },
    });

    const handleTurn: HandleTurn = async () => {
      handleTurnCalled = true;
    };
    await provider.start(handleTurn);

    const result = await capturedHandleInput("/dump", () => {});
    expect(handleTurnCalled).toBe(false);
    expect(result).toContain("wrote 0 tool step(s)");
  });

  test("conferma <token> short-circuits without calling handleTurn", async () => {
    let capturedHandleInput!: CapturedHandleInput;
    let handleTurnCalled = false;
    let tryConfirmArgs: unknown[] = [];

    const provider = createTerminalProvider({
      confirmDeps: fakeConfirmDeps(),
      ollamaHost: "http://host",
      ollamaModel: "model",
      getLoadedContextLengthFn: async () => 4096,
      startTerminalReplFn: async (handleInput) => {
        capturedHandleInput = handleInput;
      },
      tryConfirmFn: async (input, sessionKey, deps) => {
        tryConfirmArgs = [input, sessionKey, deps.userId];
        return "Confermato ed eseguito.";
      },
    });

    const handleTurn: HandleTurn = async () => {
      handleTurnCalled = true;
    };
    await provider.start(handleTurn);

    const result = await capturedHandleInput("conferma ABC123", () => {});
    expect(handleTurnCalled).toBe(false);
    expect(result).toBe("Confermato ed eseguito.");
    expect(tryConfirmArgs).toEqual(["conferma ABC123", "terminal", "terminal"]);
  });

  test("a normal message calls handleTurn and returns the sink's finalized text", async () => {
    let capturedHandleInput!: CapturedHandleInput;
    let capturedTurn!: InboundTurn;

    const provider = createTerminalProvider({
      confirmDeps: fakeConfirmDeps(),
      ollamaHost: "http://host",
      ollamaModel: "model",
      getLoadedContextLengthFn: async () => 4096,
      startTerminalReplFn: async (handleInput) => {
        capturedHandleInput = handleInput;
      },
      tryConfirmFn: async () => null,
    });

    const handleTurn: HandleTurn = async (turn, sink) => {
      capturedTurn = turn;
      await sink.finalize("the final answer");
    };
    await provider.start(handleTurn);

    const result = await capturedHandleInput("hello mercury", () => {});
    expect(result).toBe("the final answer");
    expect(capturedTurn).toEqual({
      channel: "terminal",
      multiUser: false,
      text: "hello mercury",
      sessionKey: "terminal",
      wikiUserId: "terminal",
      logPrefix: "",
    });
  });

  test("the sink's onToolStart writes the dim/italic ANSI sequence via onChunk", async () => {
    let capturedHandleInput!: CapturedHandleInput;

    const provider = createTerminalProvider({
      confirmDeps: fakeConfirmDeps(),
      ollamaHost: "http://host",
      ollamaModel: "model",
      getLoadedContextLengthFn: async () => 4096,
      startTerminalReplFn: async (handleInput) => {
        capturedHandleInput = handleInput;
      },
      tryConfirmFn: async () => null,
    });

    const handleTurn: HandleTurn = async (_turn, sink) => {
      sink.onToolStart("sto leggendo jira...");
      await sink.finalize("done");
    };
    await provider.start(handleTurn);

    const chunks: string[] = [];
    await capturedHandleInput("hi", (chunk) => chunks.push(chunk));
    expect(chunks).toEqual(["\x1b[2m\x1b[3msto leggendo jira...\x1b[0m\n"]);
  });

  test("the sink's onTextChunk is the terminal's real onChunk (streaming enabled)", async () => {
    let capturedHandleInput!: CapturedHandleInput;

    const provider = createTerminalProvider({
      confirmDeps: fakeConfirmDeps(),
      ollamaHost: "http://host",
      ollamaModel: "model",
      getLoadedContextLengthFn: async () => 4096,
      startTerminalReplFn: async (handleInput) => {
        capturedHandleInput = handleInput;
      },
      tryConfirmFn: async () => null,
    });

    const handleTurn: HandleTurn = async (_turn, sink) => {
      sink.onTextChunk?.("partial ");
      sink.onTextChunk?.("answer");
      await sink.finalize("partial answer");
    };
    await provider.start(handleTurn);

    const chunks: string[] = [];
    await capturedHandleInput("hi", (chunk) => chunks.push(chunk));
    expect(chunks).toEqual(["partial ", "answer"]);
  });

  test("usage reported via the sink feeds the prompt suffix", async () => {
    let capturedPromptSuffix!: () => string;
    let capturedHandleInput!: CapturedHandleInput;

    const provider = createTerminalProvider({
      confirmDeps: fakeConfirmDeps(),
      ollamaHost: "http://host",
      ollamaModel: "model",
      getLoadedContextLengthFn: async () => 8000,
      startTerminalReplFn: async (handleInput, _io, opts) => {
        capturedHandleInput = handleInput;
        capturedPromptSuffix = opts!.promptSuffix!;
      },
      tryConfirmFn: async () => null,
    });

    const handleTurn: HandleTurn = async (_turn, sink) => {
      sink.onUsage?.(2000);
      await sink.finalize("done");
    };
    await provider.start(handleTurn);

    expect(capturedPromptSuffix()).toContain("?k");

    await capturedHandleInput("hi", () => {});
    expect(capturedPromptSuffix()).toBe("[~2k/~8k tokens] ");
  });

  test("notify writes to stderr and returns the terminal session key", async () => {
    const written: string[] = [];
    const provider = createTerminalProvider({
      confirmDeps: fakeConfirmDeps(),
      ollamaHost: "http://host",
      ollamaModel: "model",
      stderrWrite: (s) => written.push(s),
    });

    const result = await provider.notify("some-user", "hello there");
    expect(result).toEqual({ sessionKey: "terminal" });
    expect(written).toEqual(["[notify] to some-user: hello there"]);
  });

  test("notifyAdmin writes to stderr", async () => {
    const written: string[] = [];
    const provider = createTerminalProvider({
      confirmDeps: fakeConfirmDeps(),
      ollamaHost: "http://host",
      ollamaModel: "model",
      stderrWrite: (s) => written.push(s),
    });

    await provider.notifyAdmin("something needs attention");
    expect(written).toEqual(["[notify] admin: something needs attention"]);
  });
});
