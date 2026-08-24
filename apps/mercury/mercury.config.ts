/**
 * This instance's composition config — the single place that names which
 * plugins Mercury runs. The composition root (`src/index.ts`) reads the plugin
 * set from here rather than declaring it inline, so what an instance is made of
 * lives in one app-root file, `defineConfig`-style.
 *
 * A plugin contributes only when it is also listed in MERCURY_CLIS and its
 * allowlist validates (see `loadPlugins`); listing it here declares intent, not
 * unconditional activation.
 */
import { defineMercuryConfig } from "./src/config/define-config.ts";
import { formatterPlugin } from "./src/plugins/formatter.ts";
import { createJiraIssueListHandler } from "./src/plugins/jira-issue-list-handler.ts";
import { jiraPlugin } from "@mercury/plugin-jira";
import { bitbucketPlugin } from "@mercury/plugin-bitbucket";

export default defineMercuryConfig({
  plugins: [
    // Jira emits structured issue-list records; the formatter decorator renders
    // them into the user-facing text block via the handler wired here. The
    // rendering config (JIRA_ISSUE_LIST_TEMPLATE) is read at composition — the
    // template is rendering config, so it travels with the render handler, not
    // with the data plugin.
    formatterPlugin(jiraPlugin, createJiraIssueListHandler({ itemTemplate: process.env.JIRA_ISSUE_LIST_TEMPLATE })),
    bitbucketPlugin,
  ],
});
