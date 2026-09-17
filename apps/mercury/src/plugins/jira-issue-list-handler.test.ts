/**
 * Tests for the Jira issue-list render handler — the composition-supplied
 * function that turns the Jira extractor's structured items into the one
 * user-facing text block. It is the new home of the exact rendering that used
 * to live in the plugin (`formatOneIssue`): the conditional `[status]` bracket,
 * the `itemTemplate` override, the blank-line join, and the empty-set sentence.
 * These assertions pin that output byte-for-byte, since `jira-behavior.test.ts`
 * relies on it to keep the delivered list identical to before.
 */
import { describe, it, expect } from "bun:test";
import { createJiraIssueListHandler } from "./jira-issue-list-handler.ts";

const item = (over: Partial<{ key: string; status: string | null; summary: string; url: string }> = {}) => ({
  key: "MER-1",
  status: "Da fare" as string | null,
  summary: "Titolo",
  url: "https://webcomperio.atlassian.net/browse/MER-1",
  ...over,
});

describe("createJiraIssueListHandler (default format)", () => {
  const render = createJiraIssueListHandler({});

  it("renders one issue with the status bracket and browse link", () => {
    expect(render([item()])).toBe("MER-1 [Da fare] Titolo\nhttps://webcomperio.atlassian.net/browse/MER-1");
  });

  it("omits the [status] bracket entirely when status is null", () => {
    expect(render([item({ status: null })])).toBe("MER-1 Titolo\nhttps://webcomperio.atlassian.net/browse/MER-1");
  });

  it("joins multiple issues with a blank line between them", () => {
    const out = render([
      item({ key: "MER-1", status: null, summary: "First", url: "u1" }),
      item({ key: "MER-2", status: null, summary: "Second", url: "u2" }),
    ]);
    expect(out).toBe("MER-1 First\nu1\n\nMER-2 Second\nu2");
  });

  it("renders an empty set as the sentence, not an empty string", () => {
    expect(render([])).toBe("No matching issues.");
  });
});

describe("createJiraIssueListHandler (itemTemplate override)", () => {
  it("substitutes key/status/summary/url into the configured template", () => {
    const render = createJiraIssueListHandler({ itemTemplate: "{key}: {summary} ({status}) — {url}" });
    expect(render([item({ key: "MER-7", status: "In corso", summary: "Titolo", url: "u7" })])).toBe(
      "MER-7: Titolo (In corso) — u7",
    );
  });

  it("substitutes {status} with an empty string when status is null, leaving the template intact", () => {
    const render = createJiraIssueListHandler({ itemTemplate: "{key} [{status}] {summary}" });
    expect(render([item({ key: "MER-7", status: null, summary: "Titolo" })])).toBe("MER-7 [] Titolo");
  });

  it("joins templated issues with a blank line between them", () => {
    const render = createJiraIssueListHandler({ itemTemplate: "{key} {summary}" });
    const out = render([
      item({ key: "MER-1", summary: "First" }),
      item({ key: "MER-2", summary: "Second" }),
    ]);
    expect(out).toBe("MER-1 First\n\nMER-2 Second");
  });

  it("falls back to the default format when the template is an empty string (a deployment typo)", () => {
    const render = createJiraIssueListHandler({ itemTemplate: "" });
    expect(render([item({ status: null })])).toBe("MER-1 Titolo\nhttps://webcomperio.atlassian.net/browse/MER-1");
  });
});
