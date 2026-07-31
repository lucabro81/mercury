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

function isJiraIssue(value: unknown): value is JiraIssue {
  return typeof value === "object" && value !== null && typeof (value as { key?: unknown }).key === "string";
}

function isIssueSearchResult(data: unknown): data is { issues: unknown[] } {
  return (
    typeof data === "object" &&
    data !== null &&
    Array.isArray((data as { issues?: unknown }).issues) &&
    (data as { issues: unknown[] }).issues.every(isJiraIssue)
  );
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
    if (!isIssueSearchResult(result.data)) {
      return result;
    }

    const { issues } = result.data;
    if (issues.length === 0) {
      return { ok: true, data: { ...result.data, formattedList: "No matching issues." } };
    }

    const missingSummary = (issues as JiraIssue[]).some((issue) => typeof issue.fields?.summary !== "string");
    if (missingSummary) {
      return {
        ok: false,
        error:
          'Cannot build a formatted issue list: "summary" is missing from the result. Retry the search with ' +
          "--fields including summary (e.g. --fields summary,status).",
      };
    }

    const formattedList = (issues as JiraIssue[]).map((issue) => formatOneIssue(issue, siteUrl)).join("\n\n");
    return { ok: true, data: { ...result.data, formattedList } };
  };
}
