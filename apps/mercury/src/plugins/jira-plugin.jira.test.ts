import { describe, it, expect } from "bun:test";
import { PLUGIN_API_VERSION, type SessionToolContext } from "@mercury/plugin-types";
import { jiraPlugin } from "@mercury/plugin-jira";

/**
 * The Jira plugin's assembled module object — its static declaration (name,
 * skill) and its `build()`, which validates its own allowlist (schema only, no
 * `--version` spawn) and turns the runtime context into the `jiraCommand` tool,
 * the issue-list extractor (only when JIRA_SITE_URL is set), and the tool's
 * status describer. The generic loader that consumes this shape is tested with
 * synthetic plugins in plugin-loader.test.ts.
 */
const MODEL = {} as never; // build() only closes over the model; it never calls it
const noLog = () => {};
const sctx: SessionToolContext = { sessionKey: "s", stageConfirmation: async () => "tok", stashDisplay: () => "d1" };

describe("jiraPlugin", () => {
  it("declares the jira name and a jira skill (not an always-on fragment)", () => {
    expect(jiraPlugin.apiVersion).toBe(PLUGIN_API_VERSION);
    expect(jiraPlugin.name).toBe("jira");
    // The Jira instructions moved from an always-on prompt fragment to a skill
    // loaded on demand.
    expect(jiraPlugin.systemPromptFragment).toBeUndefined();
    expect(jiraPlugin.skills).toHaveLength(1);
    const skill = jiraPlugin.skills![0]!;
    expect(skill.name).toBe("jira");
    expect(skill.description.length).toBeGreaterThan(0);
    expect(skill.body).toContain("jiraCommand");
    expect(skill.body).toContain("--jql");
  });

  it("builds a jiraCommand tool and its status describer", () => {
    const c = jiraPlugin.build!({ model: MODEL, env: {}, log: noLog });
    const tools = c.sessionTools!(sctx, {});
    expect(Object.keys(tools)).toEqual(["jiraCommand"]);
    expect(c.toolStatusDescribers!.jiraCommand!({ command: "jira issue search --jql X" })).toBe("esecuzione jira issue search");
  });

  it("contributes no post-turn guard — the model-backed issue-list corrector is retired", () => {
    const c = jiraPlugin.build!({ model: MODEL, env: {}, log: noLog });
    expect(c.postTurnGuards ?? []).toEqual([]);
  });

  it("registers the issue-list extractor when JIRA_SITE_URL is set", () => {
    const c = jiraPlugin.build!({ model: MODEL, env: { JIRA_SITE_URL: "https://webcomperio.atlassian.net" }, log: noLog });
    expect(c.postProcessors).toHaveProperty("issue-list");
  });

  it("does not register the extractor when JIRA_SITE_URL is absent", () => {
    const c = jiraPlugin.build!({ model: MODEL, env: {}, log: noLog });
    expect(c.postProcessors ?? {}).not.toHaveProperty("issue-list");
  });

  it("treats an empty JIRA_SITE_URL as unconfigured — no extractor and no log noise", () => {
    const logs: string[] = [];
    const c = jiraPlugin.build!({ model: MODEL, env: { JIRA_SITE_URL: "" }, log: (m) => logs.push(m) });
    expect(c.postProcessors ?? {}).not.toHaveProperty("issue-list");
    expect(logs).toEqual([]);
  });

  it("ignores JIRA_ISSUE_LIST_TEMPLATE — rendering config is no longer read by the plugin", () => {
    // The plugin registers the extractor from siteUrl alone; the template is a
    // render-handler concern read at composition, not here.
    const c = jiraPlugin.build!({
      model: MODEL,
      env: { JIRA_SITE_URL: "https://x.atlassian.net", JIRA_ISSUE_LIST_TEMPLATE: "{key}: {summary}" },
      log: noLog,
    });
    expect(c.postProcessors).toHaveProperty("issue-list");
  });
});
