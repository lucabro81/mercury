import { describe, it, expect } from "bun:test";
import { PLUGIN_API_VERSION, type Plugin } from "@mercury/plugin-types";
import { loadPlugins, type PluginLoadContext } from "./plugin-loader.ts";

/**
 * The generic, fail-soft plugin loader — the mechanism the composition root
 * uses to turn a hand-listed set of plugin modules into the per-plugin tool
 * bundles, prompt fragments, status describers, and post-turn guards. It knows
 * nothing about any specific plugin — or about CLIs — these tests drive it with
 * synthetic ones. The Jira plugin's own `build()` behaviour is tested against
 * `@mercury/plugin-jira` in jira-plugin.jira.test.ts.
 *
 * The invariants that matter: a plugin only contributes when it is enabled (in
 * MERCURY_CLIS) and declares a compatible `apiVersion`; a plugin that fails — a
 * throwing `build()` — degrades as a whole unit (never half-wired) without
 * taking down the other plugins or the process; and activation is reported in
 * `activated` (there is no central config map to infer it from anymore).
 */
/** A synthetic plugin, defaulting to the compatible apiVersion. */
function plug(p: Partial<Plugin> & Pick<Plugin, "name">): Plugin {
  return { apiVersion: PLUGIN_API_VERSION, ...p };
}

function baseCtx(overrides: Partial<PluginLoadContext> = {}): PluginLoadContext {
  return {
    enabledClis: [],
    model: {} as never,
    env: {},
    log: () => {},
    ...overrides,
  };
}

describe("loadPlugins", () => {
  it("activates an enabled plugin and collects its fragment", async () => {
    const plugin = plug({ name: "jira", systemPromptFragment: "FRAG" });
    const loaded = await loadPlugins([plugin], baseCtx({ enabledClis: ["jira"] }));
    expect(loaded.activated).toEqual(["jira"]);
    expect(loaded.promptFragments).toEqual(["FRAG"]);
    expect(loaded.sessionToolBundles).toEqual([]);
    expect(loaded.postTurnGuards).toEqual([]);
  });

  it("bundles a plugin's sessionTools factory with its post-processors, and collects its guards", async () => {
    const pp = { issueList: (() => {}) as never };
    const factory = () => ({ jiraCommand: {} as never });
    const guard = { statusLabel: "l", statusId: "g", shouldRun: () => true, run: async () => ({ text: "", outcome: "success" as const }) };
    const plugin = plug({ name: "jira", build: () => ({ postProcessors: pp, sessionTools: factory, postTurnGuards: [guard] }) });
    const loaded = await loadPlugins([plugin], baseCtx({ enabledClis: ["jira"] }));
    expect(loaded.sessionToolBundles).toEqual([{ build: factory, postProcessors: pp }]);
    expect(loaded.postTurnGuards).toEqual([guard]);
  });

  it("merges toolStatusDescribers across plugins, keyed by tool name", async () => {
    const jiraDescribe = () => "esecuzione jira";
    const bbDescribe = () => "esecuzione bitbucket";
    const p1 = plug({ name: "jira", build: () => ({ toolStatusDescribers: { jiraCommand: jiraDescribe } }) });
    const p2 = plug({ name: "bitbucket", build: () => ({ toolStatusDescribers: { bitbucketCommand: bbDescribe } }) });
    const loaded = await loadPlugins([p1, p2], baseCtx({ enabledClis: ["jira", "bitbucket"] }));
    expect(loaded.toolStatusDescribers).toEqual({ jiraCommand: jiraDescribe, bitbucketCommand: bbDescribe });
  });

  it("passes the runtime context (model, env, log) through to build()", async () => {
    let seen: unknown;
    const model = { id: "m" } as never;
    const plugin = plug({ name: "jira", build: (ctx) => { seen = ctx; return {}; } });
    await loadPlugins([plugin], baseCtx({ enabledClis: ["jira"], model, env: { JIRA_SITE_URL: "u" } }));
    expect((seen as { model: unknown }).model).toBe(model);
    expect((seen as { env: unknown }).env).toEqual({ JIRA_SITE_URL: "u" });
    expect(typeof (seen as { log: unknown }).log).toBe("function");
  });

  it("skips a plugin not listed in enabledClis — never runs its build, contributes nothing", async () => {
    const plugin = plug({
      name: "jira",
      systemPromptFragment: "FRAG",
      build: () => { throw new Error("build should not run for a disabled plugin"); },
    });
    const loaded = await loadPlugins([plugin], baseCtx({ enabledClis: [] }));
    expect(loaded.activated).toEqual([]);
    expect(loaded.promptFragments).toEqual([]);
  });

  it("skips a plugin whose apiVersion is incompatible with this core — logs why, does not build it", async () => {
    const logs: string[] = [];
    let built = false;
    const plugin = plug({
      name: "jira",
      apiVersion: PLUGIN_API_VERSION + 1,
      systemPromptFragment: "FRAG",
      build: () => { built = true; return {}; },
    });
    const loaded = await loadPlugins([plugin], baseCtx({ enabledClis: ["jira"], log: (m) => logs.push(m) }));
    expect(built).toBe(false);
    expect(loaded.activated).toEqual([]);
    expect(loaded.promptFragments).toEqual([]);
    expect(logs.some((l) => l.includes("jira") && l.includes("apiVersion") && l.includes("incompatible"))).toBe(true);
  });

  it("degrades a plugin as a unit: a throwing build() contributes nothing and doesn't stop the others", async () => {
    const logs: string[] = [];
    const bad = plug({ name: "bad", systemPromptFragment: "B", build: () => { throw new Error("kaboom"); } });
    const good = plug({ name: "good", systemPromptFragment: "G" });
    const loaded = await loadPlugins([bad, good], baseCtx({ enabledClis: ["bad", "good"], log: (m) => logs.push(m) }));
    expect(loaded.activated).toEqual(["good"]);
    expect(loaded.promptFragments).toEqual(["G"]);
    expect(logs.some((l) => l.includes("bad") && l.includes("failed to load") && l.includes("kaboom"))).toBe(true);
  });

  it("aggregates multiple plugins in listing order — bundles per plugin, concatenates fragments and guards", async () => {
    const fA = () => ({ a: {} as never });
    const fB = () => ({ b: {} as never });
    const gA = { statusLabel: "a", statusId: "a", shouldRun: () => true, run: async () => ({ text: "", outcome: "success" as const }) };
    const gB = { statusLabel: "b", statusId: "b", shouldRun: () => true, run: async () => ({ text: "", outcome: "success" as const }) };
    const p1 = plug({ name: "p1", systemPromptFragment: "F1", build: () => ({ sessionTools: fA, postTurnGuards: [gA] }) });
    const p2 = plug({ name: "p2", systemPromptFragment: "F2", build: () => ({ sessionTools: fB, postTurnGuards: [gB] }) });
    const loaded = await loadPlugins([p1, p2], baseCtx({ enabledClis: ["p1", "p2"] }));
    expect(loaded.activated).toEqual(["p1", "p2"]);
    expect(loaded.promptFragments).toEqual(["F1", "F2"]);
    expect(loaded.sessionToolBundles).toEqual([
      { build: fA, postProcessors: {} },
      { build: fB, postProcessors: {} },
    ]);
    expect(loaded.postTurnGuards).toEqual([gA, gB]);
  });

  it("concatenates the skills of every loaded plugin, in listing order", async () => {
    const s1 = { name: "a", description: "da", body: "ba" };
    const s2 = { name: "b", description: "db", body: "bb" };
    const p1 = plug({ name: "p1", skills: [s1] });
    const p2 = plug({ name: "p2", skills: [s2] });
    const plain = plug({ name: "plain" });
    const loaded = await loadPlugins([p1, plain, p2], baseCtx({ enabledClis: ["p1", "plain", "p2"] }));
    expect(loaded.skills).toEqual([s1, s2]);
  });
});

describe("loadPlugins dependsOn", () => {
  function recordingPlugin(name: string, order: string[], dependsOn?: string[]): Plugin {
    return plug({
      name,
      dependsOn,
      systemPromptFragment: name.toUpperCase(),
      build: () => { order.push(name); return {}; },
    });
  }

  it("loads a dependency before its dependent, even when the dependent is listed first", async () => {
    const order: string[] = [];
    const dependent = recordingPlugin("dependent", order, ["dep"]);
    const dep = recordingPlugin("dep", order);
    const loaded = await loadPlugins([dependent, dep], baseCtx({ enabledClis: ["dependent", "dep"] }));
    expect(order).toEqual(["dep", "dependent"]);
    expect(loaded.activated).toEqual(["dep", "dependent"]);
  });

  it("keeps listing order among plugins with no dependency between them", async () => {
    const order: string[] = [];
    const a = recordingPlugin("a", order);
    const b = recordingPlugin("b", order);
    const loaded = await loadPlugins([a, b], baseCtx({ enabledClis: ["a", "b"] }));
    expect(order).toEqual(["a", "b"]);
    expect(loaded.activated).toEqual(["a", "b"]);
  });

  it("skips a dependent whose dependency is not enabled — logs why, leaves the rest", async () => {
    const logs: string[] = [];
    const order: string[] = [];
    const dependent = recordingPlugin("dependent", order, ["dep"]);
    const dep = recordingPlugin("dep", order);
    const other = recordingPlugin("other", order);
    const loaded = await loadPlugins(
      [dependent, dep, other],
      baseCtx({ enabledClis: ["dependent", "other"], log: (m) => logs.push(m) }), // dep NOT enabled
    );
    expect(loaded.activated).toEqual(["other"]);
    expect(order).not.toContain("dependent"); // never built
    expect(logs.some((l) => l.includes("dependent") && l.includes("dep"))).toBe(true);
  });

  it("skips a dependent whose dependency failed to build, propagating transitively", async () => {
    const logs: string[] = [];
    const order: string[] = [];
    const a = recordingPlugin("a", order); // ok
    const b = plug({ name: "b", dependsOn: ["a"], build: () => { throw new Error("kaboom"); } });
    const c = recordingPlugin("c", order, ["b"]); // depends on the one that throws
    const loaded = await loadPlugins([a, b, c], baseCtx({ enabledClis: ["a", "b", "c"], log: (m) => logs.push(m) }));
    expect(loaded.activated).toEqual(["a"]); // only a survives
    expect(order).not.toContain("c");
    expect(logs.some((l) => l.includes("b") && l.includes("kaboom"))).toBe(true);
    expect(logs.some((l) => l.includes("c") && l.includes("b"))).toBe(true);
  });

  it("skips a dependent that names an unknown dependency", async () => {
    const logs: string[] = [];
    const order: string[] = [];
    const dependent = recordingPlugin("dependent", order, ["ghost"]);
    const loaded = await loadPlugins([dependent], baseCtx({ enabledClis: ["dependent"], log: (m) => logs.push(m) }));
    expect(loaded.activated).toEqual([]);
    expect(order).not.toContain("dependent");
    expect(logs.some((l) => l.includes("dependent") && l.includes("ghost"))).toBe(true);
  });

  it("breaks a dependency cycle fail-soft, still loading unrelated plugins", async () => {
    const logs: string[] = [];
    const order: string[] = [];
    const a = recordingPlugin("a", order, ["b"]);
    const b = recordingPlugin("b", order, ["a"]); // a <-> b cycle
    const c = recordingPlugin("c", order);
    const loaded = await loadPlugins([a, b, c], baseCtx({ enabledClis: ["a", "b", "c"], log: (m) => logs.push(m) }));
    expect(loaded.activated).toEqual(["c"]);
    expect(order).toEqual(["c"]);
    expect(logs.some((l) => l.includes("a") && l.toLowerCase().includes("cycle"))).toBe(true);
    expect(logs.some((l) => l.includes("b") && l.toLowerCase().includes("cycle"))).toBe(true);
  });

  it("loads a chain of dependencies in order (a <- b <- c)", async () => {
    const order: string[] = [];
    const a = recordingPlugin("a", order);
    const b = recordingPlugin("b", order, ["a"]);
    const c = recordingPlugin("c", order, ["b"]);
    // listed out of dependency order on purpose
    const loaded = await loadPlugins([c, b, a], baseCtx({ enabledClis: ["a", "b", "c"] }));
    expect(order).toEqual(["a", "b", "c"]);
    expect(loaded.activated).toEqual(["a", "b", "c"]);
  });

  it("loads a diamond (d depends on b and c, both on a) in a valid order", async () => {
    const order: string[] = [];
    const a = recordingPlugin("a", order);
    const b = recordingPlugin("b", order, ["a"]);
    const c = recordingPlugin("c", order, ["a"]);
    const d = recordingPlugin("d", order, ["b", "c"]);
    const loaded = await loadPlugins([d, b, c, a], baseCtx({ enabledClis: ["a", "b", "c", "d"] }));
    // a before b and c; b and c before d. b and c keep listing order (b, c).
    expect(order).toEqual(["a", "b", "c", "d"]);
    expect(loaded.activated).toEqual(["a", "b", "c", "d"]);
  });

  it("treats a self-dependency as unsatisfiable and skips it fail-soft, loading the rest", async () => {
    const logs: string[] = [];
    const order: string[] = [];
    const selfish = recordingPlugin("selfish", order, ["selfish"]);
    const other = recordingPlugin("other", order);
    const loaded = await loadPlugins([selfish, other], baseCtx({ enabledClis: ["selfish", "other"], log: (m) => logs.push(m) }));
    expect(loaded.activated).toEqual(["other"]);
    expect(order).toEqual(["other"]);
    expect(logs.some((l) => l.includes("selfish"))).toBe(true);
  });

  // Regression: a duplicated name in `dependsOn` (["a","a"]) once inflated the
  // dependency count past what the emit loop could decrement, wedging a plugin
  // whose dependency had actually loaded into the "cycle" bucket and dropping it
  // with a misleading reason. A present, loaded dependency must satisfy the
  // dependent no matter how many times it's listed.
  it("does not miscount a dependency named more than once in dependsOn", async () => {
    const order: string[] = [];
    const a = recordingPlugin("a", order);
    const dependent = recordingPlugin("dependent", order, ["a", "a"]);
    const loaded = await loadPlugins([dependent, a], baseCtx({ enabledClis: ["a", "dependent"] }));
    expect(order).toEqual(["a", "dependent"]);
    expect(loaded.activated).toEqual(["a", "dependent"]);
  });
});
