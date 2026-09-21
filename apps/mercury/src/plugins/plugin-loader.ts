/**
 * The generic, fail-soft plugin loader. Turns a hand-listed set of plugin
 * modules (see `PluginModule`) into the four things the composition root wires
 * into a running Mercury: the tool configs `runCommand`'s allowlist is built
 * from, the system-prompt fragments describing those tools, the CLI
 * post-processors, and the post-turn guards. It knows nothing about any
 * specific plugin — the composition root names them, this loop processes them
 * identically.
 *
 * Two properties it guarantees, both required by the plan's fail-soft step:
 *  - a plugin contributes only when it is *both* enabled on this instance (its
 *    name is in MERCURY_CLIS) *and* its cli config passes the same schema/
 *    version barrier a file-based config passes (`loadCliConfig`, injected);
 *  - a plugin that fails — its config doesn't validate, or its `build()`
 *    throws — degrades as a single unit: none of its contributions land (not
 *    even an already-validated cli config), the failure is logged with detail,
 *    and every other plugin and the process itself carry on. This is the
 *    CLAUDE.md lesson made structural: one plugin's bad tick never takes down
 *    the rest.
 *
 * The contract types (`Plugin`, `CliPostProcessor`, `PostTurnGuard`, and the
 * `build()` context) now live in `@mercury/plugin-types`, the shared package
 * both the core and the plugins import, so neither mirrors the other. This
 * module keeps only the core-runtime pieces: how a hand-listed set of plugins
 * is loaded and what the load produces.
 */
import type { LanguageModel } from "ai";
import { PLUGIN_API_VERSION } from "@mercury/plugin-types";
import type { Plugin, CliPostProcessor, PostTurnGuard, StatusDescriber, Skill } from "@mercury/plugin-types";
import type { CliConfig } from "@mercury/plugin-cli";
import type { CliConfigFromObjectResult } from "@mercury/plugin-cli";

/** What the loader hands back to the composition root, already aggregated
 * across every plugin that loaded — the composition root merges these into the
 * file-based cli configs and passes them straight to the system-prompt builder,
 * the CLI tool, and the turn runner. */
export interface LoadedPlugins {
  cliConfigs: Record<string, CliConfig>;
  promptFragments: string[];
  skills: Skill[];
  postProcessors: Record<string, CliPostProcessor>;
  postTurnGuards: PostTurnGuard[];
  // Per-binary status describers, only for plugins that override the default
  // (`Plugin.describeStatus`). Empty when every plugin uses `defaultStatusLabel`
  // — the composition root falls back to that default for any binary absent
  // here, including the file-based CLIs that aren't plugins.
  statusDescribers: Record<string, StatusDescriber>;
}

/** Everything the loader needs from the composition root: which CLIs are
 * enabled on this instance, how to validate a plugin's raw config (the same
 * `loadCliConfigFromObject` barrier, injected so a test can stand it in), and
 * the runtime context every `build()` gets. */
export interface PluginLoadContext {
  enabledClis: string[];
  loadCliConfig: (raw: unknown) => Promise<CliConfigFromObjectResult>;
  model: LanguageModel;
  env: Record<string, string | undefined>;
  log: (msg: string) => void;
}

/**
 * Orders `plugins` so every plugin comes after each of its declared `dependsOn`
 * (a stable topological sort: among plugins with no ordering constraint between
 * them, listing order is preserved). Only edges to a plugin actually present in
 * the set are honored — an unknown dependency name creates no edge and is
 * caught later, at activation, as an absent dependency. Any plugin left over
 * after the sort is part of, or downstream of, a dependency **cycle**: it comes
 * back in `cyclic`, never in `ordered`, so a cycle degrades fail-soft (the
 * caller skips those plugins) instead of dropping the whole load.
 */
export function orderByDependencies(plugins: Plugin[]): { ordered: Plugin[]; cyclic: Plugin[] } {
  const present = new Set(plugins.map((p) => p.name));
  const remainingDeps = new Map<string, number>();
  for (const p of plugins) {
    // Distinct present dependencies only: the emit loop decrements once per
    // dependency, so counting a name listed twice would wedge the plugin at a
    // count that never reaches zero — misreported as a cycle (regression).
    remainingDeps.set(p.name, new Set((p.dependsOn ?? []).filter((d) => present.has(d))).size);
  }

  const ordered: Plugin[] = [];
  const emitted = new Set<string>();
  // Repeatedly emit every plugin whose remaining dependencies are all already
  // emitted, scanning in listing order so independent plugins keep it. Loop
  // until a full pass emits nothing — whatever is left then is cyclic.
  let progressed = true;
  while (progressed) {
    progressed = false;
    for (const p of plugins) {
      if (emitted.has(p.name)) continue;
      if ((remainingDeps.get(p.name) ?? 0) !== 0) continue;
      emitted.add(p.name);
      ordered.push(p);
      progressed = true;
      for (const other of plugins) {
        if (!emitted.has(other.name) && (other.dependsOn ?? []).includes(p.name)) {
          remainingDeps.set(other.name, (remainingDeps.get(other.name) ?? 0) - 1);
        }
      }
    }
  }

  const cyclic = plugins.filter((p) => !emitted.has(p.name));
  return { ordered, cyclic };
}

/**
 * Loads every plugin in `plugins`, returning their combined contributions.
 * Plugins load in dependency-first order (see `orderByDependencies`), not
 * listing order — though listing order is preserved among plugins with no
 * dependency between them. Never throws — a plugin that fails is logged and
 * skipped, its contributions staged and merged only once the whole plugin
 * succeeds so a later failure can't leave it half-wired. A plugin whose
 * declared `dependsOn` isn't fully activated (a dependency disabled, failed,
 * unknown, or itself skipped) is skipped fail-soft too, transitively.
 */
export async function loadPlugins(plugins: Plugin[], ctx: PluginLoadContext): Promise<LoadedPlugins> {
  const cliConfigs: Record<string, CliConfig> = {};
  const promptFragments: string[] = [];
  const skills: Skill[] = [];
  const postProcessors: Record<string, CliPostProcessor> = {};
  const postTurnGuards: PostTurnGuard[] = [];
  const statusDescribers: Record<string, StatusDescriber> = {};

  const { ordered, cyclic } = orderByDependencies(plugins);
  // A plugin caught in a cycle can't be ordered, so it can't load. Report it
  // only when it's enabled — a disabled plugin contributes nothing regardless,
  // same silence as any other disabled plugin.
  for (const plugin of cyclic) {
    if (ctx.enabledClis.includes(plugin.name)) {
      ctx.log(`plugin "${plugin.name}" not activated: part of or depends on a dependency cycle`);
    }
  }

  // Names that fully activated — a dependency must be in here for a dependent
  // to load. Populated in dependency-first order, so a dependent is always
  // processed after its dependencies have had their chance.
  const activated = new Set<string>();

  for (const plugin of ordered) {
    // Not enabled on this instance: contribute nothing, and don't even
    // validate the config — same as a CLI left out of MERCURY_CLIS.
    if (!ctx.enabledClis.includes(plugin.name)) {
      continue;
    }
    // Contract-version skew: core and plugin are versioned and installed
    // separately, so a plugin built against a different contract than this core
    // supports is possible. Refuse it fail-soft rather than run it against a
    // shape it may not match.
    if (plugin.apiVersion !== PLUGIN_API_VERSION) {
      ctx.log(
        `plugin "${plugin.name}" not activated: apiVersion ${plugin.apiVersion} ` +
          `incompatible with this core (supports ${PLUGIN_API_VERSION})`,
      );
      continue;
    }
    // Every declared dependency must have fully activated first. Because we
    // process in dependency-first order, a dependency that was going to load
    // already has; anything still missing is disabled, failed, unknown, or
    // itself skipped — so this dependent degrades fail-soft too. Checked before
    // touching this plugin's own config/build, so a doomed plugin does no work.
    const missingDeps = (plugin.dependsOn ?? []).filter((dep) => !activated.has(dep));
    if (missingDeps.length > 0) {
      ctx.log(
        `plugin "${plugin.name}" not activated: dependency ${missingDeps.map((d) => `"${d}"`).join(", ")} absent or failed`,
      );
      continue;
    }
    try {
      const loaded = await ctx.loadCliConfig(plugin.cliConfig);
      if (!loaded.ok) {
        ctx.log(`plugin "${plugin.name}" not activated: ${loaded.reason}`);
        continue;
      }

      // Stage into locals first: build() can still throw, and a plugin must
      // degrade as a unit — nothing of it lands unless all of it succeeds.
      const contributions = plugin.build
        ? plugin.build({ model: ctx.model, env: ctx.env, log: ctx.log })
        : {};

      cliConfigs[loaded.binary] = loaded.config;
      if (plugin.systemPromptFragment !== undefined) {
        promptFragments.push(plugin.systemPromptFragment);
      }
      if (plugin.skills !== undefined) {
        skills.push(...plugin.skills);
      }
      if (plugin.describeStatus !== undefined) {
        statusDescribers[loaded.binary] = plugin.describeStatus;
      }
      if (contributions.postProcessors) {
        Object.assign(postProcessors, contributions.postProcessors);
      }
      if (contributions.postTurnGuards) {
        postTurnGuards.push(...contributions.postTurnGuards);
      }
      // Fully wired — only now does it count as a satisfied dependency for
      // anything that declared `dependsOn` on it.
      activated.add(plugin.name);
    } catch (err) {
      ctx.log(`plugin "${plugin.name}" failed to load, skipped: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return { cliConfigs, promptFragments, skills, postProcessors, postTurnGuards, statusDescribers };
}
