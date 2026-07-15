import { describe, it, expect, beforeAll } from "bun:test";
import { loadCliConfig } from "./cli-config-loader.ts";
import { matchCommand, type CliConfig } from "./cli-tool.ts";
import type { CliResult } from "./cli-executor.ts";

/**
 * Integration-shaped safety net for the real, checked-in
 * `cli-configs/jira.json` reference config — replaces the old
 * `jira.test.ts`'s hand-written `isAllowed` unit tests. Loading the real
 * file (not a synthetic fixture) means a future edit to `jira.json` that
 * breaks one of these guarantees is caught here, not just by a generic
 * schema check.
 */

const CONFIG_DIR = new URL("../../cli-configs/", import.meta.url).pathname.replace(/\/$/, "");

let jiraConfig: CliConfig;

beforeAll(async () => {
  const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: "jira-cli 1.0.0" });
  const result = await loadCliConfig("jira", { configDir: CONFIG_DIR, runCliFn });
  if (!result.ok) {
    throw new Error(`cli-configs/jira.json failed to load: ${result.reason}`);
  }
  jiraConfig = result.config;
});

describe("cli-configs/jira.json", () => {
  it("allows read-only subcommands", () => {
    expect(matchCommand(["issue", "search", "--jql", "project=KAN"], jiraConfig)).toEqual({ kind: "allowed" });
    expect(matchCommand(["issue", "get", "KAN-42"], jiraConfig)).toEqual({ kind: "allowed" });
    expect(matchCommand(["issue", "transitions", "KAN-42"], jiraConfig)).toEqual({ kind: "allowed" });
    expect(matchCommand(["doctor"], jiraConfig)).toEqual({ kind: "allowed" });
    expect(matchCommand(["auth", "whoami"], jiraConfig)).toEqual({ kind: "allowed" });
  });

  it("rejects write subcommands that aren't configured at all", () => {
    expect(matchCommand(["issue", "create", "--project", "KAN"], jiraConfig)).toEqual({ kind: "not-allowed" });
    expect(matchCommand(["issue", "transition", "KAN-1", "--to", "Done"], jiraConfig)).toEqual({
      kind: "not-allowed",
    });
    expect(matchCommand(["issue", "comment", "add", "KAN-1"], jiraConfig)).toEqual({ kind: "not-allowed" });
  });

  // issue delete IS recognized (unlike the other writes above, which
  // aren't configured at all) but gated on confirm: true — Mercury could
  // run it once M2's confirmation mechanism exists, it just can't yet.
  // Distinct from "not-allowed": the model gets told why this specific
  // shape doesn't work, not just that it doesn't match anything known.
  it("requires confirmation for issue delete, which is not yet supported", () => {
    expect(matchCommand(["issue", "delete", "KAN-1", "--confirm"], jiraConfig)).toEqual({
      kind: "confirm-required",
      prefix: ["issue", "delete"],
    });
  });

  it("always allows --help, even on a write subcommand", () => {
    expect(matchCommand(["issue", "create", "--help"], jiraConfig)).toEqual({ kind: "allowed" });
    expect(matchCommand(["--help"], jiraConfig)).toEqual({ kind: "allowed" });
  });

  // Regression: jira's --select is a global flag, documented (top-level
  // --help: "Usage: jira [OPTIONS] <COMMAND>") to come BEFORE the
  // subcommand, not just after. Observed for real: the model called
  // ["--select", "issues.key", "issue", "search", "--jql", "..."] for an
  // ordinary read query, and a naive positional-prefix check rejected it
  // as "not permitted" since args[0] was "--select", not "issue".
  it("allows a read-only subcommand even when --select appears before it", () => {
    expect(
      matchCommand(
        ["--select", "issues.key,issues.fields.summary", "issue", "search", "--jql", "project=KAN"],
        jiraConfig,
      ),
    ).toEqual({ kind: "allowed" });
    expect(matchCommand(["--select", "id", "doctor"], jiraConfig)).toEqual({ kind: "allowed" });
  });

  it("still requires confirmation for issue delete when --select appears before it", () => {
    expect(matchCommand(["--select", "id", "issue", "delete", "KAN-1", "--confirm"], jiraConfig)).toEqual({
      kind: "confirm-required",
      prefix: ["issue", "delete"],
    });
  });

  it("has exactly one confirm-gated command today (issue delete)", () => {
    const confirmGated = jiraConfig.allowedPrefixes.filter((c) => c.confirm);
    expect(confirmGated).toEqual([{ prefix: ["issue", "delete"], confirm: true }]);
  });
});
