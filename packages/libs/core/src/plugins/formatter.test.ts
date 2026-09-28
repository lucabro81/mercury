/**
 * Tests for the generic formatter decorator. `formatterPlugin(plugin, handler)`
 * must be entirely data-plugin-agnostic: it never inspects the display `type`,
 * it only runs the supplied handler over whatever `display.items` its wrapped
 * plugin's post-processors produce, and it must pass every other plugin
 * contribution through untouched. These tests use a synthetic plugin so they
 * pin the mechanism, not any real plugin's shape.
 */
import { describe, expect, test } from "bun:test";
import { PLUGIN_API_VERSION, type Plugin, type PluginRuntimeContributions, type PluginRuntimeContext, type CliResult } from "@mercury/plugin-types";
import { formatterPlugin } from "./formatter.ts";

const ctx: PluginRuntimeContext = { model: {} as never, env: {}, log: () => {} };

/** A minimal plugin whose `build` returns exactly the contributions given. */
function pluginWith(contributions: PluginRuntimeContributions, extra: Partial<Plugin> = {}): Plugin {
  return { apiVersion: PLUGIN_API_VERSION, name: "data", build: () => contributions, ...extra };
}

const parsed = { binary: "data", args: [] };

describe("formatterPlugin", () => {
  test("renders an ok result's display.items through the handler", async () => {
    let seen: unknown[] | undefined;
    const inner = { postProcessors: { "issue-list": (): CliResult => ({ ok: true, data: { raw: 1 }, display: { type: "issue-list", items: [{ key: "A" }, { key: "B" }] } }) } };
    const decorated = formatterPlugin(pluginWith(inner), (items) => {
      seen = items;
      return "RENDERED";
    });

    const result = (await decorated.build!(ctx)).postProcessors!["issue-list"]!(parsed, { ok: true, data: {} });

    // Handler saw the original structured items, and the display now carries the
    // single rendered block in its place.
    expect(seen).toEqual([{ key: "A" }, { key: "B" }]);
    expect(result).toEqual({ ok: true, data: { raw: 1 }, display: { type: "issue-list", items: ["RENDERED"] } });
  });

  test("leaves an ok result with no display untouched, handler not called", async () => {
    let called = false;
    const inner = { postProcessors: { p: (): CliResult => ({ ok: true, data: { raw: 1 } }) } };
    const decorated = formatterPlugin(pluginWith(inner), () => {
      called = true;
      return "X";
    });

    const result = (await decorated.build!(ctx)).postProcessors!.p!(parsed, { ok: true, data: {} });

    expect(result).toEqual({ ok: true, data: { raw: 1 } });
    expect(called).toBe(false);
  });

  test("leaves an error result untouched, handler not called", async () => {
    let called = false;
    const inner = { postProcessors: { p: (): CliResult => ({ ok: false, error: "boom" }) } };
    const decorated = formatterPlugin(pluginWith(inner), () => {
      called = true;
      return "X";
    });

    const result = (await decorated.build!(ctx)).postProcessors!.p!(parsed, { ok: true, data: {} });

    expect(result).toEqual({ ok: false, error: "boom" });
    expect(called).toBe(false);
  });

  test("wraps every post-processor the inner plugin declares", async () => {
    const mk = (): CliResult => ({ ok: true, data: {}, display: { type: "t", items: [1] } });
    const inner = { postProcessors: { a: mk, b: mk } };
    const decorated = formatterPlugin(pluginWith(inner), () => "R");

    const built = await decorated.build!(ctx);
    expect(built.postProcessors!.a!(parsed, { ok: true, data: {} })).toEqual({ ok: true, data: {}, display: { type: "t", items: ["R"] } });
    expect(built.postProcessors!.b!(parsed, { ok: true, data: {} })).toEqual({ ok: true, data: {}, display: { type: "t", items: ["R"] } });
  });

  test("passes through non-post-processor contributions and top-level fields", async () => {
    const guard = { statusLabel: "g", statusId: "g", shouldRun: () => false, run: async (t: string) => ({ text: t, outcome: "success" as const }) };
    const inner = { postProcessors: {}, postTurnGuards: [guard] };
    const base = pluginWith(inner, { name: "jira", dependsOn: ["x"], systemPromptFragment: "frag", skills: [{ name: "s", description: "d", body: "b" }] });
    const decorated = formatterPlugin(base, () => "R");

    expect(decorated.name).toBe("jira");
    expect(decorated.dependsOn).toEqual(["x"]);
    expect(decorated.systemPromptFragment).toBe("frag");
    expect(decorated.skills).toEqual([{ name: "s", description: "d", body: "b" }]);
    expect((await decorated.build!(ctx)).postTurnGuards).toEqual([guard]);
  });

  // A plugin's `sessionTools` factory passes through untouched — the formatter
  // only wraps post-processors; the composition hands the wrapped set to the
  // factory (see the loader's SessionToolBundle).
  test("passes a sessionTools factory through untouched", async () => {
    const factory = () => ({ myTool: {} as never });
    const decorated = formatterPlugin(pluginWith({ postProcessors: {}, sessionTools: factory }), () => "R");
    expect((await decorated.build!(ctx)).sessionTools).toBe(factory);
  });

  test("a plugin with no build decorates to an empty-post-processor build without throwing", async () => {
    const noBuild: Plugin = { apiVersion: PLUGIN_API_VERSION, name: "n" };
    const decorated = formatterPlugin(noBuild, () => "R");

    expect(decorated.build).toBeDefined();
    expect(await decorated.build!(ctx)).toEqual({ postProcessors: {} });
  });

  test("passes the runtime context through to the inner build", async () => {
    let received: PluginRuntimeContext | undefined;
    const base: Plugin = { apiVersion: PLUGIN_API_VERSION, name: "n", build: (c) => { received = c; return {}; } };
    const decorated = formatterPlugin(base, () => "R");

    await decorated.build!(ctx);
    expect(received).toBe(ctx);
  });
});
