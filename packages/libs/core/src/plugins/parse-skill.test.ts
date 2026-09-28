import { describe, it, expect } from "bun:test";
import { parseSkill } from "@mercury/plugin-types";

/**
 * `parseSkill` reads the Anthropic Agent Skills `SKILL.md` shape — YAML-ish
 * frontmatter with `name` and `description`, then the markdown body — into the
 * `Skill` the plugin contract carries. Deliberately a tiny hand-rolled parser
 * (no yaml dependency) so `@mercury/plugin-types` stays dependency-free: only
 * `name` and `description` are read from the frontmatter, everything after the
 * closing fence is the body verbatim.
 */
const SKILL = `---
name: jira
description: How to query and act on Jira issues via runCommand.
---

You have access to runCommand for Jira.

DO:
- Use --jql for searches.
`;

describe("parseSkill", () => {
  it("extracts name and description from the frontmatter and keeps the body verbatim", () => {
    const skill = parseSkill(SKILL);
    expect(skill.name).toBe("jira");
    expect(skill.description).toBe("How to query and act on Jira issues via runCommand.");
    expect(skill.body).toBe("You have access to runCommand for Jira.\n\nDO:\n- Use --jql for searches.");
  });

  it("keeps a colon inside the description value (splits only on the first ': ')", () => {
    const skill = parseSkill("---\nname: x\ndescription: How to: search issues\n---\nbody\n");
    expect(skill.description).toBe("How to: search issues");
  });

  it("ignores unknown frontmatter keys", () => {
    const skill = parseSkill("---\nname: x\ndescription: d\nversion: 3\n---\nbody\n");
    expect(skill.name).toBe("x");
    expect(skill.description).toBe("d");
    expect(skill.body).toBe("body");
  });

  it("throws when the frontmatter is missing", () => {
    expect(() => parseSkill("no frontmatter here")).toThrow();
  });

  it("throws when name or description is missing", () => {
    expect(() => parseSkill("---\nname: x\n---\nbody")).toThrow();
    expect(() => parseSkill("---\ndescription: d\n---\nbody")).toThrow();
  });
});
