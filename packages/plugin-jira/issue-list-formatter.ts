/**
 * Deterministic post-processor for a `jira issue search` result — emits the
 * rendered issue lines on the result's user-facing `display` channel (see
 * `ToolDisplay`, `type: "issue-list"`), so the list reaches the user without
 * the model having to hand-format it or even see it. It runs only because the
 * plugin's allowlist declares `"postProcess": "issue-list"` on the `issue
 * search` entry; this module just recognizes the *shape* of a search result
 * (defensively — `--select` can reshape the JSON into anything, in which
 * case it backs off and returns the result unchanged rather than guessing).
 *
 * This is the second piece of Jira to leave the core (after the allowlist).
 * It used to live at `apps/mercury/src/tools/jira/issue-list-formatter.ts`
 * and be wired with just `siteUrl`; it now travels with the plugin and owns
 * its own config schema — the first demonstration of plugin-specific
 * configuration, with two values of different nature: `siteUrl` (required,
 * a deployment constant) and `itemTemplate` (optional, with a default that
 * reproduces the historical format exactly).
 *
 * `CliResult`/`CliPostProcessor` come from `@mercury/plugin-types`, the shared
 * contract both the core and the plugins import — no local mirror any more.
 */
import { z } from "zod";
import type { CliResult, CliPostProcessor } from "@mercury/plugin-types";

/** The formatter's own configuration. `siteUrl` is Comperio's browsable Jira
 * site (e.g. `https://webcomperio.atlassian.net`) — not derivable from any CLI
 * output, so a deployment constant. `itemTemplate` is optional: when set it
 * overrides how each issue line is rendered, with `{key}`/`{status}`/
 * `{summary}`/`{url}` placeholders; when unset the historical default format
 * is used verbatim. `.strict()` so a typo in the config fails loudly. */
export const issueListConfigSchema = z
  .object({
    siteUrl: z.string().min(1),
    itemTemplate: z.string().min(1).optional(),
  })
  .strict();

export type IssueListConfig = z.infer<typeof issueListConfigSchema>;

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

function formatOneIssue(issue: JiraIssue, siteUrl: string, itemTemplate: string | undefined): string {
  const link = `${siteUrl.replace(/\/$/, "")}/browse/${issue.key}`;
  if (itemTemplate !== undefined) {
    const status = issue.fields?.status?.name;
    return itemTemplate
      .replaceAll("{key}", issue.key)
      .replaceAll("{status}", typeof status === "string" ? status : "")
      .replaceAll("{summary}", issue.fields?.summary ?? "")
      .replaceAll("{url}", link);
  }
  // Historical default, reproduced verbatim: the status bracket (with its
  // trailing space) appears only when a status name is present, so a missing
  // status yields "KEY summary", not "KEY [] summary".
  const status = issue.fields?.status?.name;
  const statusPart = typeof status === "string" ? `[${status}] ` : "";
  return `${issue.key} ${statusPart}${issue.fields?.summary}\n${link}`;
}

/**
 * Builds the `issue search` post-processor from validated config. Returns a
 * function structurally compatible with the core's `CliPostProcessor`; the
 * composition root assigns it into the core's named registry, where the
 * compatibility is checked.
 */
export function createJiraIssueListFormatter(config: IssueListConfig): CliPostProcessor {
  const { siteUrl, itemTemplate } = config;
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

    // One rendered line per issue on the user-facing `display` channel; the
    // per-line rendering (default format or the configured `itemTemplate`)
    // stays here in the plugin, which owns the config. Joining the lines and
    // the empty-set sentence are the core renderer's job (see
    // `src/router/format-list-splice.ts`). The raw `data` is left as the model
    // channel, untouched.
    const items = issues.map((issue) => formatOneIssue(issue, siteUrl, itemTemplate));
    return { ok: true, data, display: { type: "issue-list", items } };
  };
}
