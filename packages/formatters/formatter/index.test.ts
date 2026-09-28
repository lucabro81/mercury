/**
 * Tests for the formatter: `formatter(rules)` applies an instance's rule for a
 * display's kind and nothing else, and `formatterPlugin(plugin, handler)` wraps
 * a data plugin's post-processor so every display it emits goes through the
 * handler — passing every other contribution through untouched. Synthetic
 * plugins and item shapes only: this pins the mechanism, not any real plugin.
 */
import { describe, expect, test } from "bun:test";
import {
  PLUGIN_API_VERSION,
  type Plugin,
  type PluginRuntimeContributions,
  type PluginRuntimeContext,
  type CliResult,
} from "@mercury/plugin-types";
import { formatter, formatterPlugin } from "./index.ts";

type Displays = {
  "thing-list": { id: string; label: string | null };
  "other-list": { n: number };
};

const thingLine = (t: Displays["thing-list"]) => `${t.id}${t.label ? ` (${t.label})` : ""}`;

describe("formatter", () => {
  test("renders each item with the rule for the display's kind, one blank line apart", () => {
    const render = formatter<Displays>({ "thing-list": thingLine });
    expect(render({ type: "thing-list", items: [{ id: "A", label: "a" }, { id: "B", label: null }] })).toBe("A (a)\n\nB");
  });

  test("picks the rule by kind when several are configured", () => {
    const render = formatter<Displays>({ "thing-list": thingLine, "other-list": (o) => `#${o.n}` });
    expect(render({ type: "other-list", items: [{ n: 1 }, { n: 2 }] })).toBe("#1\n\n#2");
    expect(render({ type: "thing-list", items: [{ id: "A", label: null }] })).toBe("A");
  });

  test("accepts a rule in object form, with the same per-item line", () => {
    const render = formatter<Displays>({ "thing-list": { item: thingLine } });
    expect(render({ type: "thing-list", items: [{ id: "A", label: null }, { id: "B", label: "b" }] })).toBe("A\n\nB (b)");
  });

  test("shows the rule's empty text for an empty list", () => {
    const render = formatter<Displays>({ "thing-list": { item: thingLine, empty: "Nothing here." } });
    expect(render({ type: "thing-list", items: [] })).toBe("Nothing here.");
  });

  test("has nothing to show for an empty list when the rule sets no empty text", () => {
    expect(formatter<Displays>({ "thing-list": thingLine })({ type: "thing-list", items: [] })).toBeUndefined();
    expect(formatter<Displays>({ "thing-list": { item: thingLine } })({ type: "thing-list", items: [] })).toBeUndefined();
  });

  test("has nothing to show for a kind with no rule", () => {
    const render = formatter<Displays>({ "thing-list": thingLine });
    expect(render({ type: "other-list", items: [{ n: 1 }] })).toBeUndefined();
    expect(render({ type: "never-declared", items: [{ x: 1 }] })).toBeUndefined();
  });

  test("rejects, at compile time, a kind the plugin doesn't declare", () => {
    // @ts-expect-error — "thing-lsit" is not a declared kind
    formatter<Displays>({ "thing-lsit": thingLine });
    // @ts-expect-error — the rule's item type must match the kind's item shape
    formatter<Displays>({ "other-list": thingLine });
  });
});

const logs: string[] = [];
const ctx: PluginRuntimeContext = { model: {} as never, env: {}, log: (m) => logs.push(m) };
const cmd = { binary: "data", args: [], prefix: [] };

/** A minimal plugin whose `build` returns exactly the contributions given. */
function pluginWith(contributions: PluginRuntimeContributions, extra: Partial<Plugin> = {}): Plugin {
  return { apiVersion: PLUGIN_API_VERSION, name: "data", build: () => contributions, ...extra };
}

/** A plugin whose post-processor always returns `result`. */
function emitting(result: CliResult): Plugin {
  return pluginWith({ postProcess: () => result });
}

describe("formatterPlugin", () => {
  test("replaces an ok result's structured items with the handler's single rendered block", () => {
    let seen: unknown;
    const decorated = formatterPlugin(
      emitting({ ok: true, data: { raw: 1 }, display: { type: "thing-list", items: [{ id: "A" }, { id: "B" }] } }),
      (display) => {
        seen = display;
        return "RENDERED";
      },
    );

    const result = decorated.build!(ctx).postProcess!(cmd, { ok: true, data: {} });

    expect(seen).toEqual({ type: "thing-list", items: [{ id: "A" }, { id: "B" }] });
    expect(result).toEqual({ ok: true, data: { raw: 1 }, display: { type: "thing-list", items: ["RENDERED"] } });
  });

  test("hands the post-processor the command it was given", () => {
    let received: unknown;
    const base = pluginWith({ postProcess: (c, r) => ((received = c), r) });
    formatterPlugin(base, () => "R").build!(ctx).postProcess!({ binary: "b", args: ["x"], prefix: ["x"] }, { ok: true, data: {} });
    expect(received).toEqual({ binary: "b", args: ["x"], prefix: ["x"] });
  });

  test("drops the display when the handler has nothing to show for an empty list", () => {
    const decorated = formatterPlugin(emitting({ ok: true, data: { raw: 1 }, display: { type: "thing-list", items: [] } }), () => undefined);
    expect(decorated.build!(ctx).postProcess!(cmd, { ok: true, data: {} })).toEqual({ ok: true, data: { raw: 1 } });
  });

  test("leaves a non-empty display structured, and logs it, when the handler has no rule for its kind", () => {
    logs.length = 0;
    const emitted: CliResult = { ok: true, data: {}, display: { type: "thing-list", items: [{ id: "A" }] } };
    const decorated = formatterPlugin(pluginWith({ postProcess: () => emitted }, { name: "jira" }), () => undefined);

    expect(decorated.build!(ctx).postProcess!(cmd, { ok: true, data: {} })).toEqual(emitted);
    expect(logs).toEqual(['[formatter] no rule for "thing-list" lists from plugin "jira" — list not shown']);
  });

  test("leaves an ok result with no display untouched, handler not called", () => {
    let called = false;
    const decorated = formatterPlugin(emitting({ ok: true, data: { raw: 1 } }), () => ((called = true), "X"));
    expect(decorated.build!(ctx).postProcess!(cmd, { ok: true, data: {} })).toEqual({ ok: true, data: { raw: 1 } });
    expect(called).toBe(false);
  });

  test("leaves an error result untouched, handler not called", () => {
    let called = false;
    const decorated = formatterPlugin(emitting({ ok: false, error: "boom" }), () => ((called = true), "X"));
    expect(decorated.build!(ctx).postProcess!(cmd, { ok: true, data: {} })).toEqual({ ok: false, error: "boom" });
    expect(called).toBe(false);
  });

  test("passes through every other contribution and top-level field", () => {
    const guard = { statusLabel: "g", statusId: "g", shouldRun: () => false, run: async (t: string) => ({ text: t, outcome: "success" as const }) };
    const factory = () => ({ myTool: {} as never });
    const base = pluginWith(
      { postTurnGuards: [guard], sessionTools: factory },
      { name: "jira", dependsOn: ["x"], systemPromptFragment: "frag", skills: [{ name: "s", description: "d", body: "b" }] },
    );
    const decorated = formatterPlugin(base, () => "R");
    const built = decorated.build!(ctx);

    expect(decorated.name).toBe("jira");
    expect(decorated.dependsOn).toEqual(["x"]);
    expect(decorated.systemPromptFragment).toBe("frag");
    expect(decorated.skills).toEqual([{ name: "s", description: "d", body: "b" }]);
    expect(built.postTurnGuards).toEqual([guard]);
    expect(built.sessionTools).toBe(factory);
  });

  test("a plugin without a post-processor, or without a build, gets none", () => {
    expect(formatterPlugin(pluginWith({}), () => "R").build!(ctx).postProcess).toBeUndefined();
    expect(formatterPlugin({ apiVersion: PLUGIN_API_VERSION, name: "n" }, () => "R").build!(ctx)).toEqual({ postProcess: undefined });
  });

  test("passes the runtime context through to the inner build", () => {
    let received: PluginRuntimeContext | undefined;
    const base: Plugin = { apiVersion: PLUGIN_API_VERSION, name: "n", build: (c) => ((received = c), {}) };
    formatterPlugin(base, () => "R").build!(ctx);
    expect(received).toBe(ctx);
  });
});
