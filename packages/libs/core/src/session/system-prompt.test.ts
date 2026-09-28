import { describe, it, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { buildSystemPrompt } from "./system-prompt.ts";
import { jiraPlugin } from "@mercury/plugin-jira";
import type { Skill } from "@mercury/plugin-types";

/**
 * Golden snapshot of the composed system prompt. Jira now contributes a skill,
 * not an always-on fragment, so the "with jira" prompt carries only the skill's
 * one-line descriptor (its body loads on demand via read_skill), not the full
 * DO/DON'T block that used to sit inline here. The "no skills" fixtures are the
 * same jira-disabled prompt as before — an empty skills list adds no section.
 * A stray space, a reordered line, or a lost newline fails here rather than
 * silently shifting the model's instructions.
 */
const golden = (name: string): string =>
  readFileSync(new URL(`./__fixtures__/system-prompt/${name}`, import.meta.url), "utf-8");

const jiraSkills: Skill[] = jiraPlugin.skills ?? [];

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
