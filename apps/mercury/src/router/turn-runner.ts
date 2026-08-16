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
import { collectFormattedLists, spliceFormattedLists } from "./format-list-splice.ts";
import { looksLikeIssueList, ISSUE_LIST_CORRECTION_FALLBACK } from "./issue-list-heuristic.ts";
import { createIssueListCorrector } from "../session/issue-list-corrector.ts";
import type { SessionHistory } from "../session/history.ts";
import { recordStep } from "../session/tool-log-buffer.ts";
import type { HandleTurn, InboundTurn, TurnSink } from "./provider.ts";

/**
 * Cap on how much of a discarded issue-list turn's original text gets
 * embedded in `logDiscardedIssueListFn`'s message — a long restated list,
 * logged in full on every discard, is an unstructured blob with no bound.
 * Larger than the terminal debug view's own inline cap (`MAX_INLINE_CHARS`,
 * 600, in `src/index.ts`) since this is a diagnostic line meant to be
 * grepped later, not a live view competing for terminal space.
 */
const MAX_LOGGED_ISSUE_LIST_CHARS = 2000;

/**
 * Fixed toolCallId passed to onToolStart/onToolFinish for the correction
 * step's status indicator — fixed, not generated, because at most one
 * correction ever runs per turn (no risk of two concurrent ids colliding).
 */
const CORRECTION_STATUS_ID = "issue-list-correction";

/**
 * Truncates plain text for a log line, same spirit as `tool-log.ts`'s
 * `truncateForDisplay` (bounded length, a marker noting the real total)
 * but deliberately not that function itself: `truncateForDisplay`
 * JSON.stringifies its input, which is right for arbitrary structured
 * values but wrong here — it would escape newlines and wrap the message
 * in quotes, turning an easily-greppable restated list into unreadable
 * escaped JSON for no benefit, since this is already plain text.
 */
function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}… (truncated, ${text.length} chars total)`;
}

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
  /** Test seam; defaults to the real `createIssueListCorrector`, bound once to `model`. */
  correctIssueListFn?: typeof createIssueListCorrector;
  /**
   * Test seam; defaults to `console.log`. Called once whenever the
   * issue-list heuristic (`looksLikeIssueList`) causes a discard of the
   * model's own text — either the corrector rewrote it, its own output was
   * still flagged and the fixed fallback was used instead, or the
   * corrector call itself failed. Carries the ORIGINAL (pre-correction)
   * text. Exists purely to measure real-world frequency before investing
   * further (a second reviewer agent, general hallucination detection).
   */
  logDiscardedIssueListFn?: (message: string) => void;
  /** Test seam; defaults to `Date.now`. */
  now?: () => number;
};

/** Builds the shared `HandleTurn` every provider's driver calls once it has a real message to run through the model. */
export function createTurnRunner(deps: TurnRunnerDeps): HandleTurn {
  const correctIssueList = (deps.correctIssueListFn ?? createIssueListCorrector)(deps.model);
  const logDiscardedIssueList = deps.logDiscardedIssueListFn ?? ((message: string) => console.log(message));

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
      if (looksLikeIssueList(text)) {
        // Reuses the same onToolStart/onToolFinish machinery already shared with
        // real tool calls and Layer-3 capture pings (registerCaptureCallback,
        // below) — no new TurnSink field needed: terminal's dim-print and Google
        // Chat's status-card patching both already handle any (label, detail?,
        // toolCallId?) triple generically.
        sink.onToolStart("Sto verificando la risposta…", undefined, CORRECTION_STATUS_ID);
        try {
          const corrected = await correctIssueList(text);
          const stillFlagged = corrected.trim().length === 0 || looksLikeIssueList(corrected);
          correctedText = stillFlagged ? ISSUE_LIST_CORRECTION_FALLBACK : corrected;
          sink.onToolFinish?.(CORRECTION_STATUS_ID, stillFlagged ? "failed" : "success");
          logDiscardedIssueList(
            `[issue-list-correction] discarded model text that looked like a rendered issue list ` +
              `(${stillFlagged ? "corrector output was still flagged; used fixed fallback" : "replaced with corrector's rewrite"}): ${truncateText(text, MAX_LOGGED_ISSUE_LIST_CHARS)}`,
          );
        } catch (err) {
          // Corrector is a quality enhancement, not a delivery guarantee — a failure here shouldn't
          // throw away an otherwise-good, already-generated answer. Degrade to the original text.
          sink.onToolFinish?.(CORRECTION_STATUS_ID, "failed");
          logDiscardedIssueList(
            `[issue-list-correction] corrector call failed, kept original text: ${truncateText(String(err instanceof Error ? err.message : err), MAX_LOGGED_ISSUE_LIST_CHARS)}`,
          );
        }
      }

      if (correctedText !== text) {
        history.replaceLastAssistantMessage(correctedText);
      }

      const finalText = spliceFormattedLists(correctedText, collectFormattedLists(steps));
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
