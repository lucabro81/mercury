/**
 * The channels and tool plugins `mfw create` can put in a new app. Written
 * by hand for now: once the packages are published, each plugin will describe
 * itself (kind, export, env vars) and this list goes away. `catalog.test.ts`
 * checks every entry against the real package until then.
 */

/** One environment variable an entry reads, as it appears in the app's env
 * example: `value` is the example value, empty when the deployer must fill it. */
export type EnvVar = { name: string; comment: string; value?: string };

/** A channel or tool plugin the app can include. `id` is the plugin's own
 * `name` (what MERCURY_CLIS lists for a tool plugin), `exportName` the value the
 * app's config imports from `package`. */
export type CatalogEntry = {
  id: string;
  kind: "channel" | "tool";
  package: string;
  exportName: string;
  env: EnvVar[];
  formatter?: FormatterExample;
  credentials?: CliCredentials;
};

/** Where a tool plugin's CLI keeps its login: `folder` under the CLI user's
 * `~/.config`, and the env variable that carries that folder into the
 * container (a base64 tar.gz with the folder at its root), materialized on
 * the credentials volume the first time the folder isn't there. */
export type CliCredentials = { folder: string; variable: string };

/** Starting formatter rules for a plugin that hands the user lists: without a
 * rule a kind of list isn't shown, so the scaffolded config wraps the plugin
 * with these. `displaysType` is the type the plugin exports for its kinds,
 * `helpers` the code the rules use (written above the config), `rules` the
 * `kind: rule` lines. Once written, they're the app's to change. */
export type FormatterExample = { displaysType: string; helpers: string; rules: string[] };

export const CATALOG: CatalogEntry[] = [
  {
    id: "google-chat",
    kind: "channel",
    package: "@mercury-fw/channel-google-chat",
    exportName: "googleChatChannel",
    env: [
      {
        name: "GOOGLE_CHAT_PUBSUB_SUBSCRIPTION",
        comment: "Pub/Sub subscription the Chat app's events arrive on (projects/<p>/subscriptions/<s>); empty leaves Google Chat inert",
      },
      { name: "GOOGLE_CHAT_APP_CLIENT_EMAIL", comment: "Service account the Chat app authenticates as" },
      { name: "GOOGLE_CHAT_APP_PRIVATE_KEY", comment: "That service account's private key (PEM)" },
    ],
  },
  {
    id: "http",
    kind: "channel",
    package: "@mercury-fw/channel-http",
    exportName: "httpChannel",
    env: [
      { name: "HTTP_SURFACE_PORT", comment: "Port of the HTTP surface (no authentication: keep it off the public network)", value: "4100" },
      { name: "HTTP_SURFACE_CORS_ORIGIN", comment: "Origin allowed to call the HTTP surface from a browser, if any" },
    ],
  },
  {
    id: "jira",
    kind: "tool",
    package: "@mercury-fw/plugin-jira",
    exportName: "jiraPlugin",
    credentials: { folder: "jira-cli", variable: "JIRA_CLI_CONFIG_TAR_B64" },
    env: [{ name: "JIRA_SITE_URL", comment: "Jira site the issue links point to (https://<site>.atlassian.net)" }],
    formatter: {
      displaysType: "JiraDisplays",
      helpers: [
        "/** One Jira issue in a search result: key, status in brackets when there is",
        " * one, summary, and the browse link on its own line. A starting point: change",
        " * it to change how Jira lists read. */",
        'const jiraIssueLine = (issue: JiraDisplays["issue-list"]) =>',
        '  `${issue.key} ${issue.status ? `[${issue.status}] ` : ""}${issue.summary}\\n${issue.url}`;',
      ].join("\n"),
      rules: ['"issue-list": { item: jiraIssueLine, empty: "No matching issues." },'],
    },
  },
  {
    id: "bitbucket",
    kind: "tool",
    package: "@mercury-fw/plugin-bitbucket",
    exportName: "bitbucketPlugin",
    credentials: { folder: "bitbucket-cli", variable: "BITBUCKET_CLI_CONFIG_TAR_B64" },
    env: [],
  },
  {
    id: "atlassian-admin",
    kind: "tool",
    package: "@mercury-fw/plugin-atlassian-admin",
    exportName: "atlassianAdminPlugin",
    credentials: { folder: "atlassian-admin-cli", variable: "ATLASSIAN_ADMIN_CLI_CONFIG_TAR_B64" },
    env: [],
  },
];

/** The catalog entry of `kind` with `id`, or undefined when there is none. */
export function findEntry(kind: CatalogEntry["kind"], id: string): CatalogEntry | undefined {
  return CATALOG.find((e) => e.kind === kind && e.id === id);
}
