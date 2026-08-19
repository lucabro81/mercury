import { describe, it, expect } from "bun:test";
import { createReadSkillTool } from "./read-skill-tool.ts";
import type { Skill } from "@mercury/plugin-types";

/**
 * The read_skill tool is the "load" half of SKILL.md: given a skill name from
 * the prompt's descriptor list, it returns that skill's full body for the model
 * to act on. An unknown name comes back as a self-correctable error naming what
 * is available, not a throw.
 */
const skills: Skill[] = [
  { name: "jira", description: "d1", body: "JIRA BODY" },
  { name: "bitbucket", description: "d2", body: "BB BODY" },
];

type ExecutableTool = { execute: (input: unknown, options: { toolCallId: string }) => Promise<unknown> };
const run = (tools: Record<string, unknown>, input: unknown) =>
  (tools.read_skill as ExecutableTool).execute(input, { toolCallId: "t" });

describe("createReadSkillTool", () => {
  it("returns the requested skill's body", async () => {
    expect(await run(createReadSkillTool(skills), { name: "jira" })).toEqual({ ok: true, data: "JIRA BODY" });
    expect(await run(createReadSkillTool(skills), { name: "bitbucket" })).toEqual({ ok: true, data: "BB BODY" });
  });

  it("returns a self-correctable error naming the available skills for an unknown name", async () => {
    const result = (await run(createReadSkillTool(skills), { name: "nope" })) as { ok: boolean; error: string };
    expect(result.ok).toBe(false);
    expect(result.error).toContain("nope");
    expect(result.error).toContain("jira");
    expect(result.error).toContain("bitbucket");
  });
});
