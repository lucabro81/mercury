/**
 * The plugin contract: the shared types both the Mercury core and every plugin
 * package program against. It exists so neither side has to mirror the other's
 * shapes locally (as the Jira plugin did through Fase 2) and so the compiler
 * checks compatibility at a real seam rather than by hand. It's a monorepo
 * type package, not a published SDK — there is no runtime here beyond the one
 * version constant.
 *
 * The interface is deliberately the *sum of what Fase 2 actually had to
 * deliver*, not a guess at what a plugin might one day want. Its real
 * validation is the second plugin (Bitbucket): if extracting it forces this
 * file to grow, the interface was Jira-shaped and gets redrawn. Two slots are
 * reserved ahead of that — `apiVersion` and `surfaces` — not because Jira uses
 * them, but because adding either later would be a retrofit on every plugin
 * already written.
 */
import type { LanguageModel } from "ai";

/**
 * Contract version. The core and a plugin are versioned and installed
 * separately, so a plugin compiled against a different contract than the core
 * supports is possible by construction; the loader compares this against each
 * plugin's declared `apiVersion` and refuses a mismatch (fail-soft). A single
 * integer, bumped only on a breaking change to the shapes in this file.
 */
export const PLUGIN_API_VERSION = 1;

/**
 * Result of running a CLI command: on success `data` is the parsed JSON (or raw
 * text) stdout; on failure `error` is a human/model-readable string. Mirrors
 * `runCli`'s return — the core owns the runner, this owns the shape both sides
 * agree on.
 */
export type CliResult = { ok: true; data: unknown } | { ok: false; error: string };

/**
 * Deterministically transforms a `runCli` result for one command shape, looked
 * up by the `postProcess` name a CLI's allowlist declares. A plugin builds
 * these in its `build()`; the core registers them by name and applies them
 * without knowing what any does. Can augment `data` or turn a technically-ok
 * result into `{ ok: false }` when the data isn't shaped as it needs.
 */
export type CliPostProcessor = (parsed: { binary: string; args: string[] }, result: CliResult) => CliResult;

/**
 * Minimal shape of a finished generation step — enough to see what tool was
 * called, with what input, and what came back. A subset of the AI SDK's
 * `StepResult`; function parameter types only need to be structurally
 * compatible, not identical. A `toolCalls` entry with no matching
 * `toolResults` entry (linked by `toolCallId`) means the call failed before
 * executing, surfaced as a `tool-error` in `content`.
 */
export type StepInfo = {
  toolCalls: Array<{ toolCallId: string; toolName: string; input: unknown }>;
  toolResults: Array<{ toolCallId: string; toolName: string; output: unknown }>;
  content: Array<{ type: string; toolCallId?: string; error?: unknown }>;
};

/**
 * A post-turn guard: something run over the model's finished text before it
 * reaches the user. `shouldRun` gates both the transformation and its status
 * indicator; `run` returns the (possibly unchanged) text plus an `outcome`
 * that drives the status pair and an optional diagnostic `log`. `steps` is
 * offered for guards that need the turn's tool trace; a guard free to ignore
 * it. A guard that throws never blocks delivery — the core wraps each one.
 */
export type PostTurnGuard = {
  statusLabel: string;
  statusId: string;
  shouldRun: (text: string) => boolean;
  run: (text: string, steps: StepInfo[]) => Promise<{ text: string; outcome: "success" | "failed"; log?: string }>;
};

/**
 * What a plugin's `build()` receives — everything its runtime contributions may
 * need that isn't static data: the shared model (for a model-backed guard), the
 * process env (for its own configuration), and a logger for anything it skips.
 */
export type PluginRuntimeContext = {
  model: LanguageModel;
  env: Record<string, string | undefined>;
  log: (msg: string) => void;
};

/**
 * The env/model-dependent half of a plugin's contributions, produced by
 * `build()`. Both optional: a plugin may contribute neither (a pure read-only
 * CLI with no formatting or guard).
 */
export type PluginRuntimeContributions = {
  postProcessors?: Record<string, CliPostProcessor>;
  postTurnGuards?: PostTurnGuard[];
};

/**
 * A CLI command about to run, as the status describer sees it: the binary, the
 * argv after it, and whether the command mutates state (the core computes this
 * from the allowlist and passes it in, so a custom describer can vary read vs
 * write without re-deriving it).
 */
export type CliCommandInfo = { binary: string; args: string[]; mutating: boolean };

/** Turns a command about to run into the one-line status content shown while it
 * runs. A plugin may supply one (`Plugin.describeStatus`) to override the
 * default; the core only transports the result, the channel decides how to
 * render it. */
export type StatusDescriber = (cmd: CliCommandInfo) => string;

/**
 * The default status content for a CLI command, used for every command unless
 * its plugin overrides it. A plain "esecuzione <binary> <sottocomando>", where
 * the subcommand is the leading non-flag tokens capped at two — deliberately
 * not a read/write classification, which is what the core used to hardcode and
 * 3.3 removed. A plugin that wants finer wording supplies its own
 * `describeStatus`.
 */
export const defaultStatusLabel: StatusDescriber = ({ binary, args }) => {
  const sub: string[] = [];
  for (const a of args) {
    if (a.startsWith("-")) break;
    sub.push(a);
    if (sub.length === 2) break;
  }
  return sub.length > 0 ? `esecuzione ${binary} ${sub.join(" ")}` : `esecuzione ${binary}`;
};

/**
 * Reserved slot. A plugin may declare a persistent surface that lives *outside*
 * a turn — a Figma canvas, a configuration view — as data only: a `type` the
 * hosting UI recognizes, an `address` to reach it, and opaque `params`. Never
 * frontend code, never a component; a UI that doesn't know the `type` simply
 * doesn't show it. Distinct from per-turn output (status, lists, cards), which
 * already flows through the core's sink — a plugin exposes nothing for that.
 * Jira declares none; the shape is a placeholder until a real surface plugin
 * (Figma) nails it down.
 */
export type PluginSurface = {
  type: string;
  address: string;
  params?: Record<string, unknown>;
};

/**
 * The plugin module: the single value the core's loader consumes. A plugin
 * package exports one as a plain object — it must not import the app it plugs
 * into, so compatibility is checked where the core's plugin list is typed
 * against this.
 *
 * - `apiVersion`: the contract version this plugin was built against (see
 *   `PLUGIN_API_VERSION`). Mandatory; the loader refuses a mismatch.
 * - `name`: the MERCURY_CLIS entry and the binary this plugin owns.
 * - `cliConfig`: the raw, unvalidated allowlist data; the core validates it
 *   through the same schema/version barrier a file-based config passes.
 * - `systemPromptFragment`: the tool-surface description spliced into the
 *   system prompt when the plugin is active.
 * - `build`: the env/model-dependent contributions (post-processors, guards).
 * - `describeStatus`: optional override for the status content of this plugin's
 *   commands (see `StatusDescriber`); when unset the core uses
 *   `defaultStatusLabel`. The core transports the result and never classifies a
 *   command itself.
 * - `surfaces`: reserved (see `PluginSurface`); absent for a plugin with none.
 */
export type Plugin = {
  apiVersion: number;
  name: string;
  cliConfig: unknown;
  systemPromptFragment?: string;
  build?: (ctx: PluginRuntimeContext) => PluginRuntimeContributions;
  describeStatus?: StatusDescriber;
  surfaces?: PluginSurface[];
};
