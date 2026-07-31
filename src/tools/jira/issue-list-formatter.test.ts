import { describe, it, expect } from "bun:test";
import { createJiraIssueListFormatter } from "./issue-list-formatter.ts";
import type { CliResult } from "../cli-executor.ts";

const SITE_URL = "https://webcomperio.atlassian.net";
const PARSED = { binary: "jira", args: ["issue", "search"] };

describe("createJiraIssueListFormatter", () => {
  const format = createJiraIssueListFormatter(SITE_URL);

  it("passes a failed result through unchanged", () => {
    const result: CliResult = { ok: false, error: "jira exited with code 1: boom" };
    expect(format(PARSED, result)).toEqual(result);
  });

  it("passes a result through unchanged when data has no issues array (not this shape)", () => {
    const result: CliResult = { ok: true, data: "some --help text" };
    expect(format(PARSED, result)).toEqual(result);
  });

  it("passes a result through unchanged when issues array elements aren't issue-shaped", () => {
    const result: CliResult = { ok: true, data: { issues: ["not an issue object"] } };
    expect(format(PARSED, result)).toEqual(result);
  });

  it("adds a 'no matching issues' formattedList for an empty issues array, without erroring", () => {
    const result: CliResult = { ok: true, data: { issues: [] } };
    expect(format(PARSED, result)).toEqual({ ok: true, data: { issues: [], formattedList: "No matching issues." } });
  });

  it("returns a self-correctable error when an issue is missing summary", () => {
    const result: CliResult = {
      ok: true,
      data: { issues: [{ key: "MER-20", fields: { status: { name: "Da fare" } } }] },
    };
    const formatted = format(PARSED, result);
    expect(formatted.ok).toBe(false);
    if (!formatted.ok) {
      expect(formatted.error).toContain("summary");
      expect(formatted.error).toContain("--fields");
    }
  });

  it("builds a formattedList line with status and a browse link built from siteUrl + key", () => {
    const issues = [
      { key: "MER-20", fields: { summary: "Ticket di test creato da Mercury", status: { name: "Da fare" } } },
    ];
    const result: CliResult = { ok: true, data: { issues } };
    const formatted = format(PARSED, result);
    expect(formatted).toEqual({
      ok: true,
      data: {
        issues,
        formattedList: "MER-20 [Da fare] Ticket di test creato da Mercury\nhttps://webcomperio.atlassian.net/browse/MER-20",
      },
    });
  });

  it("omits the [status] bracket entirely when status wasn't requested/present", () => {
    const result: CliResult = {
      ok: true,
      data: { issues: [{ key: "MER-20", fields: { summary: "Ticket di test" } }] },
    };
    const formatted = format(PARSED, result);
    expect(formatted.ok).toBe(true);
    if (formatted.ok) {
      expect(formatted.data).toMatchObject({
        formattedList: "MER-20 Ticket di test\nhttps://webcomperio.atlassian.net/browse/MER-20",
      });
    }
  });

  it("joins multiple issues with a blank line between them", () => {
    const result: CliResult = {
      ok: true,
      data: {
        issues: [
          { key: "MER-1", fields: { summary: "First" } },
          { key: "MER-2", fields: { summary: "Second" } },
        ],
      },
    };
    const formatted = format(PARSED, result);
    expect(formatted.ok).toBe(true);
    if (formatted.ok) {
      expect(formatted.data).toMatchObject({
        formattedList:
          "MER-1 First\nhttps://webcomperio.atlassian.net/browse/MER-1\n\n" +
          "MER-2 Second\nhttps://webcomperio.atlassian.net/browse/MER-2",
      });
    }
  });

  it("strips a trailing slash on siteUrl before building the link", () => {
    const withTrailingSlash = createJiraIssueListFormatter("https://webcomperio.atlassian.net/");
    const result: CliResult = { ok: true, data: { issues: [{ key: "MER-1", fields: { summary: "x" } }] } };
    const formatted = withTrailingSlash(PARSED, result);
    expect(formatted.ok).toBe(true);
    if (formatted.ok) {
      expect(formatted.data).toMatchObject({
        formattedList: "MER-1 x\nhttps://webcomperio.atlassian.net/browse/MER-1",
      });
    }
  });

  it("preserves every original field on each issue — augments, never replaces", () => {
    const result: CliResult = {
      ok: true,
      data: { issues: [{ key: "MER-1", fields: { summary: "x" }, self: "https://api.atlassian.com/..." }] },
    };
    const formatted = format(PARSED, result);
    expect(formatted.ok).toBe(true);
    if (formatted.ok) {
      const data = formatted.data as { issues: Array<{ self: string }> };
      expect(data.issues[0]?.self).toBe("https://api.atlassian.com/...");
    }
  });
});
