/**
 * Cheap, code-level detector for "the model wrote its own rendition of a
 * Jira issue list" — the specific duplication problem that survives even
 * after the deterministic `formattedList` is hidden from the model and
 * appended in code (see `format-list-splice.ts`): the model still has the
 * raw `issues` data for legitimate analysis, and sometimes restates it as
 * a bulleted/numbered list instead of just commenting on it. Used both as
 * the gate deciding whether to invoke the corrector (`issue-list-corrector.ts`)
 * and, unchanged, to re-check the corrector's own output — see
 * `turn-runner.ts`.
 */

/**
 * A line that looks like one item of a rendered issue list, in either of
 * two shapes seen in practice:
 *
 * 1. A list marker (`-`, `*`, `•`, `1.`, `1)`) followed by something
 *    shaped like a Jira issue key (`[A-Z][A-Z0-9]*-\d+`, the same shape as
 *    `issue.key` in `issue-list-formatter.ts`) anywhere in the line.
 * 2. A line starting directly with an issue key immediately followed by a
 *    colon (`KEY: text`, no marker at all) — confirmed live 2026-08-08:
 *    asked for "one line each", the model rendered exactly this shape and
 *    the marker-only version of this regex missed it entirely.
 *
 * Deliberately excludes the deterministic `formattedList`'s own shape
 * either way: `formatOneIssue` (see `issue-list-formatter.ts`) never
 * emits a leading marker, and never puts a colon directly after the key —
 * its line is `KEY [status] summary` or, when there's no status, plain
 * `KEY summary` (key, space, text — no colon). Neither shape 1 nor shape 2
 * above can match that, so this can only ever match the model's own
 * free-form rendition, never the code-built list itself.
 */
const ISSUE_LIST_LINE =
  /^[ \t]*(?:(?:[-*•]|\d+[.)])[ \t]+.*\b[A-Z][A-Z0-9]*-\d+\b|[A-Z][A-Z0-9]*-\d+:[ \t]+\S)/gm;

/**
 * Flags text that looks like a rendered issue list: at least two lines
 * matching `ISSUE_LIST_LINE`. Requiring two (not one) avoids flagging a
 * single incidental bullet that merely mentions a ticket in passing —
 * that's normal prose, not a restated list.
 *
 * Uses `.match()`, not `.test()`/`.exec()`, on purpose: those carry
 * `lastIndex` state on the shared `g`-flagged regex object across calls,
 * which would corrupt the result of a later call — production calls this
 * function twice per turn (the model's original text, then the
 * corrector's output), so that statefulness would be a real bug here, not
 * a theoretical one. `.match()` is stateless per call and safe to reuse.
 */
export function looksLikeIssueList(text: string): boolean {
  return (text.match(ISSUE_LIST_LINE)?.length ?? 0) >= 2;
}

/**
 * Last-resort reply when the corrector's own output still looks like a
 * rendered issue list (see `turn-runner.ts`) — never let a still-broken
 * free-text answer reach the user. `formattedList` still gets appended
 * after this, unaffected either way.
 */
export const ISSUE_LIST_CORRECTION_FALLBACK = "Ecco i risultati.";
