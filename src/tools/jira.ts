import { tool } from "ai";
import { z } from "zod";
import { runCli } from "./cli-executor.ts";

export const READ_ONLY_PREFIXES: string[][] = [
  ["issue", "search"],
  ["issue", "get"],
  ["issue", "transitions"],
  ["doctor"],
  ["auth", "whoami"],
];

export function isAllowed(args: string[]): boolean {
  if (args[args.length - 1] === "--help") {
    return true;
  }
  return READ_ONLY_PREFIXES.some((prefix) =>
    prefix.every((part, i) => args[i] === part),
  );
}

export function createJiraTool(runCliFn: typeof runCli) {
  const jiraCli = tool({
    description:
      "Run the jira CLI. Use --help on any subcommand if unsure of its flags.",
    inputSchema: z.object({ args: z.array(z.string()).min(1) }),
    execute: async ({ args }) => {
      if (!isAllowed(args)) {
        return {
          ok: false,
          error:
            "not permitted on this Mercury instance — read-only Jira access only",
        };
      }
      return runCliFn("jira", args);
    },
  });

  return { jiraCli };
}
