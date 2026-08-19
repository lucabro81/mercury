import { describe, it, expect } from "bun:test";
import { loadPlugins, type PluginModule, type PluginLoadContext } from "./plugin-loader.ts";

/**
 * The generic, fail-soft plugin loader — the mechanism the composition root
 * uses to turn a hand-listed set of plugin modules into the core's tool
 * configs, prompt fragments, post-processors, and post-turn guards. It knows
 * nothing about any specific plugin; these tests drive it with synthetic ones.
 * The Jira plugin's own `build()` behaviour (env → formatter/guard) is tested
 * against `@mercury/plugin-jira` in jira-plugin.jira.test.ts.
 *
 * The two invariants that matter: a plugin only contributes when it is both
 * enabled (in MERCURY_CLIS) and its cli config validates; and a plugin that
 * fails — bad config, or a throwing `build()` — degrades as a whole unit
 * (never half-wired) without taking down the other plugins or the process.
 */
const CONFIG = { allowedPrefixes: [], globalFlags: [] } as never; // opaque CliConfig sentinel

function baseCtx(overrides: Partial<PluginLoadContext> = {}): PluginLoadContext {
  return {
    enabledClis: [],
    loadCliConfig: async () => ({ ok: true, binary: "x", config: CONFIG }),
    model: {} as never,
    env: {},
    log: () => {},
    ...overrides,
  };
}

describe("loadPlugins", () => {
  it("registers an enabled plugin's cli config under its validated binary and collects its fragment", async () => {
    const plugin: PluginModule = { name: "jira", cliConfig: {}, systemPromptFragment: "FRAG" };
    const loaded = await loadPlugins(
      [plugin],
      baseCtx({ enabledClis: ["jira"], loadCliConfig: async () => ({ ok: true, binary: "jira", config: CONFIG }) }),
    );
    expect(loaded.cliConfigs).toEqual({ jira: CONFIG });
    expect(loaded.promptFragments).toEqual(["FRAG"]);
    expect(loaded.postProcessors).toEqual({});
    expect(loaded.postTurnGuards).toEqual([]);
  });

  it("collects the post-processors and post-turn guards a plugin's build() returns", async () => {
    const pp = { issueList: (() => {}) as never };
    const guard = { statusLabel: "l", statusId: "g", shouldRun: () => true, run: async () => ({ text: "", outcome: "success" as const }) };
    const plugin: PluginModule = { name: "jira", cliConfig: {}, build: () => ({ postProcessors: pp, postTurnGuards: [guard] }) };
    const loaded = await loadPlugins(
      [plugin],
      baseCtx({ enabledClis: ["jira"], loadCliConfig: async () => ({ ok: true, binary: "jira", config: CONFIG }) }),
    );
    expect(loaded.postProcessors).toEqual(pp);
    expect(loaded.postTurnGuards).toEqual([guard]);
  });

  it("passes the runtime context (model, env, log) through to build()", async () => {
    let seen: unknown;
    const model = { id: "m" } as never;
    const plugin: PluginModule = { name: "jira", cliConfig: {}, build: (ctx) => { seen = ctx; return {}; } };
    await loadPlugins(
      [plugin],
      baseCtx({
        enabledClis: ["jira"],
        model,
        env: { JIRA_SITE_URL: "u" },
        loadCliConfig: async () => ({ ok: true, binary: "jira", config: CONFIG }),
      }),
    );
    expect((seen as { model: unknown }).model).toBe(model);
    expect((seen as { env: unknown }).env).toEqual({ JIRA_SITE_URL: "u" });
    expect(typeof (seen as { log: unknown }).log).toBe("function");
  });

  it("skips a plugin not listed in enabledClis — never touches its config or build, contributes nothing", async () => {
    let configLoaded = false;
    const plugin: PluginModule = {
      name: "jira",
      cliConfig: {},
      systemPromptFragment: "FRAG",
      build: () => { throw new Error("build should not run for a disabled plugin"); },
    };
    const loaded = await loadPlugins(
      [plugin],
      baseCtx({ enabledClis: [], loadCliConfig: async () => { configLoaded = true; return { ok: true, binary: "jira", config: CONFIG }; } }),
    );
    expect(configLoaded).toBe(false);
    expect(loaded.cliConfigs).toEqual({});
    expect(loaded.promptFragments).toEqual([]);
  });

  it("skips a plugin whose cli config fails validation — logs why, does not call build, contributes nothing", async () => {
    const logs: string[] = [];
    let built = false;
    const plugin: PluginModule = {
      name: "jira",
      cliConfig: {},
      systemPromptFragment: "FRAG",
      build: () => { built = true; return {}; },
    };
    const loaded = await loadPlugins(
      [plugin],
      baseCtx({ enabledClis: ["jira"], loadCliConfig: async () => ({ ok: false, reason: "bad schema" }), log: (m) => logs.push(m) }),
    );
    expect(built).toBe(false);
    expect(loaded.cliConfigs).toEqual({});
    expect(loaded.promptFragments).toEqual([]);
    expect(logs.some((l) => l.includes("jira") && l.includes("not activated") && l.includes("bad schema"))).toBe(true);
  });

  it("isolates a plugin whose loadCliConfig throws — skips it, logs, still loads the others", async () => {
    const logs: string[] = [];
    const bad: PluginModule = { name: "bad", cliConfig: { name: "bad" } };
    const good: PluginModule = { name: "good", cliConfig: { name: "good" }, systemPromptFragment: "G" };
    const loaded = await loadPlugins(
      [bad, good],
      baseCtx({
        enabledClis: ["bad", "good"],
        loadCliConfig: async (raw) => {
          if ((raw as { name?: string }).name === "bad") throw new Error("boom");
          return { ok: true, binary: (raw as { name: string }).name, config: CONFIG };
        },
        log: (m) => logs.push(m),
      }),
    );
    expect(loaded.cliConfigs).toEqual({ good: CONFIG });
    expect(loaded.promptFragments).toEqual(["G"]);
    expect(logs.some((l) => l.includes("bad") && l.includes("failed to load") && l.includes("boom"))).toBe(true);
  });

  it("degrades a plugin as a unit: a throwing build() drops even its already-validated cli config", async () => {
    const logs: string[] = [];
    const bad: PluginModule = {
      name: "bad",
      cliConfig: { name: "bad" },
      systemPromptFragment: "B",
      build: () => { throw new Error("kaboom"); },
    };
    const good: PluginModule = { name: "good", cliConfig: { name: "good" }, systemPromptFragment: "G" };
    const loaded = await loadPlugins(
      [bad, good],
      baseCtx({
        enabledClis: ["bad", "good"],
        loadCliConfig: async (raw) => ({ ok: true, binary: (raw as { name: string }).name, config: CONFIG }),
        log: (m) => logs.push(m),
      }),
    );
    // bad validated its config, but its build threw — so NONE of bad's
    // contributions land, not even the cli config that had already validated.
    expect(loaded.cliConfigs).toEqual({ good: CONFIG });
    expect(loaded.promptFragments).toEqual(["G"]);
    expect(logs.some((l) => l.includes("bad") && l.includes("failed to load") && l.includes("kaboom"))).toBe(true);
  });

  it("aggregates multiple plugins in listing order — merges configs/post-processors, concatenates fragments and guards", async () => {
    const ppA = { a: (() => {}) as never };
    const ppB = { b: (() => {}) as never };
    const gA = { statusLabel: "a", statusId: "a", shouldRun: () => true, run: async () => ({ text: "", outcome: "success" as const }) };
    const gB = { statusLabel: "b", statusId: "b", shouldRun: () => true, run: async () => ({ text: "", outcome: "success" as const }) };
    const p1: PluginModule = { name: "p1", cliConfig: { name: "p1" }, systemPromptFragment: "F1", build: () => ({ postProcessors: ppA, postTurnGuards: [gA] }) };
    const p2: PluginModule = { name: "p2", cliConfig: { name: "p2" }, systemPromptFragment: "F2", build: () => ({ postProcessors: ppB, postTurnGuards: [gB] }) };
    const loaded = await loadPlugins(
      [p1, p2],
      baseCtx({
        enabledClis: ["p1", "p2"],
        loadCliConfig: async (raw) => ({ ok: true, binary: (raw as { name: string }).name, config: CONFIG }),
      }),
    );
    expect(loaded.cliConfigs).toEqual({ p1: CONFIG, p2: CONFIG });
    expect(loaded.promptFragments).toEqual(["F1", "F2"]);
    expect(loaded.postProcessors).toEqual({ a: ppA.a, b: ppB.b });
    expect(loaded.postTurnGuards).toEqual([gA, gB]);
  });
});
