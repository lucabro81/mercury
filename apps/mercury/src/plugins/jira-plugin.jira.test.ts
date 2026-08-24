import { describe, it, expect } from "bun:test";
import { PLUGIN_API_VERSION } from "@mercury/plugin-types";
import { jiraPlugin, jiraCliConfig } from "@mercury/plugin-jira";

/**
 * The Jira plugin's assembled module object — its static declaration (name,
 * raw allowlist, skill) and its `build()`, which turns the runtime context
 * (env + model) into the issue-list extractor and the post-turn guard. The
 * generic loader that consumes this shape is tested with synthetic plugins in
 * plugin-loader.test.ts; this file pins the Jira-specific `build()` wiring that
 * used to live inline in the composition root behind `jiraEnabled` /
 * `JIRA_SITE_URL` checks. Rendering (the render handler + its itemTemplate) is
 * no longer the plugin's concern — it lives at composition — so this file no
 * longer asserts anything about it.
 */
const MODEL = {} as never; // build() only closes over the model; it never calls it
const noLog = () => {};

describe("jiraPlugin", () => {
  it("declares the jira name, its raw allowlist, and a jira skill (not an always-on fragment)", () => {
    expect(jiraPlugin.apiVersion).toBe(PLUGIN_API_VERSION);
    expect(jiraPlugin.name).toBe("jira");
    expect(jiraPlugin.cliConfig).toBe(jiraCliConfig);
    // The Jira instructions moved from an always-on prompt fragment to a skill
    // loaded on demand.
    expect(jiraPlugin.systemPromptFragment).toBeUndefined();
    expect(jiraPlugin.skills).toHaveLength(1);
    const skill = jiraPlugin.skills![0]!;
    expect(skill.name).toBe("jira");
    expect(skill.description.length).toBeGreaterThan(0);
    expect(skill.body).toContain("runCommand");
    expect(skill.body).toContain("--jql");
  });

  it("always contributes the issue-list post-turn guard when built, regardless of env", () => {
    const c = jiraPlugin.build!({ model: MODEL, env: {}, log: noLog });
    expect(c.postTurnGuards).toHaveLength(1);
    expect(c.postTurnGuards![0]!.statusId).toBe("issue-list-correction");
  });

  it("registers the issue-list extractor when JIRA_SITE_URL is set", () => {
    const c = jiraPlugin.build!({ model: MODEL, env: { JIRA_SITE_URL: "https://webcomperio.atlassian.net" }, log: noLog });
    expect(c.postProcessors).toHaveProperty("issue-list");
  });

  it("does not register the extractor when JIRA_SITE_URL is absent — the guard still comes through", () => {
    const c = jiraPlugin.build!({ model: MODEL, env: {}, log: noLog });
    expect(c.postProcessors ?? {}).not.toHaveProperty("issue-list");
    expect(c.postTurnGuards).toHaveLength(1);
  });

  it("treats an empty JIRA_SITE_URL as unconfigured — no extractor and no log noise", () => {
    const logs: string[] = [];
    const c = jiraPlugin.build!({ model: MODEL, env: { JIRA_SITE_URL: "" }, log: (m) => logs.push(m) });
    expect(c.postProcessors ?? {}).not.toHaveProperty("issue-list");
    expect(logs).toEqual([]);
  });

  it("ignores JIRA_ISSUE_LIST_TEMPLATE — rendering config is no longer read by the plugin", () => {
    // The plugin registers the extractor from siteUrl alone; the template is a
    // render-handler concern read at composition, not here. A present template
    // env must neither block nor alter the extractor's registration.
    const c = jiraPlugin.build!({
      model: MODEL,
      env: { JIRA_SITE_URL: "https://x.atlassian.net", JIRA_ISSUE_LIST_TEMPLATE: "{key}: {summary}" },
      log: noLog,
    });
    expect(c.postProcessors).toHaveProperty("issue-list");
  });
});
