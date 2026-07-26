/**
 * Identity bridges to Chat, for every source that can name a user by
 * email: given a Jira assignee or a Bitbucket PR participant, finds the
 * Chat user cached (by `sweepChatDirectory` or the Chat provider's own
 * `[Da: X]` resolution) under a matching email, or falls back to a
 * deterministic notice via `Notifier.notifyAdmin` — never an LLM-composed
 * message, this is a system notice about missing data, not a finding
 * about the user's own work. Bitbucket exposes no email on a PR
 * participant directly (unlike Jira's `assignee.emailAddress`) —
 * `resolveChatTargetForBitbucketUser` resolves the `account_id` to an
 * email via `atlassian-admin user get` first, then shares the same
 * email-matching path as the Jira bridge.
 *
 * `findChatUserByEmail` scans `inferred/users/*\/resolved-name.md`
 * directly on disk, same "deterministic, not model-decided" pattern as
 * the rest of this identity plumbing — not routed through wiki-read.ts's
 * `readWikiFile`, since that scopes `inferred/` reads to the *caller's
 * own* userId and this needs to search across every cached Chat user.
 *
 * Repeat-call deduplication (e.g. not re-notifying admin every single
 * cron tick for the same still-unmapped user) is NOT handled here —
 * the calling cron calls these fresh on every tick with no memory of
 * prior calls.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import type { Notifier } from "../router/provider.ts";
import type { runCli } from "../tools/cli-executor.ts";

type JiraUser = { accountId: string; email: string | null; displayName: string };
type BitbucketUser = { accountId: string; displayName: string };

export type IdentityBridgeResult =
  | { kind: "found"; userId: string; displayName: string }
  | { kind: "not-found" };

export async function findChatUserByEmail(vaultPath: string, email: string): Promise<{ userId: string; displayName: string } | null> {
  const glob = new Bun.Glob("inferred/users/*/resolved-name.md");
  const normalizedEmail = email.toLowerCase();

  for await (const relPath of glob.scan({ cwd: vaultPath })) {
    const text = await readFile(join(vaultPath, relPath), "utf-8");
    const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
    if (!match) continue;

    const frontmatter = parseYaml(match[1] as string) as { email?: unknown; display_name?: unknown };
    if (typeof frontmatter.email !== "string" || frontmatter.email.toLowerCase() !== normalizedEmail) {
      continue;
    }

    const encodedUserId = relPath.split("/")[2] as string; // inferred/users/<encoded>/resolved-name.md
    return {
      userId: decodeURIComponent(encodedUserId),
      displayName: typeof frontmatter.display_name === "string" ? frontmatter.display_name : decodeURIComponent(encodedUserId),
    };
  }
  return null;
}

export async function resolveChatTargetForJiraUser(
  jiraUser: JiraUser,
  deps: {
    vaultPath: string;
    notifier: Notifier;
  },
): Promise<IdentityBridgeResult> {
  if (jiraUser.email) {
    const found = await findChatUserByEmail(deps.vaultPath, jiraUser.email);
    if (found) {
      return { kind: "found", userId: found.userId, displayName: found.displayName };
    }

    await deps.notifier.notifyAdmin(
      `Nessuna corrispondenza Chat per l'utente Jira "${jiraUser.displayName}" (${jiraUser.email}) — verificare l'email in Chat o aggiungere la mappatura manualmente.`,
    );
    return { kind: "not-found" };
  }

  await deps.notifier.notifyAdmin(
    `L'utente Jira "${jiraUser.displayName}" (account ${jiraUser.accountId}) non ha nessuna email associata — nessuna email, impossibile cercare una corrispondenza automatica in Chat.`,
  );
  return { kind: "not-found" };
}

export async function resolveChatTargetForBitbucketUser(
  bitbucketUser: BitbucketUser,
  deps: {
    vaultPath: string;
    notifier: Notifier;
    runCliFn: typeof runCli;
  },
): Promise<IdentityBridgeResult> {
  const lookup = await deps.runCliFn("atlassian-admin", [
    "user",
    "get",
    "--account-id",
    bitbucketUser.accountId,
    "--select-all",
  ]);
  if (!lookup.ok) {
    await deps.notifier.notifyAdmin(
      `Impossibile risolvere l'utente Bitbucket "${bitbucketUser.displayName}" (account ${bitbucketUser.accountId}) — lookup su Atlassian fallito: ${lookup.error}`,
    );
    return { kind: "not-found" };
  }

  const data = lookup.data as { account?: { email?: unknown } };
  const email = typeof data.account?.email === "string" ? data.account.email : null;
  if (!email) {
    await deps.notifier.notifyAdmin(
      `L'utente Bitbucket "${bitbucketUser.displayName}" (account ${bitbucketUser.accountId}) non ha nessuna email associata nel profilo Atlassian — impossibile cercare una corrispondenza automatica in Chat.`,
    );
    return { kind: "not-found" };
  }

  const found = await findChatUserByEmail(deps.vaultPath, email);
  if (found) {
    return { kind: "found", userId: found.userId, displayName: found.displayName };
  }

  await deps.notifier.notifyAdmin(
    `Nessuna corrispondenza Chat per l'utente Bitbucket "${bitbucketUser.displayName}" (${email}) — verificare l'email in Chat o aggiungere la mappatura manualmente.`,
  );
  return { kind: "not-found" };
}
