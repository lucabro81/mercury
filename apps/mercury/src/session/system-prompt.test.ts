import { describe, it, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { buildSystemPrompt } from "./system-prompt.ts";
import { systemPromptFragment as jiraFragment } from "@mercury/plugin-jira";

/**
 * Invariance oracle for the system prompt across the Jira extraction (step
 * 2.2). The Jira block used to live inline here behind `if (opts.jira)`; it
 * now lives in `@mercury/plugin-jira` as a fragment, and `buildSystemPrompt`
 * composes whatever fragments the loaded plugins contribute. These fixtures
 * were captured from the pre-extraction code, so composing the plugin's
 * fragment must reproduce the old prompt byte-for-byte — a stray space, a
 * reordered line, or a lost newline during the move fails here rather than
 * silently shifting the model's instructions.
 */
const golden = (name: string): string =>
  readFileSync(new URL(`./__fixtures__/system-prompt/${name}`, import.meta.url), "utf-8");

describe("buildSystemPrompt", () => {
  it("with the jira fragment, reproduces the old jira-enabled prompt (single-user)", () => {
    expect(buildSystemPrompt({ pluginFragments: [jiraFragment], multiUserChannel: false })).toBe(
      golden("jira-on.mu-off.txt"),
    );
  });

  it("with the jira fragment, reproduces the old jira-enabled prompt (multi-user)", () => {
    expect(buildSystemPrompt({ pluginFragments: [jiraFragment], multiUserChannel: true })).toBe(
      golden("jira-on.mu-on.txt"),
    );
  });

  it("with no fragments, reproduces the old jira-disabled prompt (single-user)", () => {
    expect(buildSystemPrompt({ pluginFragments: [], multiUserChannel: false })).toBe(
      golden("jira-off.mu-off.txt"),
    );
  });

  it("with no fragments, reproduces the old jira-disabled prompt (multi-user)", () => {
    expect(buildSystemPrompt({ pluginFragments: [], multiUserChannel: true })).toBe(
      golden("jira-off.mu-on.txt"),
    );
  });
});
