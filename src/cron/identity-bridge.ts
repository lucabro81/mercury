/**
 * M4's Jira<->Chat identity bridge: given a Jira assignee, finds the Chat
 * user cached (by `sweepChatDirectory` or `resolveSenderName`) under a
 * matching email, or falls back to a deterministic notice in the admin
 * space (D-35) — never an LLM-composed message, this is a system notice
 * about missing data, not a finding about the user's own work.
 *
 * Scans `inferred/users/*\/resolved-name.md` directly on disk, same
 * "deterministic, not model-decided" pattern as user-resolution.ts's
 * cache read — not routed through wiki-read.ts's `readWikiFile`, since
 * that scopes `inferred/` reads to the *caller's own* userId and this
 * needs to search across every cached Chat user.
 *
 * Repeat-call deduplication (e.g. not re-notifying admin every single
 * cron tick for the same still-unmapped user) is NOT handled here — left
 * to whichever cron eventually calls this, once that exists.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import type { notifyAdmin } from "./admin-notify.ts";
import type { sendMessage } from "../router/channels/google-chat-client.ts";
import type { runCli } from "../tools/cli-executor.ts";

type JiraUser = { accountId: string; email: string | null; displayName: string };

export type IdentityBridgeResult =
  | { kind: "found"; chatUserId: string; displayName: string }
  | { kind: "not-found" };

async function findChatUserByEmail(vaultPath: string, email: string): Promise<{ chatUserId: string; displayName: string } | null> {
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
      chatUserId: decodeURIComponent(encodedUserId),
      displayName: typeof frontmatter.display_name === "string" ? frontmatter.display_name : decodeURIComponent(encodedUserId),
    };
  }
  return null;
}

export async function resolveChatTargetForJiraUser(
  jiraUser: JiraUser,
  deps: {
    vaultPath: string;
    adminSpace: string;
    notifyAdminFn: typeof notifyAdmin;
    sendMessageFn: typeof sendMessage;
    runCliFn: typeof runCli;
  },
): Promise<IdentityBridgeResult> {
  if (jiraUser.email) {
    const found = await findChatUserByEmail(deps.vaultPath, jiraUser.email);
    if (found) {
      return { kind: "found", chatUserId: found.chatUserId, displayName: found.displayName };
    }

    await deps.notifyAdminFn(
      `Nessuna corrispondenza Chat per l'utente Jira "${jiraUser.displayName}" (${jiraUser.email}) — verificare l'email in Chat o aggiungere la mappatura manualmente.`,
      { adminSpace: deps.adminSpace, sendMessageFn: deps.sendMessageFn, runCliFn: deps.runCliFn },
    );
    return { kind: "not-found" };
  }

  await deps.notifyAdminFn(
    `L'utente Jira "${jiraUser.displayName}" (account ${jiraUser.accountId}) non ha nessuna email associata — nessuna email, impossibile cercare una corrispondenza automatica in Chat.`,
    { adminSpace: deps.adminSpace, sendMessageFn: deps.sendMessageFn, runCliFn: deps.runCliFn },
  );
  return { kind: "not-found" };
}
