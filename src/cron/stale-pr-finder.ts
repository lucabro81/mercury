/**
 * Finds stale, unapproved-reviewer pull requests across configured
 * Bitbucket repositories — the PR half of D-25's "PR ferme" check.
 * Bitbucket has no repo-agnostic staleness filter server-side (unlike
 * Jira's `--stale-days`) and `pr list` doesn't return `participants` at
 * all, only `pr get` does — so this runs a cheap `pr list` per repo
 * first, filters by `updated_on` client-side, and only calls `pr get`
 * (to inspect `participants[].approved`) for the PRs that already
 * cleared the staleness bar. A failure on one repository or one PR is
 * logged and never stops the rest — same "one bad tick can't take down
 * the rest" convention as every other cron loop here.
 */
import type { runCli, CliResult } from "../tools/cli-executor.ts";

export type StalePrFinding = {
  repository: string;
  prId: number;
  title: string;
  updatedOn: string;
  reviewer: { accountId: string; displayName: string };
};

type PrListEntry = { id: number; title: string; updated_on: string };
type PrParticipant = { role: string; approved: boolean; user: { account_id: string; display_name: string } };

const DAY_MS = 24 * 60 * 60 * 1000;

function isStale(updatedOn: string, staleDays: number, now: Date): boolean {
  return now.getTime() - new Date(updatedOn).getTime() >= staleDays * DAY_MS;
}

async function listOpenPrs(
  repository: string,
  runCliFn: typeof runCli,
): Promise<PrListEntry[]> {
  const entries: PrListEntry[] = [];
  for (let page = 1; ; page++) {
    const result: CliResult = await runCliFn("bitbucket", [
      "pr",
      "list",
      repository,
      "--state",
      "OPEN",
      "--page",
      String(page),
      "--select",
      "values.id,values.title,values.updated_on",
    ]);
    if (!result.ok) {
      throw new Error(result.error);
    }
    const data = result.data as { pagelen: number; values: PrListEntry[] };
    entries.push(...data.values);
    if (data.values.length === 0 || data.values.length < data.pagelen) {
      break;
    }
  }
  return entries;
}

async function findingsForPr(
  repository: string,
  pr: PrListEntry,
  runCliFn: typeof runCli,
): Promise<StalePrFinding[]> {
  const result = await runCliFn("bitbucket", [
    "pr",
    "get",
    repository,
    String(pr.id),
    "--select",
    "id,title,updated_on,participants",
  ]);
  if (!result.ok) {
    throw new Error(result.error);
  }
  const data = result.data as { participants?: PrParticipant[] };
  return (data.participants ?? [])
    .filter((p) => p.role === "REVIEWER" && !p.approved)
    .map((p) => ({
      repository,
      prId: pr.id,
      title: pr.title,
      updatedOn: pr.updated_on,
      reviewer: { accountId: p.user.account_id, displayName: p.user.display_name },
    }));
}

/** Scans `repositories` for open PRs idle past `staleDays` with at least one unapproved reviewer, one finding per (PR, reviewer) pair. */
export async function findStalePrs(
  repositories: string[],
  staleDays: number,
  now: Date,
  deps: { runCliFn: typeof runCli; log?: (msg: string) => void },
): Promise<StalePrFinding[]> {
  const log = deps.log ?? ((msg: string) => console.error(msg));
  const findings: StalePrFinding[] = [];

  for (const repository of repositories) {
    let openPrs: PrListEntry[];
    try {
      openPrs = await listOpenPrs(repository, deps.runCliFn);
    } catch (err) {
      log(`stale-pr finder failed listing ${repository}: ${String(err)}`);
      continue;
    }

    for (const pr of openPrs.filter((p) => isStale(p.updated_on, staleDays, now))) {
      try {
        findings.push(...(await findingsForPr(repository, pr, deps.runCliFn)));
      } catch (err) {
        log(`stale-pr finder failed for ${repository}#${pr.id}: ${String(err)}`);
      }
    }
  }

  return findings;
}
