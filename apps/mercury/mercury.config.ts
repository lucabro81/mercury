/**
 * This instance's composition config — the single place that names which
 * plugins Mercury runs and how their lists are shown to the user. The
 * composition root (`src/index.ts`) reads the plugin set from here rather than
 * declaring it inline, so what an instance is made of lives in one app-root
 * file, `defineConfig`-style.
 *
 * A plugin contributes only when it is also listed in MERCURY_CLIS and its
 * allowlist validates (see `loadPlugins`); listing it here declares intent, not
 * unconditional activation.
 */
import { defineMercuryConfig } from "@mercury/core";
import { formatterPlugin, formatter } from "@mercury/formatter";
import { jiraPlugin, type JiraDisplays } from "@mercury/plugin-jira";
import { bitbucketPlugin } from "@mercury/plugin-bitbucket";
import { atlassianAdminPlugin } from "@mercury/plugin-atlassian-admin";
import { googleChatChannel } from "@mercury/channel-google-chat";
import { httpChannel } from "@mercury/channel-http";

/** One Jira issue in a search result: key, status in brackets when there is
 * one, summary, and the browse link on its own line. */
const jiraIssueLine = (issue: JiraDisplays["issue-list"]) =>
  `${issue.key} ${issue.status ? `[${issue.status}] ` : ""}${issue.summary}\n${issue.url}`;

export default defineMercuryConfig({
  plugins: [
    // Jira hands over structured lists; the formatter renders each kind with the
    // rule written here.
    formatterPlugin(
      jiraPlugin,
      formatter<JiraDisplays>({
        "issue-list": { item: jiraIssueLine, empty: "No matching issues." },
      }),
    ),
    bitbucketPlugin,
    atlassianAdminPlugin,
  ],
  // Channels are plugins too, loaded by the channel loader — declared here =
  // active (no env gate). Google Chat and HTTP are the channels; the interactive
  // terminal is a dev command (`bun run repl`), not a channel of the service.
  channels: [googleChatChannel, httpChannel],
});
