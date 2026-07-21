/**
 * Stale-ticket check: no in-memory scanner (unlike idle-session-cron.ts) —
 * Jira itself is the source of truth for "is this ticket stale", so every
 * tick queries it fresh instead of tracking local state. Ties together
 * everything built this session: the config doc, the suppression gate,
 * the Jira identity cache, the identity bridge, message composition, DM
 * delivery, and the episodic event log — each already independently
 * tested, injected here rather than imported directly so this
 * orchestration's own tests can verify calls/ordering without depending
 * on the real subsystems (same shape as idle-session-cron.ts's deps).
 *
 * One ticket's failure is logged and doesn't stop the rest — same
 * "one bad tick can't take down the rest of Mercury" convention as
 * every other cron loop here.
 */
import type { LanguageModel } from "ai";
import type { runCli } from "../tools/cli-executor.ts";
import type { readWikiFile } from "../wiki/wiki-read.ts";
import type { writeCuratedNote, writeJiraUserResolvedNote } from "../wiki/wiki-note.ts";
import type { EpisodicSummary } from "../memory/episodic-store.ts";
import type { sendMessage, getOrCreateDmSpace } from "../router/channels/google-chat-client.ts";
import { parseNotificationThresholds, DEFAULT_NOTIFICATION_THRESHOLDS_BODY, DEFAULT_STALE_TICKET_JQL, NOTIFICATION_CONFIG_PATH } from "./notification-config.ts";
import { isNotificationSuppressed } from "./notification-suppression.ts";
import { resolveChatTargetForJiraUser, type IdentityBridgeResult } from "./identity-bridge.ts";
import { composeStaleTicketMessage, type StaleTicketFinding } from "./notification-composer.ts";
import type { notifyAdmin } from "./admin-notify.ts";

const JIRA_SELECT =
  "issues.key,issues.fields.summary,issues.fields.assignee.accountId,issues.fields.assignee.emailAddress,issues.fields.assignee.displayName";

type JiraAssignee = { accountId: string; emailAddress: string | null; displayName: string };
type JiraIssue = { key: string; fields: { summary: string; assignee: JiraAssignee | null } };

export type StaleTicketSweepDeps = {
  vaultPath: string;
  adminSpace: string;
  model: LanguageModel;
  runCliFn: typeof runCli;
  readWikiFileFn: typeof readWikiFile;
  writeCuratedNoteFn: typeof writeCuratedNote;
  writeJiraUserResolvedNoteFn: typeof writeJiraUserResolvedNote;
  isNotificationSuppressedFn: typeof isNotificationSuppressed;
  resolveChatTargetForJiraUserFn: typeof resolveChatTargetForJiraUser;
  historyFn: (userId: string, queryText: string) => Promise<EpisodicSummary[]>;
  composeStaleTicketMessageFn: (
    finding: StaleTicketFinding,
    history: EpisodicSummary[],
    deps: { model: LanguageModel },
  ) => Promise<string>;
  getOrCreateDmSpaceFn: typeof getOrCreateDmSpace;
  sendMessageFn: typeof sendMessage;
  notifyAdminFn: typeof notifyAdmin;
  recordEventFn: (entry: EpisodicSummary) => Promise<void>;
  now?: () => Date;
  log?: (msg: string) => void;
};

async function loadThresholds(deps: StaleTicketSweepDeps) {
  try {
    const text = await deps.readWikiFileFn(deps.vaultPath, "cron", `curated/${NOTIFICATION_CONFIG_PATH}`);
    return parseNotificationThresholds(text);
  } catch {
    await deps.writeCuratedNoteFn(deps.vaultPath, NOTIFICATION_CONFIG_PATH, {}, DEFAULT_NOTIFICATION_THRESHOLDS_BODY);
    return parseNotificationThresholds(DEFAULT_NOTIFICATION_THRESHOLDS_BODY);
  }
}

async function processOneTicket(
  issue: JiraIssue,
  staleDays: number,
  nowDate: Date,
  deps: StaleTicketSweepDeps,
): Promise<void> {
  const suppressed = await deps.isNotificationSuppressedFn(deps.vaultPath, "stale-ticket", issue.key);
  if (suppressed) {
    return;
  }

  const assignee = issue.fields.assignee;
  if (!assignee) {
    await deps.notifyAdminFn(
      `Ticket ${issue.key} ("${issue.fields.summary}") è fermo da ${staleDays} giorni ma non ha un assegnatario.`,
      { adminSpace: deps.adminSpace, sendMessageFn: deps.sendMessageFn, runCliFn: deps.runCliFn },
    );
    return;
  }

  const resolvedAt = nowDate.toISOString();
  await deps.writeJiraUserResolvedNoteFn(
    deps.vaultPath,
    assignee.accountId,
    { resolvedAt, email: assignee.emailAddress ?? null },
    assignee.displayName,
  );

  const bridgeResult: IdentityBridgeResult = await deps.resolveChatTargetForJiraUserFn(
    { accountId: assignee.accountId, email: assignee.emailAddress ?? null, displayName: assignee.displayName },
    {
      vaultPath: deps.vaultPath,
      adminSpace: deps.adminSpace,
      notifyAdminFn: deps.notifyAdminFn,
      sendMessageFn: deps.sendMessageFn,
      runCliFn: deps.runCliFn,
    },
  );
  if (bridgeResult.kind === "not-found") {
    return; // resolveChatTargetForJiraUser already notified the admin space itself
  }

  const history = await deps.historyFn(bridgeResult.chatUserId, `notifiche per ${issue.key}`);
  const text = await deps.composeStaleTicketMessageFn(
    { key: issue.key, summary: issue.fields.summary, staleDays },
    history,
    { model: deps.model },
  );

  const space = await deps.getOrCreateDmSpaceFn(bridgeResult.chatUserId, deps.runCliFn);
  await deps.sendMessageFn(space.name, text, deps.runCliFn);

  await deps.recordEventFn({
    userId: bridgeResult.chatUserId,
    sessionKey: space.name,
    summary: `Mercury ha notificato ${issue.key} (fermo da ${staleDays} giorni) a ${bridgeResult.displayName}.`,
    timestamp: resolvedAt,
  });
}

export async function runStaleTicketSweep(now: number, deps: StaleTicketSweepDeps): Promise<void> {
  const log = deps.log ?? ((msg: string) => console.error(msg));
  const nowDate = deps.now?.() ?? new Date(now);

  const thresholds = await loadThresholds(deps);
  const jql = thresholds.stale_ticket_jql ?? DEFAULT_STALE_TICKET_JQL;

  const result = await deps.runCliFn("jira", [
    "issue",
    "search",
    "--jql",
    `${jql} order by updated asc`,
    "--stale-days",
    String(thresholds.stale_ticket_days),
    "--select",
    JIRA_SELECT,
  ]);
  if (!result.ok) {
    log(`stale-ticket sweep: jira query failed: ${result.error}`);
    return;
  }

  const data = result.data as { issues?: JiraIssue[] };
  for (const issue of data.issues ?? []) {
    try {
      await processOneTicket(issue, thresholds.stale_ticket_days, nowDate, deps);
    } catch (err) {
      log(`stale-ticket sweep failed for ${issue.key}: ${String(err)}`);
    }
  }
}

export type StaleTicketCron = { stop: () => void };

/** Starts the periodic sweep on `opts.checkIntervalMs`. `stop()` halts it. */
export function startStaleTicketCron(deps: StaleTicketSweepDeps, opts: { checkIntervalMs: number }): StaleTicketCron {
  const log = deps.log ?? ((msg: string) => console.error(msg));
  const interval = setInterval(() => {
    runStaleTicketSweep(Date.now(), deps).catch((err) => {
      log(`stale-ticket cron tick failed: ${String(err)}`);
    });
  }, opts.checkIntervalMs);

  return { stop: () => clearInterval(interval) };
}
