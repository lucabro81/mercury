import { describe, it, expect, beforeAll } from "bun:test";
import { loadCliConfigFromObject } from "@mercury/cli-engine";
import { matchCommand, type CliConfig } from "@mercury/cli-engine";
import type { CliResult } from "@mercury/cli-engine";
import { atlassianAdminCliConfig } from "@mercury/plugin-atlassian-admin";

/**
 * Integration-shaped safety net for the atlassian-admin plugin's real,
 * checked-in allowlist (`@mercury/plugin-atlassian-admin`'s
 * `atlassian-admin.json`, travelling with the plugin) — same pattern as
 * `cli-config-loader.bitbucket.test.ts`. The Bitbucket identity bridge only
 * needs to resolve an `account_id` to a profile/email, so the allowlist is
 * deliberately narrow: no mutating command exists on this CLI at all.
 */

let atlassianAdminConfig: CliConfig;

beforeAll(async () => {
  const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: "atlassian-admin-cli 1.0.0" });
  const result = await loadCliConfigFromObject(atlassianAdminCliConfig, { runCliFn });
  if (!result.ok) {
    throw new Error(`@mercury/plugin-atlassian-admin config failed to load: ${result.reason}`);
  }
  atlassianAdminConfig = result.config;
});

describe("@mercury/plugin-atlassian-admin allowlist", () => {
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
