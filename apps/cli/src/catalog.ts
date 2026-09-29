/**
 * The channels and tool plugins `mercury create` can put in a new app. Written
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
};

export const CATALOG: CatalogEntry[] = [
  {
    id: "google-chat",
    kind: "channel",
    package: "@mercury/channel-google-chat",
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
    package: "@mercury/channel-http",
    exportName: "httpChannel",
    env: [
      { name: "HTTP_SURFACE_PORT", comment: "Port of the HTTP surface (no authentication: keep it off the public network)", value: "4100" },
      { name: "HTTP_SURFACE_CORS_ORIGIN", comment: "Origin allowed to call the HTTP surface from a browser, if any" },
    ],
  },
  {
    id: "jira",
    kind: "tool",
    package: "@mercury/plugin-jira",
    exportName: "jiraPlugin",
    env: [{ name: "JIRA_SITE_URL", comment: "Jira site the issue links point to (https://<site>.atlassian.net)" }],
  },
  {
    id: "bitbucket",
    kind: "tool",
    package: "@mercury/plugin-bitbucket",
    exportName: "bitbucketPlugin",
    env: [],
  },
  {
    id: "atlassian-admin",
    kind: "tool",
    package: "@mercury/plugin-atlassian-admin",
    exportName: "atlassianAdminPlugin",
    env: [],
  },
];

/** The catalog entry of `kind` with `id`, or undefined when there is none. */
export function findEntry(kind: CatalogEntry["kind"], id: string): CatalogEntry | undefined {
  return CATALOG.find((e) => e.kind === kind && e.id === id);
}
