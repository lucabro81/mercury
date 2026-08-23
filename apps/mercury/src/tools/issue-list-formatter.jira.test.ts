import { describe, it, expect } from "bun:test";
import { createJiraIssueListFormatter, issueListConfigSchema } from "@mercury/plugin-jira";
import type { CliResult } from "./cli-executor.ts";

/**
 * Integration-shaped test of the real `@mercury/plugin-jira` issue-list
 * formatter. The default-format assertions below characterise how the plugin
 * renders one issue into one `display.items` line when no itemTemplate is
 * configured. The formatter emits per-issue lines on the user-facing `display`
 * channel; joining those lines with a blank line between them is the core
 * renderer's job (see `format-list-splice.test.ts`), and the byte-for-byte
 * end-to-end string is guarded by `jira-behavior.test.ts`. The itemTemplate
 * and schema blocks cover the plugin-owned configuration.
 */
const SITE_URL = "https://webcomperio.atlassian.net";
const PARSED = { binary: "jira", args: ["issue", "search"] };

describe("createJiraIssueListFormatter (default format)", () => {
  const format = createJiraIssueListFormatter({ siteUrl: SITE_URL });

  it("passes a failed result through unchanged", () => {
    const result: CliResult = { ok: false, error: "jira exited with code 1: boom" };
    expect(format(PARSED, result)).toEqual(result);
  });

  it("passes a result through unchanged when data isn't even a plain object (nothing safe to attach a note to)", () => {
    const result: CliResult = { ok: true, data: "some --help text" };
    expect(format(PARSED, result)).toEqual(result);
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
    const formatted = format(PARSED, result);
    expect(formatted.ok).toBe(true);
    if (formatted.ok) {
      const data = formatted.data as { formattedListNote: string };
      expect(data.formattedListNote).toContain("--select");
      expect(data.formattedListNote.toLowerCase()).toContain("formattedlist");
    }
  });

  it("explains in the note that formattedList/formattedListNote can never be reached via --select", () => {
    const result: CliResult = { ok: true, data: {} };
    const formatted = format(PARSED, result);
    expect(formatted.ok).toBe(true);
    if (formatted.ok) {
      const data = formatted.data as { formattedListNote: string };
      expect(data.formattedListNote).toContain("--select formattedList");
    }
  });

  // Not a hard error like the missing-summary case below — the raw data is
  // still valid and returned untouched, just with a note explaining why no
  // formattedList could be built, so the model can retry if it turns out
  // the user actually wanted a rendered list.
  it("adds a formattedListNote, without erroring, when issues are missing key (e.g. reshaped by --select)", () => {
    // Real shape confirmed live: `--select issues.fields.summary,issues.fields.status.name`
    // prunes "key" off each issue entirely, still under the issues[] wrapper.
    const original = { issues: [{ fields: { summary: "Ticket di test", status: { name: "Da fare" } } }] };
    const result: CliResult = { ok: true, data: original };

    const formatted = format(PARSED, result);

    expect(formatted.ok).toBe(true);
    if (formatted.ok) {
      expect(formatted.data).toMatchObject(original);
      const data = formatted.data as { formattedListNote: string };
      expect(data.formattedListNote).toContain("--select");
      expect(formatted.display).toBeUndefined();
    }
  });

  it("adds a formattedListNote when issues array elements aren't objects at all", () => {
    const result: CliResult = { ok: true, data: { issues: ["not an issue object"] } };
    const formatted = format(PARSED, result);
    expect(formatted.ok).toBe(true);
    if (formatted.ok) {
      expect((formatted.data as { formattedListNote: string }).formattedListNote).toBeTruthy();
    }
  });

  it("emits an empty issue-list display for an empty issues array, without erroring", () => {
    const result: CliResult = { ok: true, data: { issues: [] } };
    expect(format(PARSED, result)).toEqual({ ok: true, data: { issues: [] }, display: { type: "issue-list", items: [] } });
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

  it("builds one display item with status and a browse link built from siteUrl + key", () => {
    const issues = [
      { key: "MER-20", fields: { summary: "Ticket di test creato da Mercury", status: { name: "Da fare" } } },
    ];
    const result: CliResult = { ok: true, data: { issues } };
    const formatted = format(PARSED, result);
    expect(formatted).toEqual({
      ok: true,
      data: { issues },
      display: {
        type: "issue-list",
        items: ["MER-20 [Da fare] Ticket di test creato da Mercury\nhttps://webcomperio.atlassian.net/browse/MER-20"],
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
      expect(formatted.display).toEqual({
        type: "issue-list",
        items: ["MER-20 Ticket di test\nhttps://webcomperio.atlassian.net/browse/MER-20"],
      });
    }
  });

  it("emits one display item per issue (the core renderer joins them)", () => {
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
      expect(formatted.display).toEqual({
        type: "issue-list",
        items: [
          "MER-1 First\nhttps://webcomperio.atlassian.net/browse/MER-1",
          "MER-2 Second\nhttps://webcomperio.atlassian.net/browse/MER-2",
        ],
      });
    }
  });

  it("strips a trailing slash on siteUrl before building the link", () => {
    const withTrailingSlash = createJiraIssueListFormatter({ siteUrl: "https://webcomperio.atlassian.net/" });
    const result: CliResult = { ok: true, data: { issues: [{ key: "MER-1", fields: { summary: "x" } }] } };
    const formatted = withTrailingSlash(PARSED, result);
    expect(formatted.ok).toBe(true);
    if (formatted.ok) {
      expect(formatted.display).toEqual({
        type: "issue-list",
        items: ["MER-1 x\nhttps://webcomperio.atlassian.net/browse/MER-1"],
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

describe("createJiraIssueListFormatter (itemTemplate override)", () => {
  it("renders each issue with the configured template, substituting key/status/summary/url", () => {
    const format = createJiraIssueListFormatter({
      siteUrl: SITE_URL,
      itemTemplate: "{key}: {summary} ({status}) — {url}",
    });
    const result: CliResult = {
      ok: true,
      data: { issues: [{ key: "MER-7", fields: { summary: "Titolo", status: { name: "In corso" } } }] },
    };
    const formatted = format(PARSED, result);
    expect(formatted.ok).toBe(true);
    if (formatted.ok) {
      expect(formatted.display).toEqual({
        type: "issue-list",
        items: ["MER-7: Titolo (In corso) — https://webcomperio.atlassian.net/browse/MER-7"],
      });
    }
  });

  it("substitutes {status} with an empty string when the issue has no status, leaving the rest of the template intact", () => {
    const format = createJiraIssueListFormatter({ siteUrl: SITE_URL, itemTemplate: "{key} [{status}] {summary}" });
    const result: CliResult = { ok: true, data: { issues: [{ key: "MER-7", fields: { summary: "Titolo" } }] } };
    const formatted = format(PARSED, result);
    expect(formatted.ok).toBe(true);
    if (formatted.ok) {
      expect(formatted.display).toEqual({ type: "issue-list", items: ["MER-7 [] Titolo"] });
    }
  });

  it("emits one templated item per issue (the core renderer joins them)", () => {
    const format = createJiraIssueListFormatter({ siteUrl: SITE_URL, itemTemplate: "{key} {summary}" });
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
      expect(formatted.display).toEqual({ type: "issue-list", items: ["MER-1 First", "MER-2 Second"] });
    }
  });
});

describe("issueListConfigSchema", () => {
  it("accepts a config with just siteUrl (itemTemplate is optional)", () => {
    expect(issueListConfigSchema.safeParse({ siteUrl: SITE_URL }).success).toBe(true);
  });

  it("accepts a config with siteUrl and itemTemplate", () => {
    expect(issueListConfigSchema.safeParse({ siteUrl: SITE_URL, itemTemplate: "{key} {summary}" }).success).toBe(true);
  });

  it("rejects a config missing siteUrl", () => {
    expect(issueListConfigSchema.safeParse({ itemTemplate: "{key}" }).success).toBe(false);
  });

  it("rejects an empty itemTemplate string", () => {
    expect(issueListConfigSchema.safeParse({ siteUrl: SITE_URL, itemTemplate: "" }).success).toBe(false);
  });

  it("rejects an unknown extra key (.strict)", () => {
    expect(issueListConfigSchema.safeParse({ siteUrl: SITE_URL, extra: true }).success).toBe(false);
  });
});
