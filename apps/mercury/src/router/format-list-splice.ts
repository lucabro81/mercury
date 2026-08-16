/**
 * Guarantees a Jira `formattedList` (see
 * `src/tools/jira/issue-list-formatter.ts`) reaches the user regardless of
 * whether the model chose to relay it — the model never even sees the
 * field (`omitFormattedListForModel` strips it before it reaches the
 * model's context, see `src/tools/cli-tool.ts`), so these two functions
 * work off the raw tool-result `output` captured by `onStepFinish`, which
 * is unaffected by that stripping.
 */
import type { StepInfo } from "../session/step-info.ts";

/** Every distinct formattedList across a turn's tool results, in encounter order. */
export function collectFormattedLists(steps: StepInfo[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const step of steps) {
    for (const toolResult of step.toolResults) {
      const output = toolResult.output;
      if (typeof output !== "object" || output === null) continue;
      const data = (output as { data?: unknown }).data;
      if (typeof data !== "object" || data === null) continue;
      const formattedList = (data as { formattedList?: unknown }).formattedList;
      if (typeof formattedList !== "string" || seen.has(formattedList)) continue;
      seen.add(formattedList);
      result.push(formattedList);
    }
  }
  return result;
}

/** Appends any formattedList not already present verbatim in `text`, in encounter order. */
export function spliceFormattedLists(text: string, lists: string[]): string {
  const missing = lists.filter((list) => !text.includes(list));
  if (missing.length === 0) return text;
  return [text, ...missing].filter((part) => part !== "").join("\n\n");
}
