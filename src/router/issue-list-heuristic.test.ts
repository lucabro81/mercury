import { describe, it, expect } from "bun:test";
import { looksLikeIssueList } from "./issue-list-heuristic.ts";

describe("looksLikeIssueList", () => {
  it("returns false for plain prose with no markers", () => {
    expect(looksLikeIssueList("Here's a short answer with no list at all.")).toBe(false);
  });

  it("returns false for a single bulleted line mentioning a ticket (below the threshold)", () => {
    expect(looksLikeIssueList("- MER-1 is the only one still open.")).toBe(false);
  });

  it("returns true for two dash-bulleted lines with issue keys", () => {
    expect(looksLikeIssueList("- MER-1 Fix the bug\n- MER-2 Add the feature")).toBe(true);
  });

  it("returns true for two asterisk-bulleted lines with issue keys", () => {
    expect(looksLikeIssueList("* MER-1 Fix the bug\n* MER-2 Add the feature")).toBe(true);
  });

  it("returns true for two bullet-char (•) lines with issue keys", () => {
    expect(looksLikeIssueList("• MER-1 Fix the bug\n• MER-2 Add the feature")).toBe(true);
  });

  it("returns true for two numbered-dot lines with issue keys", () => {
    expect(looksLikeIssueList("1. MER-1 Fix the bug\n2. MER-2 Add the feature")).toBe(true);
  });

  it("returns true for two numbered-paren lines with issue keys", () => {
    expect(looksLikeIssueList("1) MER-1 Fix the bug\n2) MER-2 Add the feature")).toBe(true);
  });

  it("returns false when bullets are present but no line contains a key-shaped token", () => {
    expect(looksLikeIssueList("- buy milk\n- buy eggs")).toBe(false);
  });

  it("returns false for a ticket key mentioned inline in prose with no leading marker", () => {
    expect(looksLikeIssueList("I found MER-1 and MER-2 today, both look related.")).toBe(false);
  });

  it("returns false for a lowercase key after a bullet", () => {
    expect(looksLikeIssueList("- mer-1 fix the bug\n- mer-2 add the feature")).toBe(false);
  });

  it("returns true for indented bullet lines", () => {
    expect(looksLikeIssueList("  - MER-1 Fix the bug\n  - MER-2 Add the feature")).toBe(true);
  });

  it("returns true for multi-digit issue numbers", () => {
    expect(looksLikeIssueList("- PROJ-12345 Fix the bug\n- PROJ-12346 Add the feature")).toBe(true);
  });

  it("returns true when only some list items reference a ticket, as long as at least two do", () => {
    expect(
      looksLikeIssueList("- MER-1 Fix the bug\n- Some unrelated note\n- MER-2 Add the feature"),
    ).toBe(true);
  });

  // Regression: the deterministic formattedList (issue-list-formatter.ts's formatOneIssue) never
  // emits a leading bullet/number marker before the key — this heuristic must never flag it, only
  // the model's own free-form rendition of a list.
  it("returns false for text in formattedList's own real shape (no leading marker)", () => {
    const formattedList =
      "MER-1 [To Do] Fix the bug\nhttps://webcomperio.atlassian.net/browse/MER-1\n\n" +
      "MER-2 [Done] Add the feature\nhttps://webcomperio.atlassian.net/browse/MER-2";
    expect(looksLikeIssueList(formattedList)).toBe(false);
  });

  // Regression: a shared module-level `g`-flagged regex used with .test()/.exec() carries lastIndex
  // state across calls — production calls this function twice per turn (original text, then the
  // corrector's output), so a stateful implementation would silently misbehave on the second call.
  it("returns independently correct results across consecutive calls with different inputs", () => {
    const flagged = "- MER-1 Fix the bug\n- MER-2 Add the feature";
    const notFlagged = "Everything looks fine.";
    expect(looksLikeIssueList(flagged)).toBe(true);
    expect(looksLikeIssueList(notFlagged)).toBe(false);
    expect(looksLikeIssueList(flagged)).toBe(true);
  });
});
