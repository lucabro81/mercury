/**
 * The Jira plugin's module object — the single value the core's composition
 * root lists and its generic loader (`loadPlugins`) processes. It bundles the
 * plugin's four contributions in one place:
 *  - `name`: the MERCURY_CLIS entry and the binary this plugin owns;
 *  - `cliConfig`: the raw, unvalidated allowlist the core validates through the
 *    same schema/version barrier a file-based config passes;
 *  - `systemPromptFragment`: the tool-surface description the core splices into
 *    the system prompt when the plugin is active;
 *  - `build(ctx)`: the env/model-dependent half — the `issue search` extractor,
 *    registered only when JIRA_SITE_URL is configured. This is the logic that
 *    used to live inline in the composition root behind `jiraEnabled` and
 *    `JIRA_SITE_URL` checks.
 *
 * The object is a plain literal, not typed against a core interface — a plugin
 * package must not import from the app it plugs into. The core's plugin list is
 * typed against `PluginModule`, and the composition root's assignment is where
 * the structural compatibility is checked; Fase 3 hoists that interface into a
 * shared type both sides import.
 */
import { readFileSync } from "node:fs";
import { PLUGIN_API_VERSION, type Plugin, type CliPostProcessor, parseSkill } from "@mercury/plugin-types";
import rawConfig from "./jira.json";
import { createJiraIssueListExtractor } from "./issue-list-extractor.ts";

/** The raw, unvalidated allowlist object. Handed to the core as data — the
 * core runs the same `.strict()` Zod barrier over it that it runs over any
 * file-based CLI config, so nothing here reaches the model's executable
 * surface unvalidated. */
export const jiraCliConfig: unknown = rawConfig;

/** The Jira skill (Agent Skills `SKILL.md`), read from the package asset at
 * load. Its descriptor stays in the system prompt; its body — the DO/DON'T that
 * used to be an always-on prompt fragment — loads only when the model asks for
 * it (see the core's read_skill tool). */
const jiraSkill = parseSkill(readFileSync(new URL("./skills/jira/SKILL.md", import.meta.url), "utf8"));

export const jiraPlugin: Plugin = {
  apiVersion: PLUGIN_API_VERSION,
  name: "jira",
  cliConfig: jiraCliConfig,
  skills: [jiraSkill],
  build: (ctx) => {
    const postProcessors: Record<string, CliPostProcessor> = {};

    // The `issue search` extractor only registers when JIRA_SITE_URL is set —
    // it isn't derivable from any CLI output (the API talks to
    // api.atlassian.com/ex/jira/<cloud-id>/…, unrelated to the human-facing
    // hostname), so without it the extractor is never registered and `issue
    // search` passes through unaugmented. An absent or empty site url is "not
    // configured" and stays silent. Rendering config (itemTemplate) is no
    // longer here — it moved to the render handler wired in the composition
    // config, so `siteUrl` is the extractor's only input.
    const siteUrl = ctx.env.JIRA_SITE_URL;
    if (siteUrl) {
      postProcessors["issue-list"] = createJiraIssueListExtractor({ siteUrl });
    }

    return { postProcessors };
  },
};
