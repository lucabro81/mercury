/**
 * The generic, cross-CLI model-invocable tool for the experimental
 * command-string execution model: the model writes an entire CLI
 * invocation as one free-text string (see `src/tools/command-parser.ts`
 * for how that string becomes a binary + argv), and this module validates
 * it — first that the binary is one this Mercury instance actually has a
 * config for, then that the argv shape matches that binary's own
 * read-only-prefix allowlist — before ever executing anything.
 *
 * `CliConfig` generalizes what `src/tools/jira.ts`'s `READ_ONLY_PREFIXES`/
 * `isAllowed` used to do for jira alone: `readOnlyPrefixes` is the same
 * default-deny prefix-matching idea, and `stripFlags` is an escape hatch
 * for real CLI-specific pre-processing (jira's global `--select` flag can
 * appear before the subcommand) that's deliberately NOT generalized itself
 * — it stays CLI-specific knowledge, owned by whichever module builds that
 * CLI's `CliConfig`.
 *
 * Used by: `src/index.ts` (wiring), which builds the `Record<string,
 * CliConfig>` from whichever CLIs are enabled on a given instance and
 * passes it into `createCliTool` alongside the real `runCli`.
 */
import { tool } from "ai";
import { z } from "zod";
import { parseCommand } from "./command-parser.ts";
import type { runCli } from "./cli-executor.ts";

export type CliConfig = {
  readOnlyPrefixes: string[][];
  /** Optional CLI-specific pre-processing before prefix-matching, e.g.
   * stripping a global flag that can appear before the subcommand. */
  stripFlags?: (args: string[]) => string[];
};

/**
 * Whether `args` is safe to execute under `config`: either it matches one
 * of `config.readOnlyPrefixes` (after `config.stripFlags`, if any), or
 * it's a `--help` invocation (always allowed, since it's discovery rather
 * than execution).
 */
export function isPrefixAllowed(args: string[], config: CliConfig): boolean {
  if (args[args.length - 1] === "--help") {
    return true;
  }
  const stripped = config.stripFlags ? config.stripFlags(args) : args;
  return config.readOnlyPrefixes.some((prefix) =>
    prefix.every((part, i) => stripped[i] === part),
  );
}

/** Renders a list of allowed prefixes as a comma-separated string for a
 * model-readable rejection message, e.g. `"issue search, issue get"`. */
export function formatPrefixes(prefixes: string[][]): string {
  return prefixes.map((p) => p.join(" ")).join(", ");
}

/**
 * Builds the `runCommand` tool: the model writes a whole CLI invocation as
 * one string, `execute` parses it (`parseCommand`), checks the binary
 * against `configs`, then the argv against that binary's own
 * `readOnlyPrefixes` (`isPrefixAllowed`) — in that order, so each failure
 * mode gets a distinct, self-correctable error message — before ever
 * calling `runCliFn`. `runCliFn` is injected (defaulting to the real
 * `runCli` in production) so tests can supply a fake without spawning a
 * real subprocess.
 */
export function createCliTool(runCliFn: typeof runCli, configs: Record<string, CliConfig>) {
  const runCommand = tool({
    description:
      "Run a CLI command. Write the whole invocation as one string, exactly as you would type it in a terminal, " +
      'e.g. `jira issue search --jql "project = KAN"`. Quote values that contain spaces.',
    inputSchema: z.object({ command: z.string().min(1) }),
    execute: async ({ command }) => {
      const parsed = parseCommand(command);
      if (!parsed.ok) {
        return { ok: false, error: `could not parse "${command}": ${parsed.error}` };
      }

      const config = configs[parsed.binary];
      if (!config) {
        const known = Object.keys(configs).join(", ") || "(none configured)";
        return {
          ok: false,
          error: `unknown or disabled CLI "${parsed.binary}" on this Mercury instance. Available: ${known}.`,
        };
      }

      if (!isPrefixAllowed(parsed.args, config)) {
        const validPrefixes = formatPrefixes(config.readOnlyPrefixes);
        return {
          ok: false,
          error: `not permitted on this Mercury instance — read-only ${parsed.binary} access only. Valid commands: ${validPrefixes}. If "${parsed.args.join(" ")}" doesn't match one of these, it's not a recognized command shape — try again with the right prefix, or run --help to check.`,
        };
      }

      return runCliFn(parsed.binary, parsed.args);
    },
  });

  return { runCommand };
}
