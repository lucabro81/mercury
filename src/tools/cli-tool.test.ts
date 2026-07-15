import { describe, it, expect } from "bun:test";
import {
  stripGlobalFlags,
  matchCommand,
  formatPrefixes,
  createCliTool,
  type CliConfig,
} from "./cli-tool.ts";
import type { CliResult } from "./cli-executor.ts";

describe("stripGlobalFlags", () => {
  it("removes a value-taking flag and its value from anywhere in args", () => {
    expect(
      stripGlobalFlags(["--select", "id", "issue", "search"], [{ flag: "--select", takesValue: true }]),
    ).toEqual(["issue", "search"]);
  });

  it("removes a valueless flag without consuming the next token", () => {
    expect(stripGlobalFlags(["--verbose", "issue", "search"], [{ flag: "--verbose", takesValue: false }])).toEqual([
      "issue",
      "search",
    ]);
  });

  it("leaves args untouched when no global flags are configured", () => {
    expect(stripGlobalFlags(["--select", "id", "issue", "search"], [])).toEqual([
      "--select",
      "id",
      "issue",
      "search",
    ]);
  });

  it("handles the flag appearing multiple times", () => {
    expect(
      stripGlobalFlags(
        ["--select", "a", "issue", "--select", "b", "search"],
        [{ flag: "--select", takesValue: true }],
      ),
    ).toEqual(["issue", "search"]);
  });
});

describe("matchCommand", () => {
  const config: CliConfig = {
    allowedPrefixes: [
      { prefix: ["issue", "search"], confirm: false },
      { prefix: ["issue", "get"], confirm: false },
      { prefix: ["doctor"], confirm: false },
      { prefix: ["issue", "delete"], confirm: true },
    ],
  };

  it("returns allowed for args matching a confirm:false prefix", () => {
    expect(matchCommand(["issue", "search", "--jql", "project=KAN"], config)).toEqual({ kind: "allowed" });
    expect(matchCommand(["doctor"], config)).toEqual({ kind: "allowed" });
  });

  it("returns confirm-required for args matching a confirm:true prefix", () => {
    expect(matchCommand(["issue", "delete", "KAN-1"], config)).toEqual({
      kind: "confirm-required",
      prefix: ["issue", "delete"],
    });
  });

  it("returns not-allowed for args matching no configured prefix", () => {
    expect(matchCommand(["issue", "create", "--project", "KAN"], config)).toEqual({ kind: "not-allowed" });
  });

  it("always allows --help, even for an otherwise-disallowed shape", () => {
    expect(matchCommand(["issue", "create", "--help"], config)).toEqual({ kind: "allowed" });
    expect(matchCommand(["--help"], config)).toEqual({ kind: "allowed" });
  });

  it("applies a config's globalFlags before matching prefixes", () => {
    const withFlags: CliConfig = {
      allowedPrefixes: [{ prefix: ["issue", "search"], confirm: false }],
      globalFlags: [{ flag: "--select", takesValue: true }],
    };
    expect(matchCommand(["--select", "id", "issue", "search"], withFlags)).toEqual({ kind: "allowed" });
    expect(matchCommand(["--select", "id", "issue", "delete"], withFlags)).toEqual({ kind: "not-allowed" });
  });

  it("uses args as-is when a config has no globalFlags", () => {
    expect(matchCommand(["--select", "id", "issue", "search"], config)).toEqual({ kind: "not-allowed" });
  });

  // Proves the allowlist logic is genuinely generic across CLIs, not just
  // "jira with extra steps" — two configs with unrelated prefix sets must
  // each only allow their own shapes.
  it("evaluates independently per config, proving the logic generalizes across CLIs", () => {
    const jiraLike: CliConfig = { allowedPrefixes: [{ prefix: ["issue", "search"], confirm: false }] };
    const chatLike: CliConfig = { allowedPrefixes: [{ prefix: ["spaces", "list"], confirm: false }] };

    expect(matchCommand(["issue", "search"], jiraLike)).toEqual({ kind: "allowed" });
    expect(matchCommand(["spaces", "list"], jiraLike)).toEqual({ kind: "not-allowed" });

    expect(matchCommand(["spaces", "list"], chatLike)).toEqual({ kind: "allowed" });
    expect(matchCommand(["issue", "search"], chatLike)).toEqual({ kind: "not-allowed" });
  });
});

describe("formatPrefixes", () => {
  it("joins each prefix's parts with a space, and prefixes with a comma", () => {
    expect(
      formatPrefixes([
        ["issue", "search"],
        ["issue", "get"],
        ["doctor"],
      ]),
    ).toBe("issue search, issue get, doctor");
  });

  it("returns an empty string for an empty prefix list", () => {
    expect(formatPrefixes([])).toBe("");
  });
});

describe("createCliTool", () => {
  const jiraConfig: CliConfig = {
    allowedPrefixes: [
      { prefix: ["issue", "search"], confirm: false },
      { prefix: ["issue", "get"], confirm: false },
      { prefix: ["doctor"], confirm: false },
      { prefix: ["issue", "delete"], confirm: true },
    ],
  };

  it("execute parses the command and calls runCliFn with the exact binary and args for an allowed command", async () => {
    let receivedBinary: string | undefined;
    let receivedArgs: string[] | undefined;
    const fakeResult: CliResult = { ok: true, data: { issues: [] } };
    const runCliFn = async (binary: string, args: string[]) => {
      receivedBinary = binary;
      receivedArgs = args;
      return fakeResult;
    };

    const { runCommand } = createCliTool(runCliFn, { jira: jiraConfig });
    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = await runCommand.execute(
      { command: 'jira issue search --jql "project = KAN"' },
      {} as never,
    );

    expect(receivedBinary).toBe("jira");
    expect(receivedArgs).toEqual(["issue", "search", "--jql", "project = KAN"]);
    expect(result).toEqual(fakeResult);
  });

  // Relocated originally from jira.test.ts's createJiraTool coverage: lists
  // the valid prefixes in the rejection error, to help a small model
  // self-correct in one step instead of needing a --help round trip.
  it("execute does not call runCliFn for a disallowed subcommand, and lists the valid prefixes", async () => {
    let called = false;
    const runCliFn = async (): Promise<CliResult> => {
      called = true;
      return { ok: true, data: {} };
    };

    const { runCommand } = createCliTool(runCliFn, { jira: jiraConfig });
    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = (await runCommand.execute(
      { command: "jira issue create --project KAN" },
      {} as never,
    )) as CliResult;

    expect(called).toBe(false);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("not permitted");
      expect(result.error).toContain("issue search");
      expect(result.error).toContain("issue get");
      expect(result.error).toContain("doctor");
    }
  });

  // The confirm-required rejection is distinct from "not permitted": the
  // shape IS recognized, it's just gated on a confirmation mechanism that
  // doesn't exist yet on this Mercury instance (M2).
  it("execute does not call runCliFn for a confirm-required command, and returns a distinct message", async () => {
    let called = false;
    const runCliFn = async (): Promise<CliResult> => {
      called = true;
      return { ok: true, data: {} };
    };

    const { runCommand } = createCliTool(runCliFn, { jira: jiraConfig });
    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = (await runCommand.execute(
      { command: "jira issue delete KAN-1" },
      {} as never,
    )) as CliResult;

    expect(called).toBe(false);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("requires confirmation");
      expect(result.error).not.toContain("not permitted");
    }
  });

  // The "not permitted" message must only advertise prefixes that will
  // actually run — otherwise the model would keep retrying a shape that's
  // recognized but always rejected for a different reason.
  it("excludes confirm-gated prefixes from the 'not permitted' message's valid-commands list", async () => {
    const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: {} });
    const { runCommand } = createCliTool(runCliFn, { jira: jiraConfig });
    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = (await runCommand.execute(
      { command: "jira issue create --project KAN" },
      {} as never,
    )) as CliResult;

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).not.toContain("issue delete");
    }
  });

  it("execute does not call runCliFn for a binary with no configured CliConfig, and lists what's available", async () => {
    let called = false;
    const runCliFn = async (): Promise<CliResult> => {
      called = true;
      return { ok: true, data: {} };
    };

    const { runCommand } = createCliTool(runCliFn, { jira: jiraConfig });
    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = (await runCommand.execute(
      { command: "bitbucket pr list" },
      {} as never,
    )) as CliResult;

    expect(called).toBe(false);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("bitbucket");
      expect(result.error).toContain("jira");
    }
  });

  it("execute does not call runCliFn for an unparseable command, and surfaces the parser's own error", async () => {
    let called = false;
    const runCliFn = async (): Promise<CliResult> => {
      called = true;
      return { ok: true, data: {} };
    };

    const { runCommand } = createCliTool(runCliFn, { jira: jiraConfig });
    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = (await runCommand.execute(
      { command: 'jira issue search --jql "project = KAN' },
      {} as never,
    )) as CliResult;

    expect(called).toBe(false);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("unterminated");
    }
  });

  it("execute propagates a runCliFn error result as-is, never throws", async () => {
    const runCliFn = async (): Promise<CliResult> => ({
      ok: false,
      error: "jira exited with code 1: boom",
    });

    const { runCommand } = createCliTool(runCliFn, { jira: jiraConfig });
    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = await runCommand.execute({ command: "jira issue get KAN-1" }, {} as never);

    expect(result).toEqual({ ok: false, error: "jira exited with code 1: boom" });
  });

  it("rejects an empty command at the schema level", () => {
    const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: {} });
    const { runCommand } = createCliTool(runCliFn, { jira: jiraConfig });
    const schema = runCommand.inputSchema as unknown as {
      safeParse: (v: unknown) => { success: boolean };
    };
    expect(schema.safeParse({ command: "" }).success).toBe(false);
    expect(schema.safeParse({ command: "jira doctor" }).success).toBe(true);
  });

  // Proves this isn't "jira with extra steps": a second, unrelated CliConfig
  // in the same map must route independently, on the same tool.
  it("routes correctly across multiple configured CLIs on the same tool", async () => {
    const calls: Array<{ binary: string; args: string[] }> = [];
    const runCliFn = async (binary: string, args: string[]): Promise<CliResult> => {
      calls.push({ binary, args });
      return { ok: true, data: {} };
    };
    const chatConfig: CliConfig = { allowedPrefixes: [{ prefix: ["spaces", "list"], confirm: false }] };

    const { runCommand } = createCliTool(runCliFn, { jira: jiraConfig, "google-chat": chatConfig });
    // @ts-expect-error - execute is guaranteed present for this tool definition
    await runCommand.execute({ command: "jira doctor" }, {} as never);
    // @ts-expect-error - execute is guaranteed present for this tool definition
    await runCommand.execute({ command: "google-chat spaces list" }, {} as never);

    expect(calls).toEqual([
      { binary: "jira", args: ["doctor"] },
      { binary: "google-chat", args: ["spaces", "list"] },
    ]);
  });
});
