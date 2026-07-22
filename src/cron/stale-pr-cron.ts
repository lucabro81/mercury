/**
 * Stale-PR check: mirror of stale-ticket-cron.ts's orchestration, second
 * source for the same D-25 "route through Mercury, never a template"
 * mechanism. No in-memory scanner — `findStalePrs` re-derives the
 * candidate set fresh every tick from `pr_repositories`. Suppression is
 * keyed per (repository, PR, reviewer) — one reviewer suppressing a PR's
 * notification doesn't silence it for a co-reviewer.
 *
 * One finding's failure is logged and doesn't stop the rest — same "one
 * bad tick can't take down the rest of Mercury" convention as every
 * other cron loop here.
 */
import type { LanguageModel } from "ai";
import type { runCli } from "../tools/cli-executor.ts";
import type { readWikiFile } from "../wiki/wiki-read.ts";
import type { writeCuratedNote } from "../wiki/wiki-note.ts";
import type { EpisodicSummary } from "../memory/episodic-store.ts";
import type { sendMessage, getOrCreateDmSpace } from "../router/channels/google-chat-client.ts";
import { loadNotificationThresholds, DEFAULT_PR_STALE_DAYS } from "./notification-config.ts";
import { isNotificationSuppressed } from "./notification-suppression.ts";
import { resolveChatTargetForBitbucketUser, type IdentityBridgeResult } from "./identity-bridge.ts";
import { composeStalePrMessage, type StalePrFinding } from "./notification-composer.ts";
import { findStalePrs, type StalePrFinding as DetectedStalePr } from "./stale-pr-finder.ts";
import type { notifyAdmin } from "./admin-notify.ts";

export type StalePrSweepDeps = {
  vaultPath: string;
  adminSpace: string;
  model: LanguageModel;
  runCliFn: typeof runCli;
  readWikiFileFn: typeof readWikiFile;
  writeCuratedNoteFn: typeof writeCuratedNote;
  findStalePrsFn: typeof findStalePrs;
  isNotificationSuppressedFn: typeof isNotificationSuppressed;
  resolveChatTargetForBitbucketUserFn: typeof resolveChatTargetForBitbucketUser;
  historyFn: (userId: string, queryText: string) => Promise<EpisodicSummary[]>;
  composeStalePrMessageFn: (
    finding: StalePrFinding,
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

async function processOneFinding(
  finding: DetectedStalePr,
  staleDays: number,
  nowDate: Date,
  deps: StalePrSweepDeps,
): Promise<void> {
  const itemKey = `${finding.repository}#${finding.prId}#${finding.reviewer.accountId}`;
  const suppressed = await deps.isNotificationSuppressedFn(deps.vaultPath, "stale-pr", itemKey);
  if (suppressed) {
    return;
  }

  const bridgeResult: IdentityBridgeResult = await deps.resolveChatTargetForBitbucketUserFn(
    { accountId: finding.reviewer.accountId, displayName: finding.reviewer.displayName },
    {
      vaultPath: deps.vaultPath,
      adminSpace: deps.adminSpace,
      notifyAdminFn: deps.notifyAdminFn,
      sendMessageFn: deps.sendMessageFn,
      runCliFn: deps.runCliFn,
    },
  );
  if (bridgeResult.kind === "not-found") {
    return; // resolveChatTargetForBitbucketUser already notified the admin space itself
  }

  const history = await deps.historyFn(bridgeResult.chatUserId, `notifiche per PR #${finding.prId} su ${finding.repository}`);
  const text = await deps.composeStalePrMessageFn(
    { repository: finding.repository, prId: finding.prId, title: finding.title, staleDays },
    history,
    { model: deps.model },
  );

  const space = await deps.getOrCreateDmSpaceFn(bridgeResult.chatUserId, deps.runCliFn);
  await deps.sendMessageFn(space.name, text, deps.runCliFn);

  await deps.recordEventFn({
    userId: bridgeResult.chatUserId,
    sessionKey: space.name,
    summary: `Mercury ha notificato la PR #${finding.prId} di ${finding.repository} (in attesa di review da ${staleDays} giorni) a ${bridgeResult.displayName}.`,
    timestamp: nowDate.toISOString(),
  });
}

export async function runStalePrSweep(now: number, deps: StalePrSweepDeps): Promise<void> {
  const log = deps.log ?? ((msg: string) => console.error(msg));
  const nowDate = deps.now?.() ?? new Date(now);

  const thresholds = await loadNotificationThresholds(deps);
  const staleDays = thresholds.pr_stale_days ?? DEFAULT_PR_STALE_DAYS;
  const repositories = thresholds.pr_repositories ?? [];

  const findings = await deps.findStalePrsFn(repositories, staleDays, nowDate, { runCliFn: deps.runCliFn, log });

  for (const finding of findings) {
    try {
      await processOneFinding(finding, staleDays, nowDate, deps);
    } catch (err) {
      log(`stale-pr sweep failed for ${finding.repository}#${finding.prId}: ${String(err)}`);
    }
  }
}

export type StalePrCron = { stop: () => void };

/** Starts the periodic sweep on `opts.checkIntervalMs`. `stop()` halts it. */
export function startStalePrCron(deps: StalePrSweepDeps, opts: { checkIntervalMs: number }): StalePrCron {
  const log = deps.log ?? ((msg: string) => console.error(msg));
  const interval = setInterval(() => {
    runStalePrSweep(Date.now(), deps).catch((err) => {
      log(`stale-pr cron tick failed: ${String(err)}`);
    });
  }, opts.checkIntervalMs);

  return { stop: () => clearInterval(interval) };
}
