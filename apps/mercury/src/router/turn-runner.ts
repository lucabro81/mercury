/**
 * Deduplicates what `src/index.ts` used to do twice: two near-identical
 * ~50-line closures, one per channel, that (1) tracked the session for
 * Layer-3 capture when the channel has a real per-user identity, (2) ran
 * `runTurn` with a channel-specific tool set/system prompt/output sink,
 * and (3) mirrored new messages to Qdrant and extracted procedural
 * corrections once the turn resolved. `createTurnRunner` is that shared
 * body, parameterized entirely by `Provider`/`InboundTurn`/`TurnSink`
 * (`src/router/provider.ts`) so it doesn't know or care which provider a
 * given turn came from — same channel-agnostic spirit as `runTurn` itself.
 */
import type { LanguageModel, Tool } from "ai";
import { runTurn } from "../session/agent-turn.ts";
import type { StepInfo } from "../session/step-info.ts";
// `PostTurnGuard` is part of the plugin contract (a plugin's `build()` returns
// these — see `@mercury/plugin-jira`'s `createIssueListGuard`), so it lives in
// `@mercury/plugin-types` and is re-exported here for the core callers that
// import it from this module. A guard that throws is caught by the core and
// never blocks delivery — a guard failure is a quality miss, not a reason to
// withhold an already-generated answer.
import type { PostTurnGuard } from "@mercury/plugin-types";
export type { PostTurnGuard };
import type { SessionHistory } from "../session/history.ts";
import { recordStep } from "../session/tool-log-buffer.ts";
import type { HandleTurn, InboundTurn, TurnSink } from "./provider.ts";

export type TurnRunnerDeps = {
  model: LanguageModel;
  /** Both variants, precomposed by the composition root; selected per turn by `turn.multiUser`. */
  systemPrompts: { singleUser: string; multiUser: string };
  buildTools: (
    sessionKey: string,
    wikiUserId: string,
    onToolStart?: TurnSink["onToolStart"],
    onToolFinish?: TurnSink["onToolFinish"],
  ) => Record<string, Tool>;
  /**
   * `userId` is forwarded (not interpreted here) so a provider's own
   * closure can decide whether to seed a first-ever session with a
   * context primer (see `src/session/context-primer.ts`) — building one
   * needs a real per-user identity, which only some providers have.
   */
  getOrCreateHistory: (sessionKey: string, trackForCapture: boolean, userId: string | undefined) => Promise<SessionHistory> | SessionHistory;
  /** Layer-3 session tracking (sessionUsers map + idle scanner touch). Only for turns that carry a userId. */
  trackSession: (sessionKey: string, userId: string, at: number) => void;
  /** Refreshes this turn's tool-status callbacks for out-of-band capture messages. */
  registerCaptureCallback: (sessionKey: string, onToolStart: TurnSink["onToolStart"], onToolFinish: TurnSink["onToolFinish"]) => void;
  /** Mid-conversation Layer-3 capture threshold check. Only for turns that carry a userId. */
  maybeCapture: (sessionKey: string, history: SessionHistory) => Promise<void>;
  processToolCorrections: (steps: StepInfo[], onToolStart: TurnSink["onToolStart"], onToolFinish: TurnSink["onToolFinish"]) => Promise<void>;
  logStep: (prefix: string, step: StepInfo) => void;
  /** Test seam; defaults to the real `recordStep`. */
  recordStepFn?: typeof recordStep;
  /** Test seam; defaults to the real `runTurn`. */
  runTurnFn?: typeof runTurn;
  /**
   * Post-turn guards contributed by loaded plugins, run in order over the
   * model's finished text (see `PostTurnGuard`). Empty/absent on an instance
   * with no plugin that registers one. The composition root builds these; the
   * core knows nothing about what any of them does.
   */
  postTurnGuards?: PostTurnGuard[];
  /**
   * Test seam; defaults to `console.log`. Receives a guard's own `log` line
   * (e.g. the issue-list guard's "discarded model text…" message), or the
   * core's own note when a guard throws. Exists to measure real-world guard
   * frequency before investing further.
   */
  logPostTurnGuardFn?: (message: string) => void;
  /** Test seam; defaults to `Date.now`. */
  now?: () => number;
  /**
   * Returns the display artifacts the model surfaced via `present` this turn
   * (see `display-store.ts`), in stash order, to append after the model's
   * text. Absent on an instance with no display store — nothing is appended.
   * The old unconditional splicing of every tool-produced display is gone:
   * an artifact is shown only when the model explicitly presented it.
   */
  takeSurfacedDisplays?: (sessionKey: string) => string[];
};

/** Builds the shared `HandleTurn` every provider's driver calls once it has a real message to run through the model. */
export function createTurnRunner(deps: TurnRunnerDeps): HandleTurn {
  const postTurnGuards = deps.postTurnGuards ?? [];
  const logPostTurnGuard = deps.logPostTurnGuardFn ?? ((message: string) => console.log(message));

  return async (turn: InboundTurn, sink: TurnSink): Promise<void> => {
    const tracked = turn.userId !== undefined;
    if (tracked) {
      deps.trackSession(turn.sessionKey, turn.userId as string, (deps.now ?? Date.now)());
      deps.registerCaptureCallback(turn.sessionKey, sink.onToolStart, sink.onToolFinish);
    }

    const steps: StepInfo[] = [];
    let history: SessionHistory;

    try {
      // Inside the try, not before it: a failure building the history
      // (e.g. the context-primer's Qdrant query) must still release the
      // sink (see TurnSink.dispose's doc comment) — a stuck-note timer
      // already scheduled when the sink was constructed keeps running
      // otherwise, firing on its own 60s schedule regardless of whether
      // the turn itself already failed and was reported.
      history = await deps.getOrCreateHistory(turn.sessionKey, tracked, turn.userId);
      const text = await (deps.runTurnFn ?? runTurn)(history, turn.text, {
        model: deps.model,
        tools: deps.buildTools(turn.sessionKey, turn.wikiUserId, sink.onToolStart, sink.onToolFinish),
        system: turn.multiUser ? deps.systemPrompts.multiUser : deps.systemPrompts.singleUser,
        onTextChunk: sink.onTextChunk,
        onReasoningChunk: sink.onReasoningChunk,
        onReasoningEnd: sink.onReasoningEnd,
        onStepFinish: (step) => {
          steps.push(step);
          deps.logStep(turn.logPrefix, step);
          (deps.recordStepFn ?? recordStep)(turn.channel, turn.sessionKey, step);
          sink.onStep?.(step);
        },
        onUsage: sink.onUsage,
      });

      let correctedText = text;
      // Plugin-contributed post-turn guards, run in order. `shouldRun` gates
      // both the rewrite and its status indicator (so a guard that doesn't
      // engage shows nothing), and reuses the same onToolStart/onToolFinish
      // machinery already shared with real tool calls and Layer-3 capture pings
      // — terminal's dim-print and Google Chat's status-card patching both
      // handle any (label, detail?, toolCallId?) triple generically. A guard
      // that throws is caught here and never blocks delivery.
      for (const guard of postTurnGuards) {
        if (!guard.shouldRun(correctedText)) {
          continue;
        }
        sink.onToolStart(guard.statusLabel, undefined, guard.statusId);
        try {
          const guarded = await guard.run(correctedText, steps);
          sink.onToolFinish?.(guard.statusId, guarded.outcome);
          if (guarded.log !== undefined) {
            logPostTurnGuard(guarded.log);
          }
          correctedText = guarded.text;
        } catch (err) {
          sink.onToolFinish?.(guard.statusId, "failed");
          logPostTurnGuard(
            `[post-turn-guard] guard "${guard.statusId}" threw, kept text unchanged: ${String(err instanceof Error ? err.message : err)}`,
          );
        }
      }

      if (correctedText !== text) {
        history.replaceLastAssistantMessage(correctedText);
      }

      // Append only what the model chose to `present` this turn — never the
      // whole set of tool-produced displays. Appending (not replacing) keeps
      // the already-streamed prefix intact, so terminal.ts's safe-slice holds.
      const surfaced = deps.takeSurfacedDisplays?.(turn.sessionKey) ?? [];
      const finalText = [correctedText, ...surfaced].filter((part) => part !== "").join("\n\n");
      await sink.finalize(finalText);
    } finally {
      sink.dispose();
    }

    if (tracked) {
      await deps.maybeCapture(turn.sessionKey, history);
    }
    await deps.processToolCorrections(steps, sink.onToolStart, sink.onToolFinish);
  };
}
