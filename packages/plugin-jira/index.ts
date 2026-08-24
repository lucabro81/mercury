/**
 * The Jira plugin's public surface — a thin re-export layer, no logic of its
 * own. The plugin's contributions are assembled into a single module object in
 * `plugin.ts` (`jiraPlugin`), which the core's generic loader consumes; the
 * individual pieces stay exported too, for the seam tests that exercise them in
 * isolation. These are the pieces of Jira that left the core: the allowlist
 * used to be a maintainer-authored file scanned out of a config directory
 * (`cli-configs/jira.json`, bind-mounted at runtime), the prompt block used to
 * be hardcoded behind `if (opts.jira)` in `system-prompt.ts`, and the
 * issue-list formatting and correction used to be wired inline in the
 * composition root — all now travel as versioned assets with the plugin.
 */
export { jiraPlugin, jiraCliConfig } from "./plugin.ts";

export {
  createJiraIssueListExtractor,
  issueListConfigSchema,
  type IssueListConfig,
  type JiraIssueListItem,
} from "./issue-list-extractor.ts";

export { createIssueListCorrector } from "./issue-list-corrector.ts";
export { createIssueListGuard } from "./issue-list-guard.ts";
export { looksLikeIssueList, ISSUE_LIST_CORRECTION_FALLBACK } from "./issue-list-heuristic.ts";
