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

  it("rejects write subcommands", () => {
    expect(matchCommand(["issue", "delete", "KAN-1", "--confirm"], jiraConfig)).toEqual({ kind: "not-allowed" });
    expect(matchCommand(["issue", "create", "--project", "KAN"], jiraConfig)).toEqual({ kind: "not-allowed" });
    expect(matchCommand(["issue", "transition", "KAN-1", "--to", "Done"], jiraConfig)).toEqual({
      kind: "not-allowed",
    });
    expect(matchCommand(["issue", "comment", "add", "KAN-1"], jiraConfig)).toEqual({ kind: "not-allowed" });
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

  it("still rejects a write subcommand when --select appears before it", () => {
    expect(matchCommand(["--select", "id", "issue", "delete", "KAN-1", "--confirm"], jiraConfig)).toEqual({
      kind: "not-allowed",
    });
  });

  it("has no confirm-gated commands today, matching the current allowlist exactly", () => {
    expect(jiraConfig.allowedPrefixes.every((c) => !c.confirm)).toBe(true);
  });
});
