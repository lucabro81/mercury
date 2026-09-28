import { describe, it, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { buildSystemPrompt } from "./system-prompt.ts";
import type { Skill } from "@mercury/plugin-types";

/**
 * Golden snapshot of the composed system prompt. A plugin's skill contributes
 * only its one-line descriptor (its body loads on demand via read_skill), so
 * the "with skill" prompt carries the descriptor and never the body. The "no
 * skills" fixtures show an empty skills list adds no section at all.
 * A stray space, a reordered line, or a lost newline fails here rather than
 * silently shifting the model's instructions.
 */
const golden = (name: string): string =>
  readFileSync(new URL(`./__fixtures__/system-prompt/${name}`, import.meta.url), "utf-8");

/** A fixture skill shaped like a real plugin's (the golden files were captured
 * with the Jira plugin's descriptor, reproduced verbatim here). The body is a
 * sentinel: if it ever reached the prompt, the golden comparison would fail. */
const jiraSkills: Skill[] = [
  {
    name: "jira",
    description:
      "Query and act on Jira issues via the jiraCommand tool — JQL searches, issue create/transition/comment, and the delete-confirmation contract. Load this before running any jira command.",
    body: "SKILL BODY — must never appear in the system prompt",
  },
];

describe("buildSystemPrompt", () => {
  it("lists a loaded plugin's skill descriptor, not its body (single-user)", () => {
    expect(buildSystemPrompt({ pluginFragments: [], skills: jiraSkills, multiUserChannel: false })).toBe(
      golden("jira-on.mu-off.txt"),
    );
  });

  it("lists a loaded plugin's skill descriptor, not its body (multi-user)", () => {
    expect(buildSystemPrompt({ pluginFragments: [], skills: jiraSkills, multiUserChannel: true })).toBe(
      golden("jira-on.mu-on.txt"),
    );
  });

  it("omits the skills section entirely when no plugin contributed one (single-user)", () => {
    expect(buildSystemPrompt({ pluginFragments: [], skills: [], multiUserChannel: false })).toBe(
      golden("jira-off.mu-off.txt"),
    );
  });

  it("omits the skills section entirely when no plugin contributed one (multi-user)", () => {
    expect(buildSystemPrompt({ pluginFragments: [], skills: [], multiUserChannel: true })).toBe(
      golden("jira-off.mu-on.txt"),
    );
  });
});
