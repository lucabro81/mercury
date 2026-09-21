/**
 * The generic formatter decorator — the mechanism half of the cascade
 * formatter. `formatterPlugin(plugin, handler)` wraps a data plugin and returns
 * a plugin: it runs the wrapped plugin's post-processors unchanged, then renders
 * each ok result's user-facing `display` by handing its structured `items` to
 * `handler` and replacing them with the single rendered text block the handler
 * returns.
 *
 * It is deliberately format-blind: it never reads `display.type`. The knowledge
 * of what a given display *means* — the fields it carries, the conditional
 * bracket, the join, the empty-set sentence — lives entirely in the `handler`,
 * which is supplied where the instance is composed (`mercury.config.ts`). The
 * data ↔ handler pairing is made by placing them side by side there; nothing
 * looks a renderer up by a type string, so the core never has to know any
 * format's name. A result that isn't ok, or carries no display, passes through
 * untouched and the handler is not called. Every other contribution (post-turn
 * guards, skills) and every top-level plugin field pass through verbatim.
 *
 * One handler per plugin today; a plugin that emits more than one display kind
 * is a parked follow-up (a `type → handler` map, still inside this composition
 * config, never the core).
 */
import type { Plugin, CliPostProcessor, CliResult } from "@mercury/plugin-types";

/** Renders one display's structured `items` into the single user-facing text
 * block appended to the reply. Supplied at composition; owns all format
 * knowledge for the plugin it's paired with. */
export type DisplayHandler = (items: unknown[]) => string;

/** Applies `handler` to an ok result's display, replacing its structured items
 * with the one rendered block. A non-ok result, or one with no display, is
 * returned unchanged (the handler is never called). */
function renderDisplay(result: CliResult, handler: DisplayHandler): CliResult {
  if (!result.ok || !result.display) {
    return result;
  }
  return { ...result, display: { ...result.display, items: [handler(result.display.items)] } };
}

/**
 * Wraps `plugin` so each of its post-processors renders its result's display
 * through `handler`. Returns a new plugin identical to `plugin` except for a
 * `build` that first runs the inner `build` (passing the runtime context
 * straight through) and then wraps its post-processors; all other inner
 * contributions and top-level fields are preserved.
 */
export function formatterPlugin(plugin: Plugin, handler: DisplayHandler): Plugin {
  return {
    ...plugin,
    build: (ctx) => {
      const inner = plugin.build ? plugin.build(ctx) : {};
      const wrapped: Record<string, CliPostProcessor> = {};
      for (const [name, proc] of Object.entries(inner.postProcessors ?? {})) {
        wrapped[name] = (parsedCmd, result) => renderDisplay(proc(parsedCmd, result), handler);
      }
      // The wrapped post-processors flow to the plugin's `sessionTools` factory
      // (the composition hands them in), so the tool renders the display; every
      // other inner contribution — the factory itself, status describers,
      // guards — passes through untouched.
      return { ...inner, postProcessors: wrapped };
    },
  };
}
