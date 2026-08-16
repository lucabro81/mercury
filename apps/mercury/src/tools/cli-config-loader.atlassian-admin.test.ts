import { describe, it, expect, beforeAll } from "bun:test";
import { loadCliConfig } from "./cli-config-loader.ts";
import { matchCommand, type CliConfig } from "./cli-tool.ts";
import type { CliResult } from "./cli-executor.ts";

/**
 * Integration-shaped safety net for the real, checked-in
 * `cli-configs/atlassian-admin.json` reference config — same pattern as
 * `cli-config-loader.bitbucket.test.ts`. The Bitbucket identity bridge
 * only needs to resolve an `account_id` to a profile/email, so the
 * allowlist is deliberately narrow: no mutating command exists on this
 * CLI at all.
 */

const CONFIG_DIR = new URL("../../cli-configs/", import.meta.url).pathname.replace(/\/$/, "");

let atlassianAdminConfig: CliConfig;

beforeAll(async () => {
  const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: "atlassian-admin-cli 1.0.0" });
  const result = await loadCliConfig("atlassian-admin", { configDir: CONFIG_DIR, runCliFn });
  if (!result.ok) {
    throw new Error(`cli-configs/atlassian-admin.json failed to load: ${result.reason}`);
  }
  atlassianAdminConfig = result.config;
});

describe("cli-configs/atlassian-admin.json", () => {
  it("allows the read-only user lookup and health check", () => {
    expect(matchCommand(["user", "get", "--account-id", "abc123"], atlassianAdminConfig)).toEqual({
      kind: "allowed",
      mutating: false,
    });
    expect(matchCommand(["doctor"], atlassianAdminConfig)).toEqual({ kind: "allowed", mutating: false });
  });

  it("has no allowed commands beyond the user lookup and health check", () => {
    expect(matchCommand(["init"], atlassianAdminConfig)).toEqual({ kind: "not-allowed" });
  });

  it("always allows --help", () => {
    expect(matchCommand(["user", "get", "--help"], atlassianAdminConfig)).toEqual({ kind: "allowed", mutating: false });
    expect(matchCommand(["--help"], atlassianAdminConfig)).toEqual({ kind: "allowed", mutating: false });
  });

  it("allows the lookup even when --select appears before the subcommand", () => {
    expect(
      matchCommand(["--select", "account.email", "user", "get", "--account-id", "abc123"], atlassianAdminConfig),
    ).toEqual({ kind: "allowed", mutating: false });
  });

  it("has no confirm-gated or mutating commands", () => {
    expect(atlassianAdminConfig.allowedPrefixes.filter((c) => c.confirm)).toEqual([]);
    expect(atlassianAdminConfig.allowedPrefixes.filter((c) => c.mutating)).toEqual([]);
  });
});
