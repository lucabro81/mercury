import { describe, it, expect } from "bun:test";
import { PLUGIN_API_VERSION } from "@mercury/plugin-types";
import { jiraPlugin, jiraCliConfig } from "@mercury/plugin-jira";

/**
 * The Jira plugin's assembled module object — its static declaration (name,
 * raw allowlist, prompt fragment) and its `build()`, which turns the runtime
 * context (env + model) into the issue-list formatter and the post-turn guard.
 * The generic loader that consumes this shape is tested with synthetic plugins
 * in plugin-loader.test.ts; this file pins the Jira-specific `build()` wiring
 * that used to live inline in the composition root behind `jiraEnabled` /
 * `JIRA_SITE_URL` checks.
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

  it("registers the issue-list formatter when JIRA_SITE_URL is set", () => {
    const c = jiraPlugin.build!({ model: MODEL, env: { JIRA_SITE_URL: "https://webcomperio.atlassian.net" }, log: noLog });
    expect(c.postProcessors).toHaveProperty("issue-list");
  });

  it("does not register the formatter when JIRA_SITE_URL is absent — the guard still comes through", () => {
    const c = jiraPlugin.build!({ model: MODEL, env: {}, log: noLog });
    expect(c.postProcessors ?? {}).not.toHaveProperty("issue-list");
    expect(c.postTurnGuards).toHaveLength(1);
  });

  it("treats an empty JIRA_SITE_URL as unconfigured — no formatter and no log noise", () => {
    const logs: string[] = [];
    const c = jiraPlugin.build!({ model: MODEL, env: { JIRA_SITE_URL: "" }, log: (m) => logs.push(m) });
    expect(c.postProcessors ?? {}).not.toHaveProperty("issue-list");
    expect(logs).toEqual([]);
  });

  it("logs and skips the formatter when JIRA_SITE_URL is set but the config is invalid", () => {
    const logs: string[] = [];
    // An empty JIRA_ISSUE_LIST_TEMPLATE is present-but-invalid (schema min(1)),
    // distinct from absent — this must surface, unlike an unset site url.
    const c = jiraPlugin.build!({
      model: MODEL,
      env: { JIRA_SITE_URL: "https://x.atlassian.net", JIRA_ISSUE_LIST_TEMPLATE: "" },
      log: (m) => logs.push(m),
    });
    expect(c.postProcessors ?? {}).not.toHaveProperty("issue-list");
    expect(logs.some((l) => l.includes("invalid config"))).toBe(true);
  });

  it("registers the formatter with a valid custom JIRA_ISSUE_LIST_TEMPLATE", () => {
    const c = jiraPlugin.build!({
      model: MODEL,
      env: { JIRA_SITE_URL: "https://x.atlassian.net", JIRA_ISSUE_LIST_TEMPLATE: "{key}: {summary}" },
      log: noLog,
    });
    expect(c.postProcessors).toHaveProperty("issue-list");
  });
});
