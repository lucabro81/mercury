/**
 * Jira-specific allowlist data for the experimental command-string
 * execution model: which `jira` subcommands are safe to run without
 * confirmation, plus the one bit of real `jira`-CLI-specific parsing
 * knowledge (`stripSelectFlag`) that data needs. Consumed by the generic
 * `runCommand` tool in `src/tools/cli-tool.ts` — this file no longer
 * builds a model-invocable tool itself; `jiraCliConfig` is just the
 * `CliConfig` a Mercury instance passes into `createCliTool` when `jira`
 * is one of its enabled CLIs (decided in `src/index.ts`, not here).
 *
 * Why a free-form allowlist instead of one schema per subcommand: the
 * model already knows how to use a CLI (it's the same skill it uses for
 * any shell command), including reading `--help` to discover flags it
 * doesn't already know. Hand-writing a zod schema per `jira` subcommand
 * would duplicate work the model does for free, and would silently drift
 * out of sync if `jira-cli`'s flags change. The one thing Mercury can't
 * delegate to the model is which subcommands are safe to run at all —
 * that's `isAllowed`/`READ_ONLY_PREFIXES` below.
 *
 * This module is specific to Jira — a Mercury instance configured for a
 * different ticket tracker (Linear, GitHub Issues, ...) would need its
 * own equivalent module and `CliConfig`.
 */
import { isPrefixAllowed, type CliConfig } from "./cli-tool.ts";

/**
 * Argument prefixes considered safe to run without confirmation on a
 * read-only Mercury instance. Each entry is matched against the start
 * of the parsed `args` array — e.g. `["issue", "search"]` matches
 * `["issue", "search", "--jql", "..."]` but not `["issue", "create", ...]`.
 *
 * Deliberately not derived from the `jira` CLI's own `--confirm` flag:
 * only `issue delete` has that flag today, while `issue create`/
 * `issue transition`/`issue comment add` (also writes) don't — relying
 * on it would silently treat an unmarked write command as safe. This
 * allowlist is default-deny instead: a new subcommand is unusable until
 * someone adds it here explicitly.
 */
export const READ_ONLY_PREFIXES: string[][] = [
  ["issue", "search"],
  ["issue", "get"],
  ["issue", "transitions"],
  ["doctor"],
  ["auth", "whoami"],
];

/**
 * Removes `--select <value>` from `args`. `--select` is `jira`'s one
 * global flag (per its own `--help`: "Usage: jira [OPTIONS] <COMMAND>")
 * and can legitimately appear before the subcommand, not just after —
 * confirmed for real when the model called
 * `["--select", "...", "issue", "search", ...]` for an ordinary read
 * query. Stripping it before matching prefixes is safe: `--select` only
 * projects which fields come back, it can never turn a read into a
 * write.
 */
function stripSelectFlag(args: string[]): string[] {
  const result: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--select") {
      i++; // also skip its value
      continue;
    }
    result.push(args[i] as string);
  }
  return result;
}

/** The `CliConfig` for `jira`, passed into `createCliTool` by `src/index.ts`. */
export const jiraCliConfig: CliConfig = {
  readOnlyPrefixes: READ_ONLY_PREFIXES,
  stripFlags: stripSelectFlag,
};

/**
 * Whether `args` is safe to execute on a read-only Mercury instance:
 * either it matches one of `READ_ONLY_PREFIXES` (ignoring a leading or
 * interspersed `--select`), or it's a `--help` invocation (always
 * allowed, since it's discovery rather than execution — even `jira
 * issue create --help` is harmless). Kept as a thin wrapper over the
 * generic `isPrefixAllowed` so existing callers/tests don't need to know
 * about `CliConfig`.
 */
export function isAllowed(args: string[]): boolean {
  return isPrefixAllowed(args, jiraCliConfig);
}
