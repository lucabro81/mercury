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
  /** Test seam; defaults to `Date.now`. */
  now?: () => number;
};

/** Builds the shared `HandleTurn` every provider's driver calls once it has a real message to run through the model. */
export function createTurnRunner(deps: TurnRunnerDeps): HandleTurn {
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
      await sink.finalize(text);
    } finally {
      sink.dispose();
    }

    if (tracked) {
      await deps.maybeCapture(turn.sessionKey, history);
    }
    await deps.processToolCorrections(steps, sink.onToolStart, sink.onToolFinish);
  };
}
