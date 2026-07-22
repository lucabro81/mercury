import { describe, it, expect, afterEach } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { resolveChatTargetForJiraUser, resolveChatTargetForBitbucketUser } from "./identity-bridge.ts";
import { writeResolvedNote } from "../wiki/wiki-note.ts";
import { initVault } from "../wiki/vault-init.ts";
import type { notifyAdmin } from "./admin-notify.ts";
import type { sendMessage } from "../router/channels/google-chat-client.ts";
import type { runCli, CliResult } from "../tools/cli-executor.ts";

const runCliFn: typeof runCli = async () => ({ ok: true, data: {} });
const sendMessageFn: typeof sendMessage = async () => ({ name: "spaces/ADMIN/messages/1" });

const tempDirs: string[] = [];
afterEach(async () => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop()!;
    await rm(dir, { recursive: true, force: true });
  }
});

async function makeTempVault(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "mercury-identity-bridge-test-"));
  tempDirs.push(dir);
  await initVault(dir);
  return dir;
}

describe("resolveChatTargetForJiraUser", () => {
  it("finds the Chat user cached under a matching email", async () => {
    const vaultPath = await makeTempVault();
    await writeResolvedNote(
      vaultPath,
      "users/42",
      { resolvedAt: "2026-07-19T12:00:00Z", email: "mario@example.com" },
      "Mario Rossi",
    );

    let notifyCalls = 0;
    const notifyAdminFn: typeof notifyAdmin = async () => {
      notifyCalls++;
    };

    const result = await resolveChatTargetForJiraUser(
      { accountId: "jira-1", email: "mario@example.com", displayName: "Mario Rossi" },
      { vaultPath, adminSpace: "spaces/ADMIN", notifyAdminFn, sendMessageFn, runCliFn },
    );

    expect(result).toEqual({ kind: "found", chatUserId: "users/42", displayName: "Mario Rossi" });
    expect(notifyCalls).toBe(0);
  });

  it("matches case-insensitively (email addresses aren't case-sensitive in practice)", async () => {
    const vaultPath = await makeTempVault();
    await writeResolvedNote(
      vaultPath,
      "users/42",
      { resolvedAt: "2026-07-19T12:00:00Z", email: "Mario@Example.com" },
      "Mario Rossi",
    );

    const notifyAdminFn: typeof notifyAdmin = async () => {};
    const result = await resolveChatTargetForJiraUser(
      { accountId: "jira-1", email: "mario@example.com", displayName: "Mario Rossi" },
      { vaultPath, adminSpace: "spaces/ADMIN", notifyAdminFn, sendMessageFn, runCliFn },
    );

    expect(result).toEqual({ kind: "found", chatUserId: "users/42", displayName: "Mario Rossi" });
  });

  it("notifies the admin space and returns not-found when no cached Chat user has this email", async () => {
    const vaultPath = await makeTempVault();
    await writeResolvedNote(
      vaultPath,
      "users/42",
      { resolvedAt: "2026-07-19T12:00:00Z", email: "someone-else@example.com" },
      "Someone Else",
    );

    let notifiedText: string | undefined;
    const notifyAdminFn: typeof notifyAdmin = async (text) => {
      notifiedText = text;
    };

    const result = await resolveChatTargetForJiraUser(
      { accountId: "jira-1", email: "mario@example.com", displayName: "Mario Rossi" },
      { vaultPath, adminSpace: "spaces/ADMIN", notifyAdminFn, sendMessageFn, runCliFn },
    );

    expect(result).toEqual({ kind: "not-found" });
    expect(notifiedText).toContain("Mario Rossi");
    expect(notifiedText).toContain("mario@example.com");
  });

  it("notifies the admin space with a distinct message when the Jira user has no email at all", async () => {
    const vaultPath = await makeTempVault();

    let notifiedText: string | undefined;
    const notifyAdminFn: typeof notifyAdmin = async (text) => {
      notifiedText = text;
    };

    const result = await resolveChatTargetForJiraUser(
      { accountId: "jira-1", email: null, displayName: "Mario Rossi" },
      { vaultPath, adminSpace: "spaces/ADMIN", notifyAdminFn, sendMessageFn, runCliFn },
    );

    expect(result).toEqual({ kind: "not-found" });
    expect(notifiedText).toContain("Mario Rossi");
    expect(notifiedText).toContain("nessuna email");
  });

  it("ignores non-resolved-name.md files under inferred/users when scanning", async () => {
    const vaultPath = await makeTempVault();
    // A user with an unrelated inferred note (not resolved-name.md) should
    // never be mistaken for a match, and shouldn't crash the scan.
    await writeResolvedNote(
      vaultPath,
      "users/1",
      { resolvedAt: "2026-07-19T12:00:00Z", email: "someone@example.com" },
      "Someone",
    );

    const notifyAdminFn: typeof notifyAdmin = async () => {};
    const result = await resolveChatTargetForJiraUser(
      { accountId: "jira-1", email: "not-cached@example.com", displayName: "Nobody" },
      { vaultPath, adminSpace: "spaces/ADMIN", notifyAdminFn, sendMessageFn, runCliFn },
    );

    expect(result).toEqual({ kind: "not-found" });
  });
});

describe("resolveChatTargetForBitbucketUser", () => {
  it("resolves the account_id to an email via atlassian-admin, then finds the cached Chat user under that email", async () => {
    const vaultPath = await makeTempVault();
    await writeResolvedNote(
      vaultPath,
      "users/42",
      { resolvedAt: "2026-07-19T12:00:00Z", email: "mario@example.com" },
      "Mario Rossi",
    );

    let receivedArgs: string[] | undefined;
    const lookupRunCliFn: typeof runCli = async (binary, args): Promise<CliResult> => {
      receivedArgs = args;
      expect(binary).toBe("atlassian-admin");
      return { ok: true, data: { account: { account_id: "bb-1", email: "mario@example.com" } } };
    };
    const notifyAdminFn: typeof notifyAdmin = async () => {};

    const result = await resolveChatTargetForBitbucketUser(
      { accountId: "bb-1", displayName: "Mario Rossi" },
      { vaultPath, adminSpace: "spaces/ADMIN", notifyAdminFn, sendMessageFn, runCliFn: lookupRunCliFn },
    );

    expect(receivedArgs).toEqual(["user", "get", "--account-id", "bb-1", "--select-all"]);
    expect(result).toEqual({ kind: "found", chatUserId: "users/42", displayName: "Mario Rossi" });
  });

  it("notifies the admin space and returns not-found when the atlassian-admin lookup itself fails", async () => {
    const vaultPath = await makeTempVault();
    const failingRunCliFn: typeof runCli = async (): Promise<CliResult> => ({
      ok: false,
      error: "atlassian-admin exited with code 1: account not found",
    });

    let notifiedText: string | undefined;
    const notifyAdminFn: typeof notifyAdmin = async (text) => {
      notifiedText = text;
    };

    const result = await resolveChatTargetForBitbucketUser(
      { accountId: "bb-1", displayName: "Mario Rossi" },
      { vaultPath, adminSpace: "spaces/ADMIN", notifyAdminFn, sendMessageFn, runCliFn: failingRunCliFn },
    );

    expect(result).toEqual({ kind: "not-found" });
    expect(notifiedText).toContain("Mario Rossi");
    expect(notifiedText).toContain("bb-1");
  });

  it("notifies the admin space with a distinct message when the resolved profile has no email", async () => {
    const vaultPath = await makeTempVault();
    const noEmailRunCliFn: typeof runCli = async (): Promise<CliResult> => ({
      ok: true,
      data: { account: { account_id: "bb-1" } },
    });

    let notifiedText: string | undefined;
    const notifyAdminFn: typeof notifyAdmin = async (text) => {
      notifiedText = text;
    };

    const result = await resolveChatTargetForBitbucketUser(
      { accountId: "bb-1", displayName: "Mario Rossi" },
      { vaultPath, adminSpace: "spaces/ADMIN", notifyAdminFn, sendMessageFn, runCliFn: noEmailRunCliFn },
    );

    expect(result).toEqual({ kind: "not-found" });
    expect(notifiedText).toContain("Mario Rossi");
    expect(notifiedText).toContain("nessuna email");
  });

  it("notifies the admin space when the email resolves but no cached Chat user matches it", async () => {
    const vaultPath = await makeTempVault();
    const resolvingRunCliFn: typeof runCli = async (): Promise<CliResult> => ({
      ok: true,
      data: { account: { account_id: "bb-1", email: "mario@example.com" } },
    });

    let notifiedText: string | undefined;
    const notifyAdminFn: typeof notifyAdmin = async (text) => {
      notifiedText = text;
    };

    const result = await resolveChatTargetForBitbucketUser(
      { accountId: "bb-1", displayName: "Mario Rossi" },
      { vaultPath, adminSpace: "spaces/ADMIN", notifyAdminFn, sendMessageFn, runCliFn: resolvingRunCliFn },
    );

    expect(result).toEqual({ kind: "not-found" });
    expect(notifiedText).toContain("Mario Rossi");
    expect(notifiedText).toContain("mario@example.com");
  });
});
