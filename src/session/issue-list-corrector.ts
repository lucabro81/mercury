/**
 * Isolated, context-free LLM call that rewrites text flagged by
 * `looksLikeIssueList` (see `../router/issue-list-heuristic.ts`) — the
 * model's own free-text restatement of a Jira issue list, which
 * duplicates the deterministic `formattedList` already appended in code.
 *
 * Deliberately context-free: this call receives ONLY the flagged text,
 * no conversation history, no tools, no system prompt beyond the one
 * narrow instruction below. A corrector that never saw the raw ticket
 * data has nothing to "want" to re-list — same reasoning as why
 * `formattedList` itself is hidden from the main model (see
 * `omitFormattedListForModel` in `../tools/cli-tool.ts`), applied to a
 * second, smaller model call instead of the main turn.
 *
 * Uses plain `"ai"`'s `generateText`, not `ai-sdk-ollama`'s enhanced
 * version — deliberate, not an oversight: the documented empty-text-
 * after-tool-call Ollama quirk (why `agent-turn.ts` and
 * `self-review-runner.ts` use `ai-sdk-ollama` instead) only affects
 * tool-calling turns. This call passes no `tools`, exactly like
 * `summarizer.ts`/`episodic-summarizer.ts` already rely on for the same
 * reason.
 *
 * No dedicated test file, same justification as those two files: this is
 * one line of glue around `generateText`, not worth mocking deeply. The
 * decision logic — when to call this, what to do with its output or a
 * failure — is tested where it actually lives, in `../router/turn-runner.ts`.
 *
 * Used by: `src/router/turn-runner.ts`, via the injectable
 * `correctIssueListFn` test seam.
 */
import { generateText, type LanguageModel } from "ai";

/**
 * The only instruction the corrector gets. Framed as a text-correction
 * tool, not a conversational assistant, since it must never add
 * commentary of its own — only strip the list and preserve the rest.
 */
export const ISSUE_LIST_CORRECTOR_SYSTEM_PROMPT =
  "You are a text-correction tool, not a conversational assistant. You will receive exactly one piece of " +
  "text. If it contains a list of Jira issues (bulleted or numbered lines referencing issue keys like " +
  "PROJ-123), remove that list entirely. Rewrite whatever text remains so it no longer refers to a list, " +
  "staying faithful to its original meaning and language — don't translate, don't add new information, " +
  "don't comment on what you changed. If the text contains no such list, return it unchanged.";

/**
 * Returns a function that rewrites flagged text via `model`, following
 * the one instruction above.
 */
export function createIssueListCorrector(model: LanguageModel): (text: string) => Promise<string> {
  return async (text) => {
    const { text: corrected } = await generateText({
      model,
      system: ISSUE_LIST_CORRECTOR_SYSTEM_PROMPT,
      prompt: text,
    });
    return corrected;
  };
}
