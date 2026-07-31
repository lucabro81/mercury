/**
 * Deterministic `CliPostProcessor` (see `../cli-tool.ts`) for a
 * `jira issue search` result — adds a `formattedList` field the model can
 * relay verbatim instead of hand-formatting a list of issues itself.
 * Detection of "this is Jira" isn't done here at all: `cli-tool.ts` only
 * ever calls this because `cli-configs/jira.json` declares
 * `"postProcess": "issue-list"` on the `issue search` entry — this module
 * just has to recognize the *shape* of a search result (defensively;
 * `--select` can reshape the JSON into anything, in which case this backs
 * off and returns the result unchanged rather than guessing).
 */
import type { CliResult } from "../cli-executor.ts";
import type { CliPostProcessor } from "../cli-tool.ts";

type JiraIssue = { key: string; fields?: { summary?: string; status?: { name?: string } } };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isJiraIssue(value: unknown): value is JiraIssue {
  return isPlainObject(value) && typeof value.key === "string";
}

/**
 * `data.issues` as an array, or `undefined` if `data` isn't even that
 * generic shape — genuinely foreign, nothing safe to say about it.
 * Deliberately doesn't require each element to look like a full issue:
 * `--select` prunes "key" off entirely while still nesting everything
 * under `issues` (confirmed live), and that narrower case still deserves
 * a `formattedListNote`, not silence — see `createJiraIssueListFormatter`.
 */
function getIssuesArray(data: unknown): unknown[] | undefined {
  if (!isPlainObject(data)) {
    return undefined;
  }
  return Array.isArray(data.issues) ? data.issues : undefined;
}

function formatOneIssue(issue: JiraIssue, siteUrl: string): string {
  const status = issue.fields?.status?.name;
  const statusPart = typeof status === "string" ? `[${status}] ` : "";
  const link = `${siteUrl.replace(/\/$/, "")}/browse/${issue.key}`;
  return `${issue.key} ${statusPart}${issue.fields?.summary}\n${link}`;
}

/**
 * `siteUrl` is Comperio's browsable Jira site (e.g.
 * `https://webcomperio.atlassian.net`) — not derivable from any CLI
 * output (the API talks to `api.atlassian.com/ex/jira/<cloud-id>/...`,
 * which has no relation to the human-facing hostname), so it's a
 * deployment-level constant (`JIRA_SITE_URL`) injected in from `index.ts`,
 * same as `OLLAMA_HOST`.
 */
export function createJiraIssueListFormatter(siteUrl: string): CliPostProcessor {
  return (_parsed, result): CliResult => {
    if (!result.ok) {
      return result;
    }
    const issues = getIssuesArray(result.data);
    if (issues === undefined) {
      return result;
    }
    const data = result.data as Record<string, unknown>;

    if (issues.length === 0) {
      return { ok: true, data: { ...data, formattedList: "No matching issues." } };
    }

    // Not an error: the raw data is still valid and returned untouched —
    // just without a formattedList, plus a note explaining why, so the
    // model can retry with a different --select/--fields if it turns out
    // the user actually wanted a rendered list. Distinct from the
    // missing-summary case below, which IS a hard error: there, we know
    // for certain this is meant to be a formattable issue and just lacks
    // one field; here, we can't even tell these are full issue objects.
    if (!issues.every(isJiraIssue)) {
      return {
        ok: true,
        data: {
          ...data,
          formattedListNote:
            'Could not build a formatted issue list: this result is missing "key" per issue, likely because ' +
            "--select pruned it. If the user wants a formatted list, retry without --select (or with " +
            "--select-all, or --fields including summary) so a standard formattedList can be produced.",
        },
      };
    }

    const missingSummary = issues.some((issue) => typeof issue.fields?.summary !== "string");
    if (missingSummary) {
      return {
        ok: false,
        error:
          'Cannot build a formatted issue list: "summary" is missing from the result. Retry the search with ' +
          "--fields including summary (e.g. --fields summary,status).",
      };
    }

    const formattedList = issues.map((issue) => formatOneIssue(issue, siteUrl)).join("\n\n");
    return { ok: true, data: { ...data, formattedList } };
  };
}
