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
import { jiraPlugin } from "@mercury/plugin-jira";
import { bitbucketPlugin } from "@mercury/plugin-bitbucket";

export default defineMercuryConfig({
  plugins: [jiraPlugin, bitbucketPlugin],
});
