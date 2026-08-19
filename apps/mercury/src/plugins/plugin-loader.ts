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
import type { Plugin, CliPostProcessor, PostTurnGuard } from "@mercury/plugin-types";
import type { CliConfig } from "../tools/cli-tool.ts";
import type { CliConfigFromObjectResult } from "../tools/cli-config-loader.ts";

/** What the loader hands back to the composition root, already aggregated
 * across every plugin that loaded — the composition root merges these into the
 * file-based cli configs and passes them straight to the system-prompt builder,
 * the CLI tool, and the turn runner. */
export interface LoadedPlugins {
  cliConfigs: Record<string, CliConfig>;
  promptFragments: string[];
  postProcessors: Record<string, CliPostProcessor>;
  postTurnGuards: PostTurnGuard[];
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
 * Loads every plugin in `plugins`, in listing order, returning their combined
 * contributions. Never throws — a plugin that fails is logged and skipped, its
 * contributions staged and merged only once the whole plugin succeeds so a
 * later failure can't leave it half-wired.
 */
export async function loadPlugins(plugins: Plugin[], ctx: PluginLoadContext): Promise<LoadedPlugins> {
  const cliConfigs: Record<string, CliConfig> = {};
  const promptFragments: string[] = [];
  const postProcessors: Record<string, CliPostProcessor> = {};
  const postTurnGuards: PostTurnGuard[] = [];

  for (const plugin of plugins) {
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
      if (contributions.postProcessors) {
        Object.assign(postProcessors, contributions.postProcessors);
      }
      if (contributions.postTurnGuards) {
        postTurnGuards.push(...contributions.postTurnGuards);
      }
    } catch (err) {
      ctx.log(`plugin "${plugin.name}" failed to load, skipped: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return { cliConfigs, promptFragments, postProcessors, postTurnGuards };
}
