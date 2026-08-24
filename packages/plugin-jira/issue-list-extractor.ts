/**
 * Deterministic post-processor for a `jira issue search` result — the
 * *extraction* half of Jira's issue-list handling. It recognizes the shape of a
 * search result and emits, on the user-facing `display` channel (see
 * `ToolDisplay`, `type: "issue-list"`), one **structured record** per issue
 * (`{ key, status, summary, url }`) — never a pre-rendered string. Turning those
 * records into text is the render handler's job, supplied at composition (see
 * the app's `jira-issue-list-handler.ts`); the plugin owns only what it can know
 * from the data: the fields, and the browse `url` resolved from `siteUrl`.
 *
 * It runs because the plugin's allowlist declares `"postProcess": "issue-list"`
 * on the `issue search` entry. `--select` can reshape the JSON into anything, so
 * it classifies defensively: a non-object payload passes through untouched; a
 * payload with no `issues` array, or issues pruned of `key`, gets a
 * model-facing `formattedListNote` (no display); a missing `summary` is a hard,
 * self-correctable error. `siteUrl` (Comperio's browsable Jira host) isn't
 * derivable from any CLI output, so it's a deployment constant carried in the
 * plugin's config.
 *
 * `CliResult`/`CliPostProcessor` come from `@mercury/plugin-types`, the shared
 * contract both the core and the plugins import.
 */
import { z } from "zod";
import type { CliResult, CliPostProcessor } from "@mercury/plugin-types";

/** The extractor's configuration: just `siteUrl`, Comperio's browsable Jira
 * site (e.g. `https://webcomperio.atlassian.net`), used to build each issue's
 * browse link. `.strict()` so a typo — including a now-removed `itemTemplate`,
 * which moved to the render handler — fails loudly. */
export const issueListConfigSchema = z
  .object({
    siteUrl: z.string().min(1),
  })
  .strict();

export type IssueListConfig = z.infer<typeof issueListConfigSchema>;

/** One issue as emitted on the `display` channel: `status` is the status name
 * or `null` when absent/unrequested, `url` the resolved browse link. */
export type JiraIssueListItem = { key: string; status: string | null; summary: string; url: string };

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
 * latter two both deserve a `formattedListNote`, not silence.
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

/** Extracts one issue into the structured `display` record: the status name or
 * `null`, and the browse `url` from `siteUrl` (trailing slash stripped). */
function extractOneIssue(issue: JiraIssue, siteUrl: string): JiraIssueListItem {
  const status = issue.fields?.status?.name;
  return {
    key: issue.key,
    status: typeof status === "string" ? status : null,
    summary: issue.fields?.summary ?? "",
    url: `${siteUrl.replace(/\/$/, "")}/browse/${issue.key}`,
  };
}

/**
 * Builds the `issue search` extractor from validated config. Returns a function
 * structurally compatible with the core's `CliPostProcessor`; the composition
 * root wraps it with `formatterPlugin` + a render handler and registers the
 * result in the core's named registry.
 */
export function createJiraIssueListExtractor(config: IssueListConfig): CliPostProcessor {
  const { siteUrl } = config;
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
      return { ok: true, data, display: { type: "issue-list", items: [] } };
    }

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

    // Structured records on the user-facing `display` channel; the render
    // handler (composition) turns them into text. The raw `data` is left as the
    // model channel, untouched.
    const items = issues.map((issue) => extractOneIssue(issue, siteUrl));
    return { ok: true, data, display: { type: "issue-list", items } };
  };
}
