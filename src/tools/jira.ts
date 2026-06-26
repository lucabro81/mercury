/**
 * Mercury's Jira integration: a single model-invocable tool that runs
 * the `jira` CLI with model-chosen arguments, gated by a read-only
 * allowlist.
 *
 * Why a free-form tool instead of one tool per subcommand: the model
 * already knows how to use a CLI (it's the same skill it uses for any
 * shell command), including reading `--help` to discover flags it
 * doesn't already know. Hand-writing a zod schema per `jira` subcommand
 * would duplicate work the model does for free, and would silently drift
 * out of sync if `jira-cli`'s flags change. The one thing Mercury can't
 * delegate to the model is which subcommands are safe to run at all —
 * that's `isAllowed`/`READ_ONLY_PREFIXES` below.
 *
 * This module is specific to Jira — it is not a generic "any CLI" tool,
 * and a Mercury instance configured for a different ticket tracker
 * (Linear, GitHub Issues, ...) would need its own equivalent module.
 * Whether this module's tool actually gets wired into a running
 * instance depends on whether `jira` is one of that instance's
 * configured CLIs — that decision is made in `src/index.ts`, not here.
 *
 * Used by: `src/index.ts` (wiring), which passes `createJiraTool`'s
 * result into `runTurn`'s `tools` map (see `src/session/agent-turn.ts`).
 */
import { tool } from "ai";
import { z } from "zod";
import { runCli } from "./cli-executor.ts";

/**
 * Argument prefixes considered safe to run without confirmation on a
 * read-only Mercury instance. Each entry is matched against the start
 * of the model-provided `args` array — e.g. `["issue", "search"]`
 * matches `["issue", "search", "--jql", "..."]` but not `["issue",
 * "create", ...]`.
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

/**
 * Whether `args` is safe to execute on a read-only Mercury instance:
 * either it matches one of `READ_ONLY_PREFIXES` (ignoring a leading or
 * interspersed `--select`), or it's a `--help` invocation (always
 * allowed, since it's discovery rather than execution — even `jira
 * issue create --help` is harmless).
 */
export function isAllowed(args: string[]): boolean {
  if (args[args.length - 1] === "--help") {
    return true;
  }
  const stripped = stripSelectFlag(args);
  return READ_ONLY_PREFIXES.some((prefix) =>
    prefix.every((part, i) => stripped[i] === part),
  );
}

/**
 * Builds the `jiraCli` tool. `runCliFn` is injected (defaulting to the
 * real `runCli` in production) so tests can supply a fake without
 * spawning a real subprocess.
 *
 * The tool's `execute` checks `isAllowed` before doing anything else —
 * a disallowed command never reaches `runCliFn` at all, and the model
 * gets back a plain error result it can read, not an exception.
 */
export function createJiraTool(runCliFn: typeof runCli) {
  const jiraCli = tool({
    description:
      "Run the jira CLI. Use --help on any subcommand if unsure of its flags.",
    inputSchema: z.object({ args: z.array(z.string()).min(1) }),
    execute: async ({ args }) => {
      if (!isAllowed(args)) {
        const validPrefixes = READ_ONLY_PREFIXES.map((p) => p.join(" ")).join(", ");
        return {
          ok: false,
          error: `not permitted on this Mercury instance — read-only Jira access only. Valid commands: ${validPrefixes}. If "${args.join(" ")}" doesn't match one of these, it's not a recognized command shape — try again with the right prefix, or run --help to check.`,
        };
      }
      return runCliFn("jira", args);
    },
  });

  return { jiraCli };
}
