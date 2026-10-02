# @mercury-fw/plugin-jira

Gives a [Mercury](https://github.com/lucabro81/mercury-fw) agent Jira, through the `jira` CLI: searching with JQL, reading an issue and its transitions, creating issues, moving them, commenting, and deleting one (only after the user confirms it with the token Mercury hands back). The pinned `jira` binary downloads when the package installs, so nothing else needs installing.

```bash
bun add @mercury-fw/plugin-jira
```

An app scaffolded with it already has all of this. By hand:

- list it in `trustedDependencies` in the app's `package.json`, or Bun skips the install script that downloads the binary;
- add `jira` to `MERCURY_CLIS`;
- set `JIRA_SITE_URL` (`https://<site>.atlassian.net`), which the issue links in search results point to: without it a search still works, but comes back without the list to show the user.

The plugin hands search results over as a typed list (`JiraDisplays["issue-list"]`: key, summary, status, url), and the app decides how it reads with [`@mercury-fw/formatter`](https://www.npmjs.com/package/@mercury-fw/formatter):

```ts
import { formatterPlugin, formatter } from "@mercury-fw/formatter";
import { jiraPlugin, type JiraDisplays } from "@mercury-fw/plugin-jira";

const jiraIssueLine = (issue: JiraDisplays["issue-list"]) =>
  `${issue.key} ${issue.status ? `[${issue.status}] ` : ""}${issue.summary}\n${issue.url}`;

// in mercury.config.ts
plugins: [
  formatterPlugin(jiraPlugin, formatter<JiraDisplays>({
    "issue-list": { item: jiraIssueLine, empty: "No matching issues." },
  })),
],
```

## Credentials

The CLI keeps its login under `~/.config/jira-cli`; in a container that's `/home/mercury/.config/jira-cli`, on the `cli-credentials` volume of a scaffolded app. Log in with the CLI's own setup (see [CLI-monorepo](https://github.com/lucabro81/CLI-monorepo)) on a machine, then bring that folder into the volume. Doing this from the app's env file is planned ([#57](https://github.com/lucabro81/mercury-fw/issues/57)).

MIT
