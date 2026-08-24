/**
 * Guarantees the user-facing `display` channel a plugin's post-processor
 * attached (see `@mercury/plugin-jira`'s issue-list extractor and the formatter
 * decorator that renders it, `ToolDisplay`) reaches the user regardless of
 * whether the model chose to relay it — the
 * model never even sees `display` (`omitDisplayForModel` strips it before it
 * reaches the model's context, see `src/tools/cli-tool.ts`), so these
 * functions work off the raw tool-result `output` captured by `onStepFinish`,
 * which is unaffected by that stripping.
 */
import type { ToolDisplay } from "@mercury/plugin-types";
import type { StepInfo } from "../session/step-info.ts";

function isToolDisplay(value: unknown): value is ToolDisplay {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { type?: unknown }).type === "string" &&
    Array.isArray((value as { items?: unknown }).items)
  );
}

/** Every distinct already-rendered display string across a turn's tool results,
 * in encounter order. The formatter decorator has, by this point, replaced each
 * formatted `display`'s structured items with the one text block its render
 * handler produced (see `plugins/formatter.ts`), so the core only collects and
 * dedupes those string items — it does no rendering and keys on no `display.type`.
 * A display whose items are still structured (no formatter was applied to that
 * plugin) contributes nothing, as does a result with no display. */
export function collectDisplayStrings(steps: StepInfo[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const step of steps) {
    for (const toolResult of step.toolResults) {
      const output = toolResult.output;
      if (typeof output !== "object" || output === null) continue;
      const display = (output as { display?: unknown }).display;
      if (!isToolDisplay(display)) continue;
      for (const item of display.items) {
        if (typeof item !== "string") continue;
        if (seen.has(item)) continue;
        seen.add(item);
        result.push(item);
      }
    }
  }
  return result;
}

/** Appends any collected display string not already present verbatim in `text`, in encounter order. */
export function spliceFormattedLists(text: string, lists: string[]): string {
  const missing = lists.filter((list) => !text.includes(list));
  if (missing.length === 0) return text;
  return [text, ...missing].filter((part) => part !== "").join("\n\n");
}
