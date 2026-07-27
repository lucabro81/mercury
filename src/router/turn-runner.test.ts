import { describe, expect, test } from "bun:test";
import { createTurnRunner } from "./turn-runner.ts";
import type { InboundTurn, TurnSink } from "./provider.ts";
import type { SessionHistory } from "../session/history.ts";
import type { StepInfo } from "../session/step-info.ts";

function fakeHistory(): SessionHistory {
  return {
    addUserMessage: async () => {},
    addAssistantMessage: async () => {},
    getMessages: () => [],
    getCharCount: () => 0,
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

  test("calls buildTools with the turn's sessionKey, wikiUserId, and the sink's onToolStart", async () => {
    const calls: Array<[string, string, unknown]> = [];
    const onToolStart = () => {};
    const runner = createTurnRunner({
      model: {} as any,
      systemPrompts: { singleUser: "s", multiUser: "m" },
      buildTools: (sessionKey, wikiUserId, cb) => {
        calls.push([sessionKey, wikiUserId, cb]);
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

    await runner(baseTurn({ sessionKey: "sk", wikiUserId: "wu" }), baseSink({ onToolStart }));

    expect(calls).toEqual([["sk", "wu", onToolStart]]);
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
});
