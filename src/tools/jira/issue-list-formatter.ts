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
 * Three outcomes, not two: `data` might not even be a plain object (a raw
 * string/array/number — genuinely foreign, nothing safe to attach a note
 * to, stays silent); might be a plain object with no `issues` array at
 * all (e.g. a bare `{}` — confirmed live, this is exactly what jira
 * returns for a `--select` path that matches nothing, like the model
 * trying `--select formattedList`); or might have an `issues` array whose
 * elements aren't full issue objects (`--select` prunes "key" off while
 * still nesting everything under `issues`, also confirmed live). The
 * latter two both deserve a `formattedListNote`, not silence — see
 * `createJiraIssueListFormatter`.
 */
type IssueSearchShape =
  | { kind: "not-object" }
  | { kind: "no-issues-array"; data: Record<string, unknown> }
  | { kind: "issues"; data: Record<string, unknown>; issues: unknown[] };

function classifyResultData(data: unknown): IssueSearchShape {
  if (!isPlainObject(data)) {
    return { kind: "not-object" };
  }
  if (!Array.isArray(data.issues)) {
    return { kind: "no-issues-array", data };
  }
  return { kind: "issues", data, issues: data.issues };
}

/**
 * `formattedList`/`formattedListNote` are added to `runCommand`'s result
 * *after* jira itself runs — they are never part of jira's own JSON, so
 * `--select` (evaluated by jira, on jira's own raw output) can never reach
 * them. Observed live: the model tried `--select formattedList` reasoning
 * from the system prompt alone that it must be a real field — jira found
 * no such path and returned a bare `{}`, twice, with no explanation.
 */
const CANNOT_FORMAT_NOTE =
  'Could not build a formatted issue list from this result. Note: formattedList/formattedListNote are ' +
  "added by Mercury to runCommand's result after jira runs — they are not part of jira's own JSON and can " +
  'never be reached with --select (e.g. --select formattedList always returns {}). If the user wants a ' +
  "formatted list, retry without --select (or with --select-all, or --fields including summary).";

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
    const shape = classifyResultData(result.data);
    if (shape.kind === "not-object") {
      return result;
    }
    if (shape.kind === "no-issues-array") {
      return { ok: true, data: { ...shape.data, formattedListNote: CANNOT_FORMAT_NOTE } };
    }

    const { data, issues } = shape;

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
      return { ok: true, data: { ...data, formattedListNote: CANNOT_FORMAT_NOTE } };
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
