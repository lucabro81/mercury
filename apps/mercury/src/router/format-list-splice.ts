/**
 * Guarantees the user-facing `display` channel a plugin's post-processor
 * attached (see `@mercury/plugin-jira`'s issue-list formatter, `ToolDisplay`)
 * reaches the user regardless of whether the model chose to relay it — the
 * model never even sees `display` (`omitDisplayForModel` strips it before it
 * reaches the model's context, see `src/tools/cli-tool.ts`), so these
 * functions work off the raw tool-result `output` captured by `onStepFinish`,
 * which is unaffected by that stripping.
 */
import type { ToolDisplay } from "@mercury/plugin-types";
import type { StepInfo } from "../session/step-info.ts";

/**
 * Renders a `display` channel into the user-facing string appended to the
 * reply, keyed by `display.type`. Only `issue-list` exists today: it joins the
 * plugin's already-rendered lines with a blank line between them and renders an
 * empty set as a sentence. This single wired renderer is a deliberate,
 * transitional bridge — a later change replaces this map with a plugin-
 * contributed, per-channel renderer registry, at which point the item shape can
 * grow richer than the pre-rendered strings it holds today. An unknown type
 * renders nothing (the display is skipped), never throws.
 */
const displayRenderers: Record<string, (items: unknown[]) => string> = {
  "issue-list": (items) => {
    const lines = items.filter((item): item is string => typeof item === "string");
    return lines.length === 0 ? "No matching issues." : lines.join("\n\n");
  },
};

function isToolDisplay(value: unknown): value is ToolDisplay {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { type?: unknown }).type === "string" &&
    Array.isArray((value as { items?: unknown }).items)
  );
}

/** Every distinct display-channel rendering across a turn's tool results, in
 * encounter order. Reads each result's top-level `display`, renders it via its
 * type's renderer, and dedupes identical strings (a display whose type has no
 * renderer contributes nothing). */
export function collectDisplayStrings(steps: StepInfo[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const step of steps) {
    for (const toolResult of step.toolResults) {
      const output = toolResult.output;
      if (typeof output !== "object" || output === null) continue;
      const display = (output as { display?: unknown }).display;
      if (!isToolDisplay(display)) continue;
      const renderer = displayRenderers[display.type];
      if (!renderer) continue;
      const rendered = renderer(display.items);
      if (seen.has(rendered)) continue;
      seen.add(rendered);
      result.push(rendered);
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
