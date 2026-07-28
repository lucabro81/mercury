import { describe, it, expect } from "bun:test";
import { describeToolStart, describeToolDetail, classifyToolResult, withToolStartHook } from "./tool-start-hook.ts";
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
  });

  it("labels grep as searching, not generically reading", () => {
    expect(describeToolStart("grep", { pattern: "x" }, configs)).toBe("Sto cercando…");
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

describe("classifyToolResult", () => {
  it("classifies ok:true as success", () => {
    expect(classifyToolResult({ ok: true, data: {} })).toBe("success");
  });

  it("classifies ok:false with pendingConfirmation:true as pending", () => {
    expect(classifyToolResult({ ok: false, pendingConfirmation: true, token: "t", error: "x" })).toBe("pending");
  });

  it("classifies ok:false without pendingConfirmation as failed", () => {
    expect(classifyToolResult({ ok: false, error: "x" })).toBe("failed");
  });

  it("defaults to success for a result with no recognizable ok field (nothing hits this today)", () => {
    expect(classifyToolResult("a string")).toBe("success");
    expect(classifyToolResult(undefined)).toBe("success");
    expect(classifyToolResult({})).toBe("success");
  });
});

describe("describeToolDetail", () => {
  it("returns the raw command for runCommand, with no markdown decoration (Chat cards don't render backticks)", () => {
    expect(describeToolDetail("runCommand", { command: "jira issue search --jql X" })).toBe(
      "jira issue search --jql X",
    );
  });

  it("falls back to a JSON dump of the input for runCommand with no command field", () => {
    expect(describeToolDetail("runCommand", {})).toBe("{}");
  });

  it("returns just the path for read_file/write_file, not the raw JSON input", () => {
    expect(describeToolDetail("read_file", { path: "curated/x.md" })).toBe("curated/x.md");
    expect(describeToolDetail("write_file", { path: "curated/x.md", content: "y" })).toBe("curated/x.md");
  });

  it("returns just the search pattern for grep", () => {
    expect(describeToolDetail("grep", { pattern: "jira.*cli" })).toBe("jira.*cli");
  });

  it("returns just the token for resolve_reference", () => {
    expect(describeToolDetail("resolve_reference", { token: "REQ-123" })).toBe("REQ-123");
  });

  it("returns a static description for list_files and recall_tool_calls (no path/pattern to show)", () => {
    expect(describeToolDetail("list_files", {})).toBe("Tutti i documenti del wiki");
    expect(describeToolDetail("recall_tool_calls", { limit: 5 })).toBe("Cronologia delle chiamate in questa conversazione");
  });

  it("falls back to a bounded JSON dump of the input for an unmapped/future tool", () => {
    expect(describeToolDetail("some_future_tool", { foo: "bar" })).toBe('{"foo":"bar"}');
  });

  it("truncates an oversized detail with an ellipsis", () => {
    const longCommand = `jira issue create --summary ${"x".repeat(300)}`;
    expect(describeToolDetail("runCommand", { command: longCommand })).toBe(`${longCommand.slice(0, 300)}…`);
  });
});

describe("withToolStartHook", () => {
  function fakeTool(executeImpl: (input: unknown, options: { toolCallId: string }) => Promise<unknown>): Tool {
    return { execute: executeImpl } as unknown as Tool;
  }
  type WrappedExecute = (input: unknown, options: { toolCallId: string }) => Promise<unknown>;
  function execOf(tools: Record<string, Tool>, name: string): WrappedExecute {
    return (tools[name] as unknown as { execute: WrappedExecute }).execute;
  }

  it("calls onToolStart exactly once with the right label before execute runs", async () => {
    const calls: string[] = [];
    const tools: Record<string, Tool> = {
      read_file: fakeTool(async () => "file contents"),
    };

    const wrapped = withToolStartHook(tools, (label) => calls.push(label), {});
    const result = await execOf(wrapped, "read_file")({}, { toolCallId: "tc-1" });

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
    const execute = execOf(wrapped, "write_file");

    await expect(execute({}, { toolCallId: "tc-1" })).rejects.toThrow("disk full");
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
      await execOf(wrapped, name)({}, { toolCallId: `tc-${name}` });
    }

    expect(calls).toEqual(["Sto leggendo il wiki…", "Sto scrivendo sul wiki…", "Sto consultando la memoria…"]);
  });

  it("calls onToolStart with the label, detail, and toolCallId for a real tool call", async () => {
    const calls: Array<[string, string | undefined, string | undefined]> = [];
    const tools: Record<string, Tool> = {
      runCommand: fakeTool(async () => ({ ok: true, data: {} })),
    };

    const wrapped = withToolStartHook(
      tools,
      (label, detail, toolCallId) => calls.push([label, detail, toolCallId]),
      configs,
    );
    await execOf(wrapped, "runCommand")({ command: "jira issue search --jql X" }, { toolCallId: "tc-1" });

    expect(calls).toEqual([["Sto leggendo dati con jira…", "jira issue search --jql X", "tc-1"]]);
  });

  it("calls onToolFinish with the classified outcome once execute resolves, after onToolStart", async () => {
    const events: string[] = [];
    const finishes: Array<[string, string]> = [];
    const tools: Record<string, Tool> = {
      runCommand: fakeTool(async () => {
        events.push("execute");
        return { ok: true, data: {} };
      }),
    };

    const wrapped = withToolStartHook(
      tools,
      () => events.push("start"),
      configs,
      (toolCallId, outcome) => {
        events.push("finish");
        finishes.push([toolCallId, outcome]);
      },
    );
    await execOf(wrapped, "runCommand")({ command: "jira issue search --jql X" }, { toolCallId: "tc-1" });

    expect(events).toEqual(["start", "execute", "finish"]);
    expect(finishes).toEqual([["tc-1", "success"]]);
  });

  it("calls onToolFinish with 'failed' when execute throws, then still rethrows", async () => {
    const finishes: Array<[string, string]> = [];
    const tools: Record<string, Tool> = {
      write_file: fakeTool(async () => {
        throw new Error("disk full");
      }),
    };

    const wrapped = withToolStartHook(tools, () => {}, configs, (toolCallId, outcome) =>
      finishes.push([toolCallId, outcome]),
    );

    await expect(execOf(wrapped, "write_file")({}, { toolCallId: "tc-2" })).rejects.toThrow("disk full");
    expect(finishes).toEqual([["tc-2", "failed"]]);
  });

  it("calls onToolFinish with 'pending' for a confirm-required-shaped result", async () => {
    const finishes: Array<[string, string]> = [];
    const tools: Record<string, Tool> = {
      runCommand: fakeTool(async () => ({ ok: false, pendingConfirmation: true, token: "t", error: "needs confirm" })),
    };

    const wrapped = withToolStartHook(tools, () => {}, configs, (toolCallId, outcome) =>
      finishes.push([toolCallId, outcome]),
    );
    await execOf(wrapped, "runCommand")({ command: "jira issue delete KAN-1" }, { toolCallId: "tc-3" });

    expect(finishes).toEqual([["tc-3", "pending"]]);
  });

  it("does not throw when no onToolFinish is supplied", async () => {
    const tools: Record<string, Tool> = { runCommand: fakeTool(async () => ({ ok: true, data: {} })) };
    const wrapped = withToolStartHook(tools, () => {}, configs);

    await expect(execOf(wrapped, "runCommand")({ command: "jira issue search --jql X" }, { toolCallId: "tc-1" })).resolves.toEqual(
      { ok: true, data: {} },
    );
  });

  it("serializes two tool calls fired back-to-back — the second's execute doesn't start until the first has settled", async () => {
    const events: string[] = [];
    let resolveFirst: (() => void) | undefined;
    const tools: Record<string, Tool> = {
      runCommand: fakeTool(async () => {
        events.push("execute-1");
        await new Promise<void>((resolve) => {
          resolveFirst = resolve;
        });
        return { ok: true, data: {} };
      }),
      recall_tool_calls: fakeTool(async () => {
        events.push("execute-2");
        return { ok: true, entries: [] };
      }),
    };

    const wrapped = withToolStartHook(
      tools,
      (label) => events.push(`start:${label}`),
      configs,
      (toolCallId) => events.push(`finish:${toolCallId}`),
    );

    const exec1 = execOf(wrapped, "runCommand")({ command: "jira issue search --jql X" }, { toolCallId: "tc-1" });
    const exec2 = execOf(wrapped, "recall_tool_calls")({}, { toolCallId: "tc-2" });

    // Give both calls a few microtask turns to (mis)fire if serialization were broken.
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(events).toEqual(["start:Sto leggendo dati con jira…", "execute-1"]);

    resolveFirst?.();
    await exec1;
    await exec2;

    expect(events).toEqual([
      "start:Sto leggendo dati con jira…",
      "execute-1",
      "finish:tc-1",
      "start:Sto consultando la memoria…",
      "execute-2",
      "finish:tc-2",
    ]);
  });
});
