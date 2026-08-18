/**
 * The Jira post-turn guard: the plugin's implementation of the core's generic
 * "run something over the model's finished text before it reaches the user"
 * extension point (see `createTurnRunner`'s `postTurnGuards` in the core's
 * `turn-runner.ts`). It bundles the Jira-specific pieces the core used to
 * hardcode — the `looksLikeIssueList` gate, the context-free corrector, the
 * fixed fallback, the status label, and the per-case log message — into one
 * object the composition root registers.
 *
 * The returned object mirrors the core's `PostTurnGuard` shape structurally
 * (like the formatter mirrors `CliPostProcessor`): a plugin package must not
 * import from the app it plugs into, so the composition root's assignment into
 * the core's guard list is where the compatibility is checked. Fase 3 hoists
 * the guard type into the shared interface.
 *
 * `run` catches the corrector's own throw and degrades to the original text
 * (a corrector failure is a quality miss, not a delivery failure); the core
 * still wraps every guard in its own try/catch as a last-resort net.
 */
import { looksLikeIssueList, ISSUE_LIST_CORRECTION_FALLBACK } from "./issue-list-heuristic.ts";

/** Status label shown while the guard runs — only when it engages (see `shouldRun`). */
const STATUS_LABEL = "Sto verificando la risposta…";

/** Fixed correlation id for the guard's onToolStart/onToolFinish pair — fixed,
 * not generated, because at most one issue-list correction runs per turn. */
const STATUS_ID = "issue-list-correction";

/**
 * Cap on how much of a discarded issue-list turn's original text goes into the
 * log message — a long restated list, logged in full on every discard, is an
 * unbounded blob. Larger than the terminal debug view's own inline cap since
 * this is a diagnostic line meant to be grepped later, not a live view.
 */
const MAX_LOGGED_ISSUE_LIST_CHARS = 2000;

function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}… (truncated, ${text.length} chars total)`;
}

export type IssueListGuardResult = { text: string; outcome: "success" | "failed"; log?: string };

export type IssueListGuard = {
  statusLabel: string;
  statusId: string;
  shouldRun: (text: string) => boolean;
  run: (text: string) => Promise<IssueListGuardResult>;
};

/**
 * Builds the guard from a corrector function — the context-free rewrite call
 * (see `createIssueListCorrector`), injected so a test can control its output
 * without a real model.
 */
export function createIssueListGuard(correct: (text: string) => Promise<string>): IssueListGuard {
  return {
    statusLabel: STATUS_LABEL,
    statusId: STATUS_ID,
    shouldRun: (text) => looksLikeIssueList(text),
    run: async (text) => {
      try {
        const corrected = await correct(text);
        const stillFlagged = corrected.trim().length === 0 || looksLikeIssueList(corrected);
        return {
          text: stillFlagged ? ISSUE_LIST_CORRECTION_FALLBACK : corrected,
          outcome: stillFlagged ? "failed" : "success",
          log:
            `[issue-list-correction] discarded model text that looked like a rendered issue list ` +
            `(${stillFlagged ? "corrector output was still flagged; used fixed fallback" : "replaced with corrector's rewrite"}): ${truncateText(text, MAX_LOGGED_ISSUE_LIST_CHARS)}`,
        };
      } catch (err) {
        // Corrector is a quality enhancement, not a delivery guarantee — a
        // failure here shouldn't throw away an otherwise-good answer.
        return {
          text,
          outcome: "failed",
          log: `[issue-list-correction] corrector call failed, kept original text: ${truncateText(String(err instanceof Error ? err.message : err), MAX_LOGGED_ISSUE_LIST_CHARS)}`,
        };
      }
    },
  };
}
