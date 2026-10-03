import { describe, it, expect } from "bun:test";
import { PLUGIN_API_VERSION, type SessionToolContext } from "@mercury-fw/plugin-types";
import { jiraPlugin, JIRA_ISSUE_LIST_SELECT } from "./index.ts";

/**
 * The Jira plugin's assembled module object — its static declaration (name,
 * skill) and its `build()`, which validates its own allowlist (schema only, no
 * `--version` spawn) and turns the runtime context into the `jiraCommand` tool,
 * the issue-list extractor (JIRA_SITE_URL is required: without it build()
 * throws, and the loader skips the plugin), and the tool's
 * status describer. The generic loader that consumes this shape is tested with
 * synthetic plugins in @mercury-fw/core's plugin-loader.test.ts.
 */
const MODEL = {} as never; // build() only closes over the model; it never calls it
const noLog = () => {};
const ENV = { JIRA_SITE_URL: "https://example.atlassian.net" };
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

  // #83: the skill told the model to use --fields and to retry without
  // --select, both refused by the jira CLI (--select is mandatory on search,
  // get and transitions), and pointed to a note in one instance's vault. The
  // model burned four or five attempts on a single lookup.
  describe("skill agrees with the jira CLI", () => {
    const body = jiraPlugin.skills![0]!.body;

    it("gives the exact list select the extractor builds a list from", () => {
      expect(body).toContain(`--select ${JIRA_ISSUE_LIST_SELECT}`);
    });

    it("tells the model to read issueCount instead of counting keys itself", () => {
      expect(body).toContain("issueCount");
    });

    it("never says to drop --select, and points to no instance vault note", () => {
      expect(body).not.toContain("without --select");
      expect(body).not.toContain("curated/standards");
    });

    // #120: jira 0.8.1 fixed its --help examples; a warning that they omit
    // --select would now tell the model something false.
    it("doesn't warn that the --help examples omit --select", () => {
      expect(body).not.toMatch(/--help` examples omit/);
    });

    it("puts --select on every example of a command that requires it", () => {
      const examples = [...body.matchAll(/`(jira (?:issue (?:search|get|transitions)|user search|project search)\b[^`]*)`/g)].map((m) => m[1]!);
      expect(examples.length).toBeGreaterThanOrEqual(5);
      for (const example of examples) expect(example).toContain("--select ");
    });

    // #129: what the account ID is for, with the selects tried live on 0.8.2.
    it("shows how to find an account ID and a project key, and where an account ID goes", () => {
      expect(body).toContain("`jira user search --query \"Jane Doe\" --select accountId,displayName`");
      expect(body).toContain("`jira project search --query support --select values.key,values.name`");
      expect(body).toContain("`jira issue assign KAN-4 --assignee <accountId>`");
      expect(body).toContain("--mention <accountId>");
      expect(body).toContain("{{mention:<accountId>}}");
    });
  });

  it("builds a jiraCommand tool and its status describer", () => {
    const c = jiraPlugin.build!({ model: MODEL, env: ENV, log: noLog });
    const tools = c.sessionTools!(sctx, c.postProcess);
    expect(Object.keys(tools)).toEqual(["jiraCommand"]);
    expect(c.toolStatusDescribers!.jiraCommand!({ command: "jira issue search --jql X" })).toBe("esecuzione jira issue search");
  });

  it("contributes no post-turn guard — the model-backed issue-list corrector is retired", () => {
    const c = jiraPlugin.build!({ model: MODEL, env: ENV, log: noLog });
    expect(c.postTurnGuards ?? []).toEqual([]);
  });

  it("contributes the issue-list extractor as its post-processor when JIRA_SITE_URL is set", () => {
    const c = jiraPlugin.build!({ model: MODEL, env: { JIRA_SITE_URL: "https://example.atlassian.net" }, log: noLog });
    expect(typeof c.postProcess).toBe("function");
    const searched = c.postProcess!(
      { binary: "jira", args: ["issue", "search"], prefix: ["issue", "search"] },
      { ok: true, data: { issues: [] } },
    );
    expect(searched).toEqual({ ok: true, data: { issues: [], issueCount: 0 }, display: { type: "issue-list", items: [] } });
  });

  // #114: without JIRA_SITE_URL the plugin loaded with no post-processor, so
  // the model lost issueCount. A Jira instance has a Jira site: the variable
  // is required, and the loader reports the throw as "failed to load, skipped".
  it("refuses to build without JIRA_SITE_URL, or with it empty, naming the variable", () => {
    for (const env of [{}, { JIRA_SITE_URL: "" }]) {
      expect(() => jiraPlugin.build!({ model: MODEL, env, log: noLog })).toThrow(/JIRA_SITE_URL is not set/);
    }
  });
});
