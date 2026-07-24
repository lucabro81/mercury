import { describe, it, expect } from "bun:test";
import { describeToolStart, withToolStartHook } from "./tool-start-hook.ts";
import type { CliConfig } from "../tools/cli-tool.ts";
import type { Tool } from "ai";

const configs: Record<string, CliConfig> = {
  jira: {
    allowedPrefixes: [
      { prefix: ["issue", "search"], confirm: false, mutating: false },
      { prefix: ["issue", "create"], confirm: false, mutating: true },
      { prefix: ["issue", "delete"], confirm: true, mutating: true },
    ],
  },
};

describe("describeToolStart", () => {
  it("labels a non-mutating runCommand invocation as reading, naming the binary", () => {
    expect(describeToolStart("runCommand", { command: "jira issue search --jql X" }, configs)).toBe(
      "Sto leggendo dati con jira…",
    );
  });

  it("labels a mutating runCommand invocation as writing, naming the binary", () => {
    expect(describeToolStart("runCommand", { command: "jira issue create --summary X" }, configs)).toBe(
      "Sto scrivendo dati con jira…",
    );
  });

  it("labels a confirm-required (still mutating) command as writing too", () => {
    expect(describeToolStart("runCommand", { command: "jira issue delete KAN-1" }, configs)).toBe(
      "Sto scrivendo dati con jira…",
    );
  });

  it("falls back to naming just the binary when it isn't configured on this instance", () => {
    expect(describeToolStart("runCommand", { command: "bitbucket pr list" }, configs)).toBe(
      "Sto usando bitbucket…",
    );
  });

  it("falls back to naming just the binary when the command doesn't match any allowed prefix", () => {
    expect(describeToolStart("runCommand", { command: "jira project delete" }, configs)).toBe(
      "Sto usando jira…",
    );
  });

  it("falls back to a generic label when the command string doesn't parse", () => {
    expect(describeToolStart("runCommand", { command: 'jira issue search --jql "unterminated' }, configs)).toBe(
      "Sto eseguendo un comando…",
    );
  });

  it("falls back to a generic label when the input has no command field at all", () => {
    expect(describeToolStart("runCommand", {}, configs)).toBe("Sto eseguendo un comando…");
  });

  it("labels recall_tool_calls as consulting memory", () => {
    expect(describeToolStart("recall_tool_calls", {}, configs)).toBe("Sto consultando la memoria…");
  });

  it("labels the wiki read tools as reading the wiki", () => {
    expect(describeToolStart("read_file", { path: "x" }, configs)).toBe("Sto leggendo il wiki…");
    expect(describeToolStart("list_files", {}, configs)).toBe("Sto leggendo il wiki…");
    expect(describeToolStart("grep", { pattern: "x" }, configs)).toBe("Sto leggendo il wiki…");
  });

  it("labels write_file as writing to the wiki", () => {
    expect(describeToolStart("write_file", { path: "x", content: "y" }, configs)).toBe(
      "Sto scrivendo sul wiki…",
    );
  });

  it("falls back to the raw tool name for an unmapped/future tool", () => {
    expect(describeToolStart("some_future_tool", {}, configs)).toBe("Sto usando some_future_tool…");
  });
});

describe("withToolStartHook", () => {
  function fakeTool(executeImpl: (input: unknown) => Promise<unknown>): Tool {
    return { execute: executeImpl } as unknown as Tool;
  }

  it("calls onToolStart exactly once with the right label before execute runs", async () => {
    const calls: string[] = [];
    const tools: Record<string, Tool> = {
      read_file: fakeTool(async () => "file contents"),
    };

    const wrapped = withToolStartHook(tools, (label) => calls.push(label), {});
    const result = await (wrapped.read_file as unknown as { execute: (i: unknown) => Promise<unknown> }).execute({});

    expect(calls).toEqual(["Sto leggendo il wiki…"]);
    expect(result).toBe("file contents");
  });

  it("propagates a thrown error after still notifying onToolStart", async () => {
    const calls: string[] = [];
    const tools: Record<string, Tool> = {
      write_file: fakeTool(async () => {
        throw new Error("disk full");
      }),
    };

    const wrapped = withToolStartHook(tools, (label) => calls.push(label), {});
    const execute = (wrapped.write_file as unknown as { execute: (i: unknown) => Promise<unknown> }).execute;

    await expect(execute({})).rejects.toThrow("disk full");
    expect(calls).toEqual(["Sto scrivendo sul wiki…"]);
  });

  it("reports each tool's own label when several tools are wrapped together", async () => {
    const calls: string[] = [];
    const tools: Record<string, Tool> = {
      read_file: fakeTool(async () => "a"),
      write_file: fakeTool(async () => "b"),
      recall_tool_calls: fakeTool(async () => "c"),
    };

    const wrapped = withToolStartHook(tools, (label) => calls.push(label), {});
    for (const name of ["read_file", "write_file", "recall_tool_calls"] as const) {
      await (wrapped[name] as unknown as { execute: (i: unknown) => Promise<unknown> }).execute({});
    }

    expect(calls).toEqual(["Sto leggendo il wiki…", "Sto scrivendo sul wiki…", "Sto consultando la memoria…"]);
  });
});
