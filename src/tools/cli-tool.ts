/**
 * The generic, cross-CLI model-invocable tool for the experimental
 * command-string execution model: the model writes an entire CLI
 * invocation as one free-text string (see `src/tools/command-parser.ts`
 * for how that string becomes a binary + argv), and this module validates
 * it — first that the binary is one this Mercury instance actually has a
 * config for, then that the argv shape matches that binary's own
 * allowed-prefix allowlist — before ever executing anything.
 *
 * `CliConfig` is built from a maintainer-authored external config file
 * (see `src/tools/cli-config-loader.ts`), not hand-written TypeScript —
 * `allowedPrefixes` is the default-deny prefix-matching data (each entry
 * also declares whether it needs a confirmation step that doesn't exist
 * yet, see `matchCommand` below), and `globalFlags` is declarative data
 * for CLI-specific pre-processing (e.g. jira's global `--select` flag,
 * which can appear before the subcommand) consumed generically by
 * `stripGlobalFlags` — no more hand-written per-CLI stripping function.
 *
 * Used by: `src/index.ts` (wiring), which builds the `Record<string,
 * CliConfig>` (via `cli-config-loader.ts`) from whichever CLIs are
 * enabled on a given instance and passes it into `createCliTool`
 * alongside the real `runCli`.
 */
import { tool } from "ai";
import { z } from "zod";
import { parseCommand } from "./command-parser.ts";
import type { runCli } from "./cli-executor.ts";
import type { ConfirmationStore } from "./confirmation-store.ts";

export type AllowedCommand = { prefix: string[]; confirm: boolean; mutating: boolean };
export type GlobalFlag = { flag: string; takesValue: boolean };

export type CliConfig = {
  allowedPrefixes: AllowedCommand[];
  /** Optional declarative global flags (can appear anywhere in argv, not
   * just after the prefix) to strip before prefix-matching. */
  globalFlags?: GlobalFlag[];
};

/**
 * Removes every occurrence of any flag listed in `globalFlags` from
 * `args` (and its value too, if `takesValue`), wherever it appears —
 * generic replacement for what used to be a hand-written per-CLI
 * function (jira's old `stripSelectFlag`). Used only to build a
 * throwaway copy for prefix-matching in `matchCommand`; the original
 * `args` (flags included) is always what actually gets executed.
 */
export function stripGlobalFlags(args: string[], globalFlags: GlobalFlag[]): string[] {
  const result: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const match = globalFlags.find((gf) => gf.flag === args[i]);
    if (match) {
      if (match.takesValue) i++; // also skip its value
      continue;
    }
    result.push(args[i] as string);
  }
  return result;
}

export type CommandMatch =
  | { kind: "allowed"; mutating: boolean }
  | { kind: "confirm-required"; prefix: string[]; mutating: boolean }
  | { kind: "not-allowed" };

/**
 * Classifies `args` under `config`: `--help` is always `allowed`
 * (discovery, not execution); otherwise `args` (after `config.globalFlags`
 * stripping, if any) is matched positionally against `config.allowedPrefixes`
 * — no match is `not-allowed`, a match with `confirm: false` is `allowed`,
 * a match with `confirm: true` is `confirm-required` (the shape is
 * recognized, but there's no confirmation mechanism to gate it on yet).
 * `mutating` is carried through independently of `confirm` — a command can
 * change external state (Jira, etc.) without requiring confirmation (e.g.
 * create), so the two flags are never derived from one another.
 */
export function matchCommand(args: string[], config: CliConfig): CommandMatch {
  if (args[args.length - 1] === "--help") {
    return { kind: "allowed", mutating: false };
  }
  const stripped = config.globalFlags ? stripGlobalFlags(args, config.globalFlags) : args;
  const match = config.allowedPrefixes.find((c) => c.prefix.every((part, i) => stripped[i] === part));
  if (!match) {
    return { kind: "not-allowed" };
  }
  return match.confirm
    ? { kind: "confirm-required", prefix: match.prefix, mutating: match.mutating }
    : { kind: "allowed", mutating: match.mutating };
}

/** Renders a list of prefixes as a comma-separated string for a
 * model-readable rejection message, e.g. `"issue search, issue get"`. */
export function formatPrefixes(prefixes: string[][]): string {
  return prefixes.map((p) => p.join(" ")).join(", ");
}

/**
 * Builds the `runCommand` tool: the model writes a whole CLI invocation as
 * one string, `execute` parses it (`parseCommand`), checks the binary
 * against `configs`, then classifies the argv via `matchCommand` — each
 * failure mode (unparseable / unknown binary / confirm-required /
 * not-allowed) gets a distinct, self-correctable error message — before
 * ever calling `runCliFn`. `runCliFn` is injected (defaulting to the real
 * `runCli` in production) so tests can supply a fake without spawning a
 * real subprocess.
 *
 * `opts.sessionKey`/`opts.store` scope the confirm-required branch: a
 * confirm-gated command is staged in `store` under `sessionKey` instead of
 * running, and the model is handed a token to relay verbatim to the user
 * (see `confirm-flow.ts` for the other half — actually running it once
 * that token comes back). Staging is inherently per-session, so callers
 * must build a fresh tool per turn, scoped to that turn's own session —
 * not a tool meant to be built once and reused across sessions.
 */
export function createCliTool(
  runCliFn: typeof runCli,
  configs: Record<string, CliConfig>,
  opts: { sessionKey: string; store: ConfirmationStore },
) {
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

      const match = matchCommand(parsed.args, config);
      if (match.kind === "not-allowed") {
        const validPrefixes = formatPrefixes(
          config.allowedPrefixes.filter((c) => !c.confirm).map((c) => c.prefix),
        );
        return {
          ok: false,
          error: `not permitted on this Mercury instance. Valid commands: ${validPrefixes}. If "${parsed.args.join(" ")}" doesn't match one of these, it's not a recognized command shape — try again with the right prefix, or run --help to check.`,
        };
      }
      if (match.kind === "confirm-required") {
        const token = opts.store.stage(opts.sessionKey, { kind: "cli", binary: parsed.binary, args: parsed.args });
        return {
          ok: false,
          pendingConfirmation: true,
          token,
          error: `"${match.prefix.join(" ")}" is irreversible and requires explicit confirmation. Relay this exact token to the user and ask them to reply \`conferma ${token}\` to proceed — never invent a different token, never claim this already succeeded.`,
        };
      }

      return runCliFn(parsed.binary, parsed.args);
    },
  });

  return { runCommand };
}
