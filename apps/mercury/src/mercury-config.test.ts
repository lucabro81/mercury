/**
 * Regression over this instance's composition: `mercury.config.ts` must declare
 * the plugin and channel set Comperio's Mercury composes — the pin on which
 * plugins load and in what order. It lives with the app, not with `@mercury-fw/core`:
 * the core is agnostic to which plugins any instance wires; this asserts the
 * concrete choice of *this* instance.
 */
import { describe, expect, test } from "bun:test";
import mercuryConfig from "../mercury.config.ts";

describe("mercury.config.ts", () => {
  test("declares this instance's tool plugin set, in order", () => {
    expect(mercuryConfig.plugins.map((p) => p.name)).toEqual(["jira", "bitbucket", "atlassian-admin"]);
  });

  test("declares this instance's channel plugin set", () => {
    expect((mercuryConfig.channels ?? []).map((c) => c.name)).toEqual(["google-chat", "http"]);
  });
});

/**
 * How this instance shows a Jira search to the user: the whole chain as it runs
 * — the Jira plugin's extractor over a raw `issue search` result, then this
 * config's formatter rule — so the rendered text is pinned byte for byte.
 */
describe("mercury.config.ts — Jira issue lists", () => {
  const SITE = "https://webcomperio.atlassian.net";
  const jira = mercuryConfig.plugins.find((p) => p.name === "jira")!;
  const logs: string[] = [];
  const postProcess = jira.build!({ model: {} as never, env: { JIRA_SITE_URL: SITE }, log: (m) => logs.push(m) }).postProcess!;
  const search = { binary: "jira", args: ["issue", "search", "--jql", "x"], prefix: ["issue", "search"] };

  type RawIssue = { key: string; fields: { summary: string; status?: { name: string } } };
  const issue = (key: string, summary: string, status?: string): RawIssue => ({
    key,
    fields: status === undefined ? { summary } : { summary, status: { name: status } },
  });
  /** What the user is shown for a search returning `issues`. */
  const shown = (issues: RawIssue[]) => {
    const result = postProcess(search, { ok: true, data: { issues } });
    return result.ok ? result.display?.items : undefined;
  };

  test("renders one issue as key, bracketed status, summary, then its browse link", () => {
    expect(shown([issue("MER-1", "Titolo", "Da fare")])).toEqual([`MER-1 [Da fare] Titolo\n${SITE}/browse/MER-1`]);
  });

  test("omits the status bracket entirely when the issue carries no status", () => {
    expect(shown([issue("MER-1", "Titolo")])).toEqual([`MER-1 Titolo\n${SITE}/browse/MER-1`]);
  });

  test("separates issues with a blank line, as one block", () => {
    expect(shown([issue("MER-1", "First"), issue("MER-2", "Second", "Done")])).toEqual([
      `MER-1 First\n${SITE}/browse/MER-1\n\nMER-2 [Done] Second\n${SITE}/browse/MER-2`,
    ]);
  });

  test("shows a sentence, not an empty block, when the search matches nothing", () => {
    expect(shown([])).toEqual(["No matching issues."]);
  });

  test("leaves every other Jira command's result alone", () => {
    const raw = { ok: true as const, data: { issues: [issue("MER-1", "Titolo")] } };
    expect(postProcess({ binary: "jira", args: ["issue", "get", "MER-1"], prefix: ["issue", "get"] }, raw)).toEqual(raw);
  });

  test("has a rule for every kind of list the Jira plugin emits — nothing logged as unrendered", () => {
    expect(logs).toEqual([]);
  });
});
