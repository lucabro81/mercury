import { describe, expect, test } from "bun:test";
import { createTurnRunner } from "./turn-runner.ts";
import { ISSUE_LIST_CORRECTION_FALLBACK } from "./issue-list-heuristic.ts";
import type { InboundTurn, TurnSink } from "./provider.ts";
import type { SessionHistory } from "../session/history.ts";
import type { StepInfo } from "../session/step-info.ts";

function fakeHistory(overrides: Partial<SessionHistory> = {}): SessionHistory {
  return {
    addUserMessage: async () => {},
    addAssistantMessage: async () => {},
    replaceLastAssistantMessage: () => {},
    getMessages: () => [],
    getCharCount: () => 0,
    ...overrides,
  };
}

function baseTurn(overrides: Partial<InboundTurn> = {}): InboundTurn {
  return {
    channel: "test-channel",
    multiUser: false,
    text: "hello",
    sessionKey: "session-1",
    wikiUserId: "wiki-1",
    logPrefix: "",
    ...overrides,
  };
}

function baseSink(overrides: Partial<TurnSink> = {}): TurnSink & { disposed: boolean; finalized: string[] } {
  const state = { disposed: false, finalized: [] as string[] };
  return {
    onToolStart: () => {},
    finalize: async (text: string) => {
      state.finalized.push(text);
    },
    dispose: () => {
      state.disposed = true;
    },
    ...overrides,
    get disposed() {
      return state.disposed;
    },
    get finalized() {
      return state.finalized;
    },
  } as TurnSink & { disposed: boolean; finalized: string[] };
}

describe("createTurnRunner", () => {
  test("forwards sink.onTextChunk into runTurn's deps when the sink defines it", async () => {
    let receivedOnTextChunk: unknown;
    const runner = createTurnRunner({
      model: {} as any,
      systemPrompts: { singleUser: "single", multiUser: "multi" },
      buildTools: () => ({}),
      getOrCreateHistory: () => fakeHistory(),
      trackSession: () => {},
      registerCaptureCallback: () => {},
      maybeCapture: async () => {},
      processToolCorrections: async () => {},
      logStep: () => {},
      runTurnFn: async (_history, _input, deps) => {
        receivedOnTextChunk = deps.onTextChunk;
        return "reply";
      },
    });

    const onChunk = () => {};
    await runner(baseTurn(), baseSink({ onTextChunk: onChunk }));

    expect(receivedOnTextChunk).toBe(onChunk);
  });

  test("leaves onTextChunk undefined when the sink omits it (Google Chat's non-streaming guarantee)", async () => {
    let receivedOnTextChunk: unknown = "not-yet-set";
    const runner = createTurnRunner({
      model: {} as any,
      systemPrompts: { singleUser: "single", multiUser: "multi" },
      buildTools: () => ({}),
      getOrCreateHistory: () => fakeHistory(),
      trackSession: () => {},
      registerCaptureCallback: () => {},
      maybeCapture: async () => {},
      processToolCorrections: async () => {},
      logStep: () => {},
      runTurnFn: async (_history, _input, deps) => {
        receivedOnTextChunk = deps.onTextChunk;
        return "reply";
      },
    });

    await runner(baseTurn(), baseSink());

    expect(receivedOnTextChunk).toBeUndefined();
  });

  test("forwards sink.onReasoningChunk/onReasoningEnd into runTurn's deps when the sink defines them", async () => {
    let receivedOnReasoningChunk: unknown;
    let receivedOnReasoningEnd: unknown;
    const runner = createTurnRunner({
      model: {} as any,
      systemPrompts: { singleUser: "single", multiUser: "multi" },
      buildTools: () => ({}),
      getOrCreateHistory: () => fakeHistory(),
      trackSession: () => {},
      registerCaptureCallback: () => {},
      maybeCapture: async () => {},
      processToolCorrections: async () => {},
      logStep: () => {},
      runTurnFn: async (_history, _input, deps) => {
        receivedOnReasoningChunk = deps.onReasoningChunk;
        receivedOnReasoningEnd = deps.onReasoningEnd;
        return "reply";
      },
    });

    const onReasoningChunk = () => {};
    const onReasoningEnd = () => {};
    await runner(baseTurn(), baseSink({ onReasoningChunk, onReasoningEnd }));

    expect(receivedOnReasoningChunk).toBe(onReasoningChunk);
    expect(receivedOnReasoningEnd).toBe(onReasoningEnd);
  });

  // Regression: must stay undefined, not default to a no-op — a no-op
  // would make agent-turn.ts's `if (deps.onTextChunk || deps.onReasoningChunk)`
  // branch condition true for every caller, even one that never asked for
  // reasoning display, silently switching them onto the streaming path.
  test("leaves onReasoningChunk/onReasoningEnd undefined when the sink omits them", async () => {
    let receivedOnReasoningChunk: unknown = "not-yet-set";
    let receivedOnReasoningEnd: unknown = "not-yet-set";
    const runner = createTurnRunner({
      model: {} as any,
      systemPrompts: { singleUser: "single", multiUser: "multi" },
      buildTools: () => ({}),
      getOrCreateHistory: () => fakeHistory(),
      trackSession: () => {},
      registerCaptureCallback: () => {},
      maybeCapture: async () => {},
      processToolCorrections: async () => {},
      logStep: () => {},
      runTurnFn: async (_history, _input, deps) => {
        receivedOnReasoningChunk = deps.onReasoningChunk;
        receivedOnReasoningEnd = deps.onReasoningEnd;
        return "reply";
      },
    });

    await runner(baseTurn(), baseSink());

    expect(receivedOnReasoningChunk).toBeUndefined();
    expect(receivedOnReasoningEnd).toBeUndefined();
  });

  test("selects the multi-user system prompt iff turn.multiUser is true", async () => {
    const systems: string[] = [];
    const runner = createTurnRunner({
      model: {} as any,
      systemPrompts: { singleUser: "SINGLE", multiUser: "MULTI" },
      buildTools: () => ({}),
      getOrCreateHistory: () => fakeHistory(),
      trackSession: () => {},
      registerCaptureCallback: () => {},
      maybeCapture: async () => {},
      processToolCorrections: async () => {},
      logStep: () => {},
      runTurnFn: async (_history, _input, deps) => {
        systems.push(deps.system);
        return "reply";
      },
    });

    await runner(baseTurn({ multiUser: false }), baseSink());
    await runner(baseTurn({ multiUser: true }), baseSink());

    expect(systems).toEqual(["SINGLE", "MULTI"]);
  });

  test("calls buildTools with the turn's sessionKey, wikiUserId, and the sink's onToolStart/onToolFinish", async () => {
    const calls: Array<[string, string, unknown, unknown]> = [];
    const onToolStart = () => {};
    const onToolFinish = () => {};
    const runner = createTurnRunner({
      model: {} as any,
      systemPrompts: { singleUser: "s", multiUser: "m" },
      buildTools: (sessionKey, wikiUserId, cb, finishCb) => {
        calls.push([sessionKey, wikiUserId, cb, finishCb]);
        return {};
      },
      getOrCreateHistory: () => fakeHistory(),
      trackSession: () => {},
      registerCaptureCallback: () => {},
      maybeCapture: async () => {},
      processToolCorrections: async () => {},
      logStep: () => {},
      runTurnFn: async () => "reply",
    });

    await runner(baseTurn({ sessionKey: "sk", wikiUserId: "wu" }), baseSink({ onToolStart, onToolFinish }));

    expect(calls).toEqual([["sk", "wu", onToolStart, onToolFinish]]);
  });

  test("onStepFinish fans out to logStep, recordStepFn, and sink.onStep", async () => {
    const logged: Array<[string, StepInfo]> = [];
    const recorded: Array<[string, string, StepInfo]> = [];
    const sunk: StepInfo[] = [];
    const step: StepInfo = { toolCalls: [], toolResults: [], content: [] };

    const runner = createTurnRunner({
      model: {} as any,
      systemPrompts: { singleUser: "s", multiUser: "m" },
      buildTools: () => ({}),
      getOrCreateHistory: () => fakeHistory(),
      trackSession: () => {},
      registerCaptureCallback: () => {},
      maybeCapture: async () => {},
      processToolCorrections: async () => {},
      logStep: (prefix, s) => logged.push([prefix, s]),
      recordStepFn: (channel, sessionKey, s) => recorded.push([channel, sessionKey, s]),
      runTurnFn: async (_history, _input, deps) => {
        deps.onStepFinish?.(step);
        return "reply";
      },
    });

    await runner(baseTurn({ channel: "chan", sessionKey: "sk", logPrefix: "[p] " }), baseSink({ onStep: (s) => sunk.push(s) }));

    expect(logged).toEqual([["[p] ", step]]);
    expect(recorded).toEqual([["chan", "sk", step]]);
    expect(sunk).toEqual([step]);
  });

  test("finalize receives runTurn's exact return value", async () => {
    const sink = baseSink();
    const runner = createTurnRunner({
      model: {} as any,
      systemPrompts: { singleUser: "s", multiUser: "m" },
      buildTools: () => ({}),
      getOrCreateHistory: () => fakeHistory(),
      trackSession: () => {},
      registerCaptureCallback: () => {},
      maybeCapture: async () => {},
      processToolCorrections: async () => {},
      logStep: () => {},
      runTurnFn: async () => "the final answer",
    });

    await runner(baseTurn(), sink);

    expect(sink.finalized).toEqual(["the final answer"]);
  });

  // The model never sees formattedList (omitFormattedListForModel strips it
  // before it reaches the model's context, see cli-tool.ts) — delivery is
  // guaranteed here instead, off the raw tool-result output onStepFinish
  // captures, independent of what the model's own text says.
  test("appends a formattedList the model's final text omitted", async () => {
    const sink = baseSink();
    const step: StepInfo = {
      toolCalls: [],
      toolResults: [{ toolCallId: "1", toolName: "runCommand", output: { ok: true, data: { formattedList: "MER-1\nhttps://x" } } }],
      content: [],
    };
    const runner = createTurnRunner({
      model: {} as any,
      systemPrompts: { singleUser: "s", multiUser: "m" },
      buildTools: () => ({}),
      getOrCreateHistory: () => fakeHistory(),
      trackSession: () => {},
      registerCaptureCallback: () => {},
      maybeCapture: async () => {},
      processToolCorrections: async () => {},
      logStep: () => {},
      runTurnFn: async (_history, _input, deps) => {
        deps.onStepFinish?.(step);
        return "Here you go.";
      },
    });

    await runner(baseTurn(), sink);

    expect(sink.finalized).toEqual(["Here you go.\n\nMER-1\nhttps://x"]);
  });

  test("does not duplicate a formattedList the model already relayed verbatim", async () => {
    const sink = baseSink();
    const step: StepInfo = {
      toolCalls: [],
      toolResults: [{ toolCallId: "1", toolName: "runCommand", output: { ok: true, data: { formattedList: "MER-1\nhttps://x" } } }],
      content: [],
    };
    const runner = createTurnRunner({
      model: {} as any,
      systemPrompts: { singleUser: "s", multiUser: "m" },
      buildTools: () => ({}),
      getOrCreateHistory: () => fakeHistory(),
      trackSession: () => {},
      registerCaptureCallback: () => {},
      maybeCapture: async () => {},
      processToolCorrections: async () => {},
      logStep: () => {},
      runTurnFn: async (_history, _input, deps) => {
        deps.onStepFinish?.(step);
        return "Here you go:\n\nMER-1\nhttps://x";
      },
    });

    await runner(baseTurn(), sink);

    expect(sink.finalized).toEqual(["Here you go:\n\nMER-1\nhttps://x"]);
  });

  // Regression test: getOrCreateHistory (which can run the context-primer's
  // Qdrant query for a brand-new tracked session) used to be called before
  // the try/finally — a failure there left the sink's own stuck-note timer
  // running forever, since dispose() was never reached. Caught live: a
  // Qdrant 400 on the primer query left a phantom "still stuck" message
  // firing 60s later even though the real error had already been logged.
  test("dispose runs even when getOrCreateHistory itself throws, and the throw propagates", async () => {
    const sink = baseSink();
    const runner = createTurnRunner({
      model: {} as any,
      systemPrompts: { singleUser: "s", multiUser: "m" },
      buildTools: () => ({}),
      getOrCreateHistory: async () => {
        throw new Error("qdrant boom");
      },
      trackSession: () => {},
      registerCaptureCallback: () => {},
      maybeCapture: async () => {},
      processToolCorrections: async () => {},
      logStep: () => {},
      runTurnFn: async () => "reply",
    });

    await expect(runner(baseTurn(), sink)).rejects.toThrow("qdrant boom");
    expect(sink.disposed).toBe(true);
    expect(sink.finalized).toEqual([]);
  });

  test("dispose runs even when runTurn throws, and the throw propagates", async () => {
    const sink = baseSink();
    const runner = createTurnRunner({
      model: {} as any,
      systemPrompts: { singleUser: "s", multiUser: "m" },
      buildTools: () => ({}),
      getOrCreateHistory: () => fakeHistory(),
      trackSession: () => {},
      registerCaptureCallback: () => {},
      maybeCapture: async () => {},
      processToolCorrections: async () => {},
      logStep: () => {},
      runTurnFn: async () => {
        throw new Error("boom");
      },
    });

    await expect(runner(baseTurn(), sink)).rejects.toThrow("boom");
    expect(sink.disposed).toBe(true);
    expect(sink.finalized).toEqual([]);
  });

  test("processToolCorrections is skipped when the turn throws", async () => {
    let correctionsCalled = false;
    const runner = createTurnRunner({
      model: {} as any,
      systemPrompts: { singleUser: "s", multiUser: "m" },
      buildTools: () => ({}),
      getOrCreateHistory: () => fakeHistory(),
      trackSession: () => {},
      registerCaptureCallback: () => {},
      maybeCapture: async () => {},
      processToolCorrections: async () => {
        correctionsCalled = true;
      },
      logStep: () => {},
      runTurnFn: async () => {
        throw new Error("boom");
      },
    });

    await expect(runner(baseTurn(), baseSink())).rejects.toThrow("boom");
    expect(correctionsCalled).toBe(false);
  });

  test("processToolCorrections receives every step accumulated during the turn", async () => {
    const stepA: StepInfo = { toolCalls: [{ toolCallId: "1", toolName: "a", input: {} }], toolResults: [], content: [] };
    const stepB: StepInfo = { toolCalls: [{ toolCallId: "2", toolName: "b", input: {} }], toolResults: [], content: [] };
    let received: StepInfo[] = [];

    const runner = createTurnRunner({
      model: {} as any,
      systemPrompts: { singleUser: "s", multiUser: "m" },
      buildTools: () => ({}),
      getOrCreateHistory: () => fakeHistory(),
      trackSession: () => {},
      registerCaptureCallback: () => {},
      maybeCapture: async () => {},
      processToolCorrections: async (steps) => {
        received = steps;
      },
      logStep: () => {},
      runTurnFn: async (_history, _input, deps) => {
        deps.onStepFinish?.(stepA);
        deps.onStepFinish?.(stepB);
        return "reply";
      },
    });

    await runner(baseTurn(), baseSink());

    expect(received).toEqual([stepA, stepB]);
  });

  test("when turn.userId is present: trackSession, registerCaptureCallback, and maybeCapture all run, and getOrCreateHistory is asked to track for capture", async () => {
    const tracked: Array<[string, string]> = [];
    const registered: string[] = [];
    const captured: string[] = [];
    let historyTrackForCapture: boolean | undefined;
    const fakeHist = fakeHistory();

    const runner = createTurnRunner({
      model: {} as any,
      systemPrompts: { singleUser: "s", multiUser: "m" },
      buildTools: () => ({}),
      getOrCreateHistory: (sessionKey, trackForCapture) => {
        historyTrackForCapture = trackForCapture;
        return fakeHist;
      },
      trackSession: (sessionKey, userId) => tracked.push([sessionKey, userId]),
      registerCaptureCallback: (sessionKey) => registered.push(sessionKey),
      maybeCapture: async (sessionKey) => {
        captured.push(sessionKey);
      },
      processToolCorrections: async () => {},
      logStep: () => {},
      runTurnFn: async () => "reply",
    });

    await runner(baseTurn({ sessionKey: "sk", userId: "u1" }), baseSink());

    expect(tracked).toEqual([["sk", "u1"]]);
    expect(registered).toEqual(["sk"]);
    expect(captured).toEqual(["sk"]);
    expect(historyTrackForCapture).toBe(true);
  });

  test("registerCaptureCallback receives both the sink's onToolStart and onToolFinish, so a capture-ping can also patch a status card", async () => {
    const registered: Array<[string, unknown, unknown]> = [];
    const onToolStart = () => {};
    const onToolFinish = () => {};

    const runner = createTurnRunner({
      model: {} as any,
      systemPrompts: { singleUser: "s", multiUser: "m" },
      buildTools: () => ({}),
      getOrCreateHistory: () => fakeHistory(),
      trackSession: () => {},
      registerCaptureCallback: (sessionKey, cb, finishCb) => registered.push([sessionKey, cb, finishCb]),
      maybeCapture: async () => {},
      processToolCorrections: async () => {},
      logStep: () => {},
      runTurnFn: async () => "reply",
    });

    await runner(baseTurn({ sessionKey: "sk", userId: "u1" }), baseSink({ onToolStart, onToolFinish }));

    expect(registered).toEqual([["sk", onToolStart, onToolFinish]]);
  });

  test("processToolCorrections receives both the sink's onToolStart and onToolFinish", async () => {
    const received: Array<[unknown, unknown]> = [];
    const onToolStart = () => {};
    const onToolFinish = () => {};

    const runner = createTurnRunner({
      model: {} as any,
      systemPrompts: { singleUser: "s", multiUser: "m" },
      buildTools: () => ({}),
      getOrCreateHistory: () => fakeHistory(),
      trackSession: () => {},
      registerCaptureCallback: () => {},
      maybeCapture: async () => {},
      processToolCorrections: async (_steps, cb, finishCb) => {
        received.push([cb, finishCb]);
      },
      logStep: () => {},
      runTurnFn: async () => "reply",
    });

    await runner(baseTurn(), baseSink({ onToolStart, onToolFinish }));

    expect(received).toEqual([[onToolStart, onToolFinish]]);
  });

  test("getOrCreateHistory receives turn.userId as its third argument (present or undefined), so a provider can decide whether to seed a context primer", async () => {
    const seenUserIds: Array<string | undefined> = [];
    const runner = createTurnRunner({
      model: {} as any,
      systemPrompts: { singleUser: "s", multiUser: "m" },
      buildTools: () => ({}),
      getOrCreateHistory: (_sessionKey, _trackForCapture, userId) => {
        seenUserIds.push(userId);
        return fakeHistory();
      },
      trackSession: () => {},
      registerCaptureCallback: () => {},
      maybeCapture: async () => {},
      processToolCorrections: async () => {},
      logStep: () => {},
      runTurnFn: async () => "reply",
    });

    await runner(baseTurn({ userId: "u1" }), baseSink());
    await runner(baseTurn({ userId: undefined }), baseSink());

    expect(seenUserIds).toEqual(["u1", undefined]);
  });

  test("when turn.userId is absent: trackSession, registerCaptureCallback, and maybeCapture are all skipped, and getOrCreateHistory is not asked to track for capture", async () => {
    const tracked: unknown[] = [];
    const registered: unknown[] = [];
    const captured: unknown[] = [];
    let historyTrackForCapture: boolean | undefined;
    const fakeHist = fakeHistory();

    const runner = createTurnRunner({
      model: {} as any,
      systemPrompts: { singleUser: "s", multiUser: "m" },
      buildTools: () => ({}),
      getOrCreateHistory: (sessionKey, trackForCapture) => {
        historyTrackForCapture = trackForCapture;
        return fakeHist;
      },
      trackSession: (...args) => tracked.push(args),
      registerCaptureCallback: (...args) => registered.push(args),
      maybeCapture: async (...args) => {
        captured.push(args);
      },
      processToolCorrections: async () => {},
      logStep: () => {},
      runTurnFn: async () => "reply",
    });

    await runner(baseTurn({ sessionKey: "sk", userId: undefined }), baseSink());

    expect(tracked).toEqual([]);
    expect(registered).toEqual([]);
    expect(captured).toEqual([]);
    expect(historyTrackForCapture).toBe(false);
  });

  describe("issue-list correction", () => {
    // Runs strictly before spliceFormattedLists — proves the ordering by
    // combining a flagged model text with a step carrying a formattedList
    // and checking the final result is <corrector's rewrite>\n\n<formattedList>.
    const formattedListStep: StepInfo = {
      toolCalls: [],
      toolResults: [{ toolCallId: "1", toolName: "runCommand", output: { ok: true, data: { formattedList: "MER-1\nhttps://x" } } }],
      content: [],
    };
    const flaggedText = "- MER-1 Fix the bug\n- MER-2 Add the feature";

    test("does not call the corrector or log anything when the model's text isn't flagged", async () => {
      let correctorCalled = false;
      const logged: string[] = [];
      const sink = baseSink();
      const runner = createTurnRunner({
        model: {} as any,
        systemPrompts: { singleUser: "s", multiUser: "m" },
        buildTools: () => ({}),
        getOrCreateHistory: () => fakeHistory(),
        trackSession: () => {},
        registerCaptureCallback: () => {},
        maybeCapture: async () => {},
        processToolCorrections: async () => {},
        logStep: () => {},
        correctIssueListFn: () => async (text) => {
          correctorCalled = true;
          return text;
        },
        logDiscardedIssueListFn: (message) => logged.push(message),
        runTurnFn: async () => "Here you go.",
      });

      await runner(baseTurn(), sink);

      expect(correctorCalled).toBe(false);
      expect(logged).toEqual([]);
      expect(sink.finalized).toEqual(["Here you go."]);
    });

    test("replaces flagged text with the corrector's rewrite, and logs the original", async () => {
      const logged: string[] = [];
      const sink = baseSink();
      const runner = createTurnRunner({
        model: {} as any,
        systemPrompts: { singleUser: "s", multiUser: "m" },
        buildTools: () => ({}),
        getOrCreateHistory: () => fakeHistory(),
        trackSession: () => {},
        registerCaptureCallback: () => {},
        maybeCapture: async () => {},
        processToolCorrections: async () => {},
        logStep: () => {},
        correctIssueListFn: () => async () => "Both are still open.",
        logDiscardedIssueListFn: (message) => logged.push(message),
        runTurnFn: async () => flaggedText,
      });

      await runner(baseTurn(), sink);

      expect(sink.finalized).toEqual(["Both are still open."]);
      expect(logged).toHaveLength(1);
      expect(logged[0]).toContain(flaggedText);
      expect(logged[0]).not.toContain("fixed fallback");
    });

    test("falls back to the fixed message when the corrector's own output is still flagged", async () => {
      const logged: string[] = [];
      const sink = baseSink();
      const runner = createTurnRunner({
        model: {} as any,
        systemPrompts: { singleUser: "s", multiUser: "m" },
        buildTools: () => ({}),
        getOrCreateHistory: () => fakeHistory(),
        trackSession: () => {},
        registerCaptureCallback: () => {},
        maybeCapture: async () => {},
        processToolCorrections: async () => {},
        logStep: () => {},
        correctIssueListFn: () => async () => flaggedText,
        logDiscardedIssueListFn: (message) => logged.push(message),
        runTurnFn: async () => flaggedText,
      });

      await runner(baseTurn(), sink);

      expect(sink.finalized).toEqual([ISSUE_LIST_CORRECTION_FALLBACK]);
      expect(logged).toHaveLength(1);
      expect(logged[0]).toContain(flaggedText);
      expect(logged[0]).toContain("fixed fallback");
    });

    test("degrades to the original text, and logs the failure, when the corrector call throws", async () => {
      const logged: string[] = [];
      const sink = baseSink();
      let correctionsReceived: StepInfo[] | undefined;
      const runner = createTurnRunner({
        model: {} as any,
        systemPrompts: { singleUser: "s", multiUser: "m" },
        buildTools: () => ({}),
        getOrCreateHistory: () => fakeHistory(),
        trackSession: () => {},
        registerCaptureCallback: () => {},
        maybeCapture: async () => {},
        processToolCorrections: async (steps) => {
          correctionsReceived = steps;
        },
        logStep: () => {},
        correctIssueListFn: () => async () => {
          throw new Error("ollama unreachable");
        },
        logDiscardedIssueListFn: (message) => logged.push(message),
        runTurnFn: async () => flaggedText,
      });

      await runner(baseTurn(), sink);

      expect(sink.finalized).toEqual([flaggedText]);
      expect(logged).toHaveLength(1);
      expect(logged[0]).toContain("ollama unreachable");
      // The turn otherwise completes normally — a corrector failure isn't a turn failure.
      expect(sink.disposed).toBe(true);
      expect(correctionsReceived).toEqual([]);
    });

    test("runs correction before formattedList splicing", async () => {
      const sink = baseSink();
      const runner = createTurnRunner({
        model: {} as any,
        systemPrompts: { singleUser: "s", multiUser: "m" },
        buildTools: () => ({}),
        getOrCreateHistory: () => fakeHistory(),
        trackSession: () => {},
        registerCaptureCallback: () => {},
        maybeCapture: async () => {},
        processToolCorrections: async () => {},
        logStep: () => {},
        correctIssueListFn: () => async () => "Both are still open.",
        logDiscardedIssueListFn: () => {},
        runTurnFn: async (_history, _input, deps) => {
          deps.onStepFinish?.(formattedListStep);
          return flaggedText;
        },
      });

      await runner(baseTurn(), sink);

      expect(sink.finalized).toEqual(["Both are still open.\n\nMER-1\nhttps://x"]);
    });

    test("correctIssueListFn is called with deps.model", async () => {
      const receivedModels: unknown[] = [];
      const model = { id: "fake-model" } as any;
      const sink = baseSink();
      const runner = createTurnRunner({
        model,
        systemPrompts: { singleUser: "s", multiUser: "m" },
        buildTools: () => ({}),
        getOrCreateHistory: () => fakeHistory(),
        trackSession: () => {},
        registerCaptureCallback: () => {},
        maybeCapture: async () => {},
        processToolCorrections: async () => {},
        logStep: () => {},
        correctIssueListFn: (m) => {
          receivedModels.push(m);
          return async () => "Both are still open.";
        },
        logDiscardedIssueListFn: () => {},
        runTurnFn: async () => flaggedText,
      });

      await runner(baseTurn(), sink);

      expect(receivedModels).toEqual([model]);
    });

    // Without this, the duplicated-list version the feature exists to
    // eliminate would permanently survive in SessionHistory — the model
    // would see and imitate its own "successful" past restatement on the
    // next turn, and Layer-3 capture (which reads the same history) would
    // persist it too.
    describe("persisting the corrected text into history", () => {
      test("does not call replaceLastAssistantMessage when the model's text isn't flagged", async () => {
        const replaced: string[] = [];
        const sink = baseSink();
        const runner = createTurnRunner({
          model: {} as any,
          systemPrompts: { singleUser: "s", multiUser: "m" },
          buildTools: () => ({}),
          getOrCreateHistory: () => fakeHistory({ replaceLastAssistantMessage: (c) => replaced.push(c) }),
          trackSession: () => {},
          registerCaptureCallback: () => {},
          maybeCapture: async () => {},
          processToolCorrections: async () => {},
          logStep: () => {},
          runTurnFn: async () => "Here you go.",
        });

        await runner(baseTurn(), sink);

        expect(replaced).toEqual([]);
      });

      test("calls replaceLastAssistantMessage with the corrector's rewrite when flagged and corrected", async () => {
        const replaced: string[] = [];
        const sink = baseSink();
        const runner = createTurnRunner({
          model: {} as any,
          systemPrompts: { singleUser: "s", multiUser: "m" },
          buildTools: () => ({}),
          getOrCreateHistory: () => fakeHistory({ replaceLastAssistantMessage: (c) => replaced.push(c) }),
          trackSession: () => {},
          registerCaptureCallback: () => {},
          maybeCapture: async () => {},
          processToolCorrections: async () => {},
          logStep: () => {},
          correctIssueListFn: () => async () => "Both are still open.",
          logDiscardedIssueListFn: () => {},
          runTurnFn: async () => flaggedText,
        });

        await runner(baseTurn(), sink);

        expect(replaced).toEqual(["Both are still open."]);
      });

      test("calls replaceLastAssistantMessage with the fixed fallback when the corrector's output is still flagged", async () => {
        const replaced: string[] = [];
        const sink = baseSink();
        const runner = createTurnRunner({
          model: {} as any,
          systemPrompts: { singleUser: "s", multiUser: "m" },
          buildTools: () => ({}),
          getOrCreateHistory: () => fakeHistory({ replaceLastAssistantMessage: (c) => replaced.push(c) }),
          trackSession: () => {},
          registerCaptureCallback: () => {},
          maybeCapture: async () => {},
          processToolCorrections: async () => {},
          logStep: () => {},
          correctIssueListFn: () => async () => flaggedText,
          logDiscardedIssueListFn: () => {},
          runTurnFn: async () => flaggedText,
        });

        await runner(baseTurn(), sink);

        expect(replaced).toEqual([ISSUE_LIST_CORRECTION_FALLBACK]);
      });

      test("does not call replaceLastAssistantMessage when the corrector call throws (nothing changed, nothing to persist)", async () => {
        const replaced: string[] = [];
        const sink = baseSink();
        const runner = createTurnRunner({
          model: {} as any,
          systemPrompts: { singleUser: "s", multiUser: "m" },
          buildTools: () => ({}),
          getOrCreateHistory: () => fakeHistory({ replaceLastAssistantMessage: (c) => replaced.push(c) }),
          trackSession: () => {},
          registerCaptureCallback: () => {},
          maybeCapture: async () => {},
          processToolCorrections: async () => {},
          logStep: () => {},
          correctIssueListFn: () => async () => {
            throw new Error("ollama unreachable");
          },
          logDiscardedIssueListFn: () => {},
          runTurnFn: async () => flaggedText,
        });

        await runner(baseTurn(), sink);

        expect(replaced).toEqual([]);
      });
    });
  });
});
