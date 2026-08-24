/**
 * The Jira issue-list render handler, supplied at composition (`mercury.config.ts`)
 * to `formatterPlugin` on top of the Jira plugin. It owns the format knowledge
 * that used to live inside the plugin's `formatOneIssue`: given the extractor's
 * structured items, it produces the single user-facing text block — the default
 * `KEY [status] summary\nurl` line (the bracket present only when a status is),
 * the optional `itemTemplate` override, the blank-line join, and the empty-set
 * sentence.
 *
 * It lives here, in the composition layer, rather than in the data plugin: the
 * plugin emits structured data, the pairing of that data with *how it renders*
 * is an instance-composition decision. `itemTemplate` (from
 * JIRA_ISSUE_LIST_TEMPLATE) is read where the handler is wired, not by the
 * plugin — the template is rendering config and travels with rendering.
 */
import type { DisplayHandler } from "./formatter.ts";

/** One issue as the Jira extractor emits it on the `display` channel: a status
 * name or `null` (absent/unrequested), and a browse `url` already resolved from
 * the site. */
export type JiraIssueListItem = { key: string; status: string | null; summary: string; url: string };

/** Renders a single item, either through the configured template
 * (`{key}/{status}/{summary}/{url}`, `{status}` blank when null) or the default
 * line whose `[status] ` bracket appears only when a status is present. */
function renderLine(item: JiraIssueListItem, template: string | undefined): string {
  if (template !== undefined) {
    return template
      .replaceAll("{key}", item.key)
      .replaceAll("{status}", item.status ?? "")
      .replaceAll("{summary}", item.summary)
      .replaceAll("{url}", item.url);
  }
  const statusPart = item.status !== null ? `[${item.status}] ` : "";
  return `${item.key} ${statusPart}${item.summary}\n${item.url}`;
}

/**
 * Builds the Jira issue-list render handler. An absent or empty `itemTemplate`
 * (JIRA_ISSUE_LIST_TEMPLATE unset, or set to `""` by mistake) falls back to the
 * default format; a non-empty one overrides every line.
 */
export function createJiraIssueListHandler(opts: { itemTemplate?: string }): DisplayHandler {
  const template = opts.itemTemplate && opts.itemTemplate.length > 0 ? opts.itemTemplate : undefined;
  return (items) => {
    const issues = items as JiraIssueListItem[];
    if (issues.length === 0) {
      return "No matching issues.";
    }
    return issues.map((issue) => renderLine(issue, template)).join("\n\n");
  };
}
