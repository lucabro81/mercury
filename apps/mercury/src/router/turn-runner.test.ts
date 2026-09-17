import { describe, expect, test } from "bun:test";
import { createTurnRunner, type PostTurnGuard } from "./turn-runner.ts";
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

  // Under #6 the display is no longer force-appended off the raw tool output:
  // it is stashed and shown only if the model surfaced it via `present`. The
  // turn runner asks the display store what was surfaced this turn (keyed by
  // sessionKey) and appends only that, so this test injects takeSurfacedDisplays.
  test("appends the display artifacts the model surfaced via present, in order", async () => {
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
      takeSurfacedDisplays: () => ["MER-1\nhttps://x"],
      runTurnFn: async () => "Here you go.",
    });

    await runner(baseTurn(), sink);

    expect(sink.finalized).toEqual(["Here you go.\n\nMER-1\nhttps://x"]);
  });

  test("appends multiple surfaced artifacts, joined in the order the store returns them", async () => {
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
      takeSurfacedDisplays: () => ["list-a", "list-b"],
      runTurnFn: async () => "Done.",
    });

    await runner(baseTurn(), sink);

    expect(sink.finalized).toEqual(["Done.\n\nlist-a\n\nlist-b"]);
  });

  test("appends nothing when the model surfaced no artifact (e.g. a prose-only answer)", async () => {
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
      takeSurfacedDisplays: () => [],
      runTurnFn: async () => "There are 3 open.",
    });

    await runner(baseTurn(), sink);

    expect(sink.finalized).toEqual(["There are 3 open."]);
  });

  test("appends nothing when no display store is wired (takeSurfacedDisplays absent)", async () => {
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
      runTurnFn: async () => "plain reply",
    });

    await runner(baseTurn(), sink);

    expect(sink.finalized).toEqual(["plain reply"]);
  });

  test("passes the turn's sessionKey to takeSurfacedDisplays", async () => {
    const sink = baseSink();
    const received: string[] = [];
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
      takeSurfacedDisplays: (sessionKey) => {
        received.push(sessionKey);
        return [];
      },
      runTurnFn: async () => "reply",
    });

    await runner(baseTurn({ sessionKey: "sk" }), sink);

    expect(received).toEqual(["sk"]);
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

  // The core runs plugin-contributed post-turn guards generically — it knows
  // nothing about what any guard does. These tests exercise that mechanism
  // with synthetic guards; the Jira issue-list guard's own behaviour (the
  // looksLikeIssueList gate, the corrector, the fallback, the log messages)
  // is tested against @mercury/plugin-jira in issue-list-guard.jira.test.ts,
  // and end-to-end delivery in jira-behavior.test.ts.
  describe("post-turn guards", () => {
    function makeGuard(overrides: Partial<PostTurnGuard> = {}): PostTurnGuard {
      return {
        statusLabel: "Checking…",
        statusId: "guard-1",
        shouldRun: () => true,
        run: async (text) => ({ text, outcome: "success" }),
        ...overrides,
      };
    }

    function baseDeps(
      overrides: Partial<Parameters<typeof createTurnRunner>[0]> = {},
    ): Parameters<typeof createTurnRunner>[0] {
      return {
        model: {} as any,
        systemPrompts: { singleUser: "s", multiUser: "m" },
        buildTools: () => ({}),
        getOrCreateHistory: () => fakeHistory(),
        trackSession: () => {},
        registerCaptureCallback: () => {},
        maybeCapture: async () => {},
        processToolCorrections: async () => {},
        logStep: () => {},
        runTurnFn: async () => "model text",
        ...overrides,
      };
    }

    test("delivers the model's text unchanged when no guards are registered", async () => {
      const sink = baseSink();
      const runner = createTurnRunner(baseDeps({ runTurnFn: async () => "untouched" }));
      await runner(baseTurn(), sink);
      expect(sink.finalized).toEqual(["untouched"]);
    });

    test("skips a guard whose shouldRun returns false — no run, no status, no log, text unchanged", async () => {
      const started: unknown[] = [];
      const logged: string[] = [];
      let ran = false;
      const sink = baseSink({ onToolStart: (...a) => started.push(a) });
      const runner = createTurnRunner(
        baseDeps({
          runTurnFn: async () => "Here you go.",
          logPostTurnGuardFn: (m) => logged.push(m),
          postTurnGuards: [
            makeGuard({
              shouldRun: () => false,
              run: async (t) => {
                ran = true;
                return { text: t, outcome: "success" };
              },
            }),
          ],
        }),
      );

      await runner(baseTurn(), sink);

      expect(ran).toBe(false);
      expect(started).toEqual([]);
      expect(logged).toEqual([]);
      expect(sink.finalized).toEqual(["Here you go."]);
    });

    test("runs an engaged guard: fires its status label/id, replaces the text, forwards its log", async () => {
      const started: unknown[] = [];
      const finished: unknown[] = [];
      const logged: string[] = [];
      const sink = baseSink({ onToolStart: (...a) => started.push(a), onToolFinish: (...a) => finished.push(a) });
      const runner = createTurnRunner(
        baseDeps({
          runTurnFn: async () => "original",
          logPostTurnGuardFn: (m) => logged.push(m),
          postTurnGuards: [
            makeGuard({
              statusLabel: "Sto verificando…",
              statusId: "g",
              run: async () => ({ text: "rewritten", outcome: "success", log: "did a thing" }),
            }),
          ],
        }),
      );

      await runner(baseTurn(), sink);

      expect(started).toEqual([["Sto verificando…", undefined, "g"]]);
      expect(finished).toEqual([["g", "success"]]);
      expect(logged).toEqual(["did a thing"]);
      expect(sink.finalized).toEqual(["rewritten"]);
    });

    test("forwards a guard's failed outcome to onToolFinish, and still delivers its text", async () => {
      const finished: unknown[] = [];
      const sink = baseSink({ onToolFinish: (...a) => finished.push(a) });
      const runner = createTurnRunner(
        baseDeps({
          runTurnFn: async () => "original",
          postTurnGuards: [makeGuard({ statusId: "g", run: async () => ({ text: "fallback", outcome: "failed" }) })],
        }),
      );

      await runner(baseTurn(), sink);

      expect(finished).toEqual([["g", "failed"]]);
      expect(sink.finalized).toEqual(["fallback"]);
    });

    test("a guard that throws never blocks delivery: keeps the prior text, reports failed, logs, persists nothing", async () => {
      const finished: unknown[] = [];
      const logged: string[] = [];
      const replaced: string[] = [];
      const sink = baseSink({ onToolFinish: (...a) => finished.push(a) });
      const runner = createTurnRunner(
        baseDeps({
          runTurnFn: async () => "original",
          getOrCreateHistory: () =>
            fakeHistory({
              replaceLastAssistantMessage: (t) => {
                replaced.push(t);
              },
            }),
          logPostTurnGuardFn: (m) => logged.push(m),
          postTurnGuards: [
            makeGuard({
              statusId: "boom",
              run: async () => {
                throw new Error("kaboom");
              },
            }),
          ],
        }),
      );

      await runner(baseTurn(), sink);

      expect(finished).toEqual([["boom", "failed"]]);
      expect(sink.finalized).toEqual(["original"]);
      expect(replaced).toEqual([]);
      expect(logged).toHaveLength(1);
      expect(logged[0]).toContain("kaboom");
    });

    test("runs guards before appending surfaced displays", async () => {
      const sink = baseSink();
      const runner = createTurnRunner(
        baseDeps({
          runTurnFn: async () => "flagged",
          takeSurfacedDisplays: () => ["MER-1\nhttps://x"],
          postTurnGuards: [makeGuard({ run: async () => ({ text: "clean", outcome: "success" }) })],
        }),
      );

      await runner(baseTurn(), sink);

      // the display is appended to the guard's rewritten text ("clean"), not
      // the model's original ("flagged") — proving guards run first
      expect(sink.finalized).toEqual(["clean\n\nMER-1\nhttps://x"]);
    });

    test("persists the guard's text to history when it changed the text", async () => {
      const replaced: string[] = [];
      const runner = createTurnRunner(
        baseDeps({
          runTurnFn: async () => "original",
          getOrCreateHistory: () =>
            fakeHistory({
              replaceLastAssistantMessage: (t) => {
                replaced.push(t);
              },
            }),
          postTurnGuards: [makeGuard({ run: async () => ({ text: "changed", outcome: "success" }) })],
        }),
      );

      await runner(baseTurn(), baseSink());

      expect(replaced).toEqual(["changed"]);
    });

    test("does not persist to history when the guard returned the same text", async () => {
      const replaced: string[] = [];
      const runner = createTurnRunner(
        baseDeps({
          runTurnFn: async () => "same",
          getOrCreateHistory: () =>
            fakeHistory({
              replaceLastAssistantMessage: (t) => {
                replaced.push(t);
              },
            }),
          postTurnGuards: [makeGuard({ run: async (t) => ({ text: t, outcome: "success" }) })],
        }),
      );

      await runner(baseTurn(), baseSink());

      expect(replaced).toEqual([]);
    });

    test("runs multiple guards in order, each seeing the previous guard's output", async () => {
      const sink = baseSink();
      const seen: string[] = [];
      const runner = createTurnRunner(
        baseDeps({
          runTurnFn: async () => "a",
          postTurnGuards: [
            makeGuard({
              statusId: "g1",
              run: async (t) => {
                seen.push(t);
                return { text: `${t}b`, outcome: "success" };
              },
            }),
            makeGuard({
              statusId: "g2",
              run: async (t) => {
                seen.push(t);
                return { text: `${t}c`, outcome: "success" };
              },
            }),
          ],
        }),
      );

      await runner(baseTurn(), sink);

      expect(seen).toEqual(["a", "ab"]);
      expect(sink.finalized).toEqual(["abc"]);
    });
  });
});
