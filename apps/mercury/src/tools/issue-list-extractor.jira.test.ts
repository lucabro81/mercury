import { describe, it, expect } from "bun:test";
import { createJiraIssueListExtractor } from "@mercury/plugin-jira";
import type { CliResult } from "./cli-executor.ts";

/**
 * Integration-shaped test of the real `@mercury/plugin-jira` issue-list
 * extractor. It emits **structured records** on the user-facing `display`
 * channel — one `{ key, status, summary, url }` per issue, never a rendered
 * string; turning those into text is the composition render handler's job (see
 * `plugins/jira-issue-list-handler.test.ts`), and the byte-for-byte end-to-end
 * list is guarded by `jira-behavior.test.ts`. These assertions cover extraction
 * and its defensive shape handling, plus the plugin-owned config schema.
 */
const SITE_URL = "https://webcomperio.atlassian.net";
const PARSED = { binary: "jira", args: ["issue", "search"] };

describe("createJiraIssueListExtractor", () => {
  const extract = createJiraIssueListExtractor({ siteUrl: SITE_URL });

  it("passes a failed result through unchanged", () => {
    const result: CliResult = { ok: false, error: "jira exited with code 1: boom" };
    expect(extract(PARSED, result)).toEqual(result);
  });

  it("passes a result through unchanged when data isn't even a plain object (nothing safe to attach a note to)", () => {
    const result: CliResult = { ok: true, data: "some --help text" };
    expect(extract(PARSED, result)).toEqual(result);
  });

  // Regression: observed live — the model tried `--select formattedList`,
  // reasoning (from the system prompt alone) that formattedList must be a
  // real path in jira's own JSON. It isn't: jira evaluates --select on its
  // own raw output, before this post-processor ever runs, so that path
  // matches nothing and jira returns a bare `{}`. Previously this passed
  // through in total silence — the model got no signal at all and burned
  // two retries on the exact same broken guess before giving up.
  it("adds a formattedListNote (not silence) for a plain object with no issues array at all, e.g. --select finding nothing", () => {
    const result: CliResult = { ok: true, data: {} };
    const extracted = extract(PARSED, result);
    expect(extracted.ok).toBe(true);
    if (extracted.ok) {
      const data = extracted.data as { formattedListNote: string };
      expect(data.formattedListNote).toContain("--select");
      expect(data.formattedListNote.toLowerCase()).toContain("formattedlist");
      expect(extracted.display).toBeUndefined();
    }
  });

  it("explains in the note that formattedList/formattedListNote can never be reached via --select", () => {
    const result: CliResult = { ok: true, data: {} };
    const extracted = extract(PARSED, result);
    expect(extracted.ok).toBe(true);
    if (extracted.ok) {
      expect((extracted.data as { formattedListNote: string }).formattedListNote).toContain("--select formattedList");
    }
  });

  // Not a hard error like the missing-summary case below — the raw data is
  // still valid and returned untouched, just with a note explaining why no
  // list could be built, so the model can retry if it turns out the user
  // actually wanted a rendered list.
  it("adds a formattedListNote, without erroring, when issues are missing key (e.g. reshaped by --select)", () => {
    // Real shape confirmed live: `--select issues.fields.summary,issues.fields.status.name`
    // prunes "key" off each issue entirely, still under the issues[] wrapper.
    const original = { issues: [{ fields: { summary: "Ticket di test", status: { name: "Da fare" } } }] };
    const result: CliResult = { ok: true, data: original };

    const extracted = extract(PARSED, result);

    expect(extracted.ok).toBe(true);
    if (extracted.ok) {
      expect(extracted.data).toMatchObject(original);
      expect((extracted.data as { formattedListNote: string }).formattedListNote).toContain("--select");
      expect(extracted.display).toBeUndefined();
    }
  });

  it("adds a formattedListNote when issues array elements aren't objects at all", () => {
    const result: CliResult = { ok: true, data: { issues: ["not an issue object"] } };
    const extracted = extract(PARSED, result);
    expect(extracted.ok).toBe(true);
    if (extracted.ok) {
      expect((extracted.data as { formattedListNote: string }).formattedListNote).toBeTruthy();
      expect(extracted.display).toBeUndefined();
    }
  });

  it("emits an empty issue-list display for an empty issues array, without erroring", () => {
    const result: CliResult = { ok: true, data: { issues: [] } };
    expect(extract(PARSED, result)).toEqual({ ok: true, data: { issues: [] }, display: { type: "issue-list", items: [] } });
  });

  it("returns a self-correctable error when an issue is missing summary", () => {
    const result: CliResult = {
      ok: true,
      data: { issues: [{ key: "MER-20", fields: { status: { name: "Da fare" } } }] },
    };
    const extracted = extract(PARSED, result);
    expect(extracted.ok).toBe(false);
    if (!extracted.ok) {
      expect(extracted.error).toContain("summary");
      expect(extracted.error).toContain("--fields");
    }
  });

  it("emits a structured record with status and a browse link built from siteUrl + key", () => {
    const issues = [
      { key: "MER-20", fields: { summary: "Ticket di test creato da Mercury", status: { name: "Da fare" } } },
    ];
    const result: CliResult = { ok: true, data: { issues } };
    const extracted = extract(PARSED, result);
    expect(extracted).toEqual({
      ok: true,
      data: { issues },
      display: {
        type: "issue-list",
        items: [
          {
            key: "MER-20",
            status: "Da fare",
            summary: "Ticket di test creato da Mercury",
            url: "https://webcomperio.atlassian.net/browse/MER-20",
          },
        ],
      },
    });
  });

  it("emits status: null when status wasn't requested/present", () => {
    const result: CliResult = {
      ok: true,
      data: { issues: [{ key: "MER-20", fields: { summary: "Ticket di test" } }] },
    };
    const extracted = extract(PARSED, result);
    expect(extracted.ok).toBe(true);
    if (extracted.ok) {
      expect(extracted.display).toEqual({
        type: "issue-list",
        items: [{ key: "MER-20", status: null, summary: "Ticket di test", url: "https://webcomperio.atlassian.net/browse/MER-20" }],
      });
    }
  });

  it("emits one structured record per issue", () => {
    const result: CliResult = {
      ok: true,
      data: {
        issues: [
          { key: "MER-1", fields: { summary: "First" } },
          { key: "MER-2", fields: { summary: "Second" } },
        ],
      },
    };
    const extracted = extract(PARSED, result);
    expect(extracted.ok).toBe(true);
    if (extracted.ok) {
      expect(extracted.display).toEqual({
        type: "issue-list",
        items: [
          { key: "MER-1", status: null, summary: "First", url: "https://webcomperio.atlassian.net/browse/MER-1" },
          { key: "MER-2", status: null, summary: "Second", url: "https://webcomperio.atlassian.net/browse/MER-2" },
        ],
      });
    }
  });

  it("strips a trailing slash on siteUrl before building the link", () => {
    const withTrailingSlash = createJiraIssueListExtractor({ siteUrl: "https://webcomperio.atlassian.net/" });
    const result: CliResult = { ok: true, data: { issues: [{ key: "MER-1", fields: { summary: "x" } }] } };
    const extracted = withTrailingSlash(PARSED, result);
    expect(extracted.ok).toBe(true);
    if (extracted.ok) {
      expect(extracted.display).toEqual({
        type: "issue-list",
        items: [{ key: "MER-1", status: null, summary: "x", url: "https://webcomperio.atlassian.net/browse/MER-1" }],
      });
    }
  });

  it("preserves every original field on each issue in data — augments, never replaces", () => {
    const result: CliResult = {
      ok: true,
      data: { issues: [{ key: "MER-1", fields: { summary: "x" }, self: "https://api.atlassian.com/..." }] },
    };
    const extracted = extract(PARSED, result);
    expect(extracted.ok).toBe(true);
    if (extracted.ok) {
      const data = extracted.data as { issues: Array<{ self: string }> };
      expect(data.issues[0]?.self).toBe("https://api.atlassian.com/...");
    }
  });
});
