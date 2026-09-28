/**
 * The public surface of `@mercury/core` — the framework runtime a Mercury
 * instance consumes. Everything else under `src/` is internal: an app depends on
 * this barrel, never on a deep path.
 *
 * What's exported, and who uses it:
 * - `composeMercury` builds the instance from a config it is *given* (the
 *   config is never imported by the core — that's what keeps it app-agnostic).
 *   `ComposedApp`/`ConfirmDeps` are its result and confirm-binding types.
 * - `loadChannels`/`LoadedChannel` — the service entrypoint starts the declared
 *   channels with these.
 * - `createTerminalProvider` — the dev REPL entrypoint opens the terminal with it.
 * - `defineMercuryConfig`/`MercuryConfig` — the app's `mercury.config.ts` declares
 *   its composition through these.
 * - `formatterPlugin`/`createJiraIssueListHandler` — the composition-layer
 *   helpers a config wires around its data plugins. (`createJiraIssueListHandler`
 *   is Jira-specific glue that stays here until #26 relocates it into plugin-jira.)
 */
export { composeMercury, type ComposedApp, type ConfirmDeps } from "./src/compose.ts";
export { loadChannels, type LoadedChannel } from "./src/router/channel-loader.ts";
export { createTerminalProvider } from "./src/router/terminal-provider.ts";
export { defineMercuryConfig, type MercuryConfig } from "./src/config/define-config.ts";
export { formatterPlugin } from "./src/plugins/formatter.ts";
export { createJiraIssueListHandler } from "./src/plugins/jira-issue-list-handler.ts";
