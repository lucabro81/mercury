import { describe, it, expect, beforeAll } from "bun:test";
import { loadCliConfig } from "./cli-config-loader.ts";
import { matchCommand, type CliConfig } from "./cli-tool.ts";
import type { CliResult } from "./cli-executor.ts";

/**
 * Integration-shaped safety net for the real, checked-in
 * `cli-configs/bitbucket.json` reference config — same pattern as
 * `cli-config-loader.jira.test.ts`. The stale-PR check only needs
 * read-only PR queries (client-side filtering on `participants[].approved`),
 * so the allowlist stays narrower than what bitbucket-cli exposes overall
 * (no pr create/approve/unapprove/decline/merge/comment — not requested).
 */

const CONFIG_DIR = new URL("../../cli-configs/", import.meta.url).pathname.replace(/\/$/, "");

let bitbucketConfig: CliConfig;

beforeAll(async () => {
  const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: "bitbucket-cli 1.0.0" });
  const result = await loadCliConfig("bitbucket", { configDir: CONFIG_DIR, runCliFn });
  if (!result.ok) {
    throw new Error(`cli-configs/bitbucket.json failed to load: ${result.reason}`);
  }
  bitbucketConfig = result.config;
});

describe("cli-configs/bitbucket.json", () => {
  it("allows read-only subcommands", () => {
    expect(matchCommand(["pr", "list", "workspace/repo"], bitbucketConfig)).toEqual({
      kind: "allowed",
      mutating: false,
    });
    expect(matchCommand(["pr", "list", "workspace/repo", "--state", "OPEN"], bitbucketConfig)).toEqual({
      kind: "allowed",
      mutating: false,
    });
    expect(matchCommand(["pr", "get", "workspace/repo", "42"], bitbucketConfig)).toEqual({
      kind: "allowed",
      mutating: false,
    });
    expect(matchCommand(["doctor"], bitbucketConfig)).toEqual({ kind: "allowed", mutating: false });
    expect(matchCommand(["auth", "whoami"], bitbucketConfig)).toEqual({ kind: "allowed", mutating: false });
  });

  // This config only reads PRs (list + get) to find stale ones — nothing
  // mutating is in scope, unlike jira.json's write commands.
  it("has no allowed commands beyond read-only PR queries and health checks", () => {
    expect(matchCommand(["pr", "approve", "workspace/repo", "42"], bitbucketConfig)).toEqual({ kind: "not-allowed" });
    expect(matchCommand(["pr", "create", "workspace/repo"], bitbucketConfig)).toEqual({ kind: "not-allowed" });
    expect(matchCommand(["pr", "merge", "workspace/repo", "42"], bitbucketConfig)).toEqual({ kind: "not-allowed" });
    expect(matchCommand(["repo", "get", "workspace/repo"], bitbucketConfig)).toEqual({ kind: "not-allowed" });
  });

  it("always allows --help", () => {
    expect(matchCommand(["pr", "list", "--help"], bitbucketConfig)).toEqual({ kind: "allowed", mutating: false });
    expect(matchCommand(["--help"], bitbucketConfig)).toEqual({ kind: "allowed", mutating: false });
  });

  // Same global-flag shape as jira.json — --select can appear before the
  // subcommand per bitbucket --help's own usage line.
  it("allows a read-only subcommand even when --select appears before it", () => {
    expect(matchCommand(["--select", "values.title,values.state", "pr", "list", "workspace/repo"], bitbucketConfig)).toEqual({
      kind: "allowed",
      mutating: false,
    });
  });

  it("has no confirm-gated commands — everything allowlisted is read-only", () => {
    const confirmGated = bitbucketConfig.allowedPrefixes.filter((c) => c.confirm);
    expect(confirmGated).toEqual([]);
  });

  it("has no mutating commands", () => {
    const mutating = bitbucketConfig.allowedPrefixes.filter((c) => c.mutating);
    expect(mutating).toEqual([]);
  });
});
