/**
 * Isolated, context-free LLM call that rewrites text flagged by
 * `looksLikeIssueList` (see `./issue-list-heuristic.ts`) — the model's own
 * free-text restatement of a Jira issue list, which duplicates the
 * deterministic `formattedList` already appended in code.
 *
 * Deliberately context-free: this call receives ONLY the flagged text,
 * no conversation history, no tools, no system prompt beyond the one
 * narrow instruction below. A corrector that never saw the raw ticket
 * data has nothing to "want" to re-list — same reasoning as why
 * `formattedList` itself is hidden from the main model
 * (`omitFormattedListForModel` in the core's `cli-tool.ts`), applied to a
 * second, smaller model call instead of the main turn.
 *
 * Uses plain `"ai"`'s `generateText`, not `ai-sdk-ollama`'s enhanced
 * version — deliberate: the documented empty-text-after-tool-call Ollama
 * quirk only affects tool-calling turns, and this call passes no `tools`.
 *
 * Moved out of the core (`apps/mercury/src/session/issue-list-corrector.ts`)
 * in step 2.4 together with the heuristic and the guard that drives it: the
 * prompt is Jira-specific, so it belongs to the plugin. The composition root
 * (or a test) injects the resulting function into `createIssueListGuard`.
 */
import { generateText, type LanguageModel } from "ai";

/**
 * The only instruction the corrector gets. Framed as a text-correction
 * tool, not a conversational assistant, since it must never add
 * commentary of its own — only strip the list and preserve the rest.
 */
export const ISSUE_LIST_CORRECTOR_SYSTEM_PROMPT =
  "You are a text-correction tool, not a conversational assistant. You will receive exactly one piece of " +
  "text. If it contains a list of Jira issues — as bulleted or numbered lines, or as one issue key " +
  'immediately followed by a colon per line (e.g. "PROJ-123: some text", no bullet) — remove that list ' +
  "entirely. Rewrite whatever text remains so it no longer refers to a list, staying faithful to its " +
  "original meaning and language — don't translate, don't add new information, don't comment on what you " +
  "changed. If the text contains no such list, return it unchanged.";

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
