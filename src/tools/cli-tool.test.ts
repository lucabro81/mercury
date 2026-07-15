import { describe, it, expect } from "bun:test";
import { isPrefixAllowed, formatPrefixes, createCliTool, type CliConfig } from "./cli-tool.ts";
import type { CliResult } from "./cli-executor.ts";

describe("isPrefixAllowed", () => {
  const config: CliConfig = {
    readOnlyPrefixes: [
      ["issue", "search"],
      ["issue", "get"],
      ["doctor"],
    ],
  };

  it("allows args matching a read-only prefix", () => {
    expect(isPrefixAllowed(["issue", "search", "--jql", "project=KAN"], config)).toBe(true);
    expect(isPrefixAllowed(["doctor"], config)).toBe(true);
  });

  it("rejects args not matching any read-only prefix", () => {
    expect(isPrefixAllowed(["issue", "delete", "KAN-1", "--confirm"], config)).toBe(false);
    expect(isPrefixAllowed(["issue", "create", "--project", "KAN"], config)).toBe(false);
  });

  it("always allows --help, even for an otherwise-disallowed shape", () => {
    expect(isPrefixAllowed(["issue", "create", "--help"], config)).toBe(true);
    expect(isPrefixAllowed(["--help"], config)).toBe(true);
  });

  it("applies a config's stripFlags before matching prefixes", () => {
    const withStrip: CliConfig = {
      readOnlyPrefixes: [["issue", "search"]],
      stripFlags: (args) => args.filter((a) => a !== "--select" && a !== "id"),
    };
    expect(isPrefixAllowed(["--select", "id", "issue", "search"], withStrip)).toBe(true);
    expect(isPrefixAllowed(["--select", "id", "issue", "delete"], withStrip)).toBe(false);
  });

  it("uses args as-is when a config has no stripFlags", () => {
    expect(isPrefixAllowed(["--select", "id", "issue", "search"], config)).toBe(false);
  });

  // Proves the allowlist logic is genuinely generic across CLIs, not just
  // "jira with extra steps" — two configs with unrelated prefix sets must
  // each only allow their own shapes.
  it("evaluates independently per config, proving the logic generalizes across CLIs", () => {
    const jiraLike: CliConfig = { readOnlyPrefixes: [["issue", "search"]] };
    const chatLike: CliConfig = { readOnlyPrefixes: [["spaces", "list"]] };

    expect(isPrefixAllowed(["issue", "search"], jiraLike)).toBe(true);
    expect(isPrefixAllowed(["spaces", "list"], jiraLike)).toBe(false);

    expect(isPrefixAllowed(["spaces", "list"], chatLike)).toBe(true);
    expect(isPrefixAllowed(["issue", "search"], chatLike)).toBe(false);
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
    readOnlyPrefixes: [
      ["issue", "search"],
      ["issue", "get"],
      ["doctor"],
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

  // Relocated from the old jira.test.ts's createJiraTool coverage: lists
  // the valid read-only prefixes in the rejection error, to help a small
  // model self-correct in one step instead of needing a --help round trip.
  it("execute does not call runCliFn for a disallowed subcommand, and lists the valid prefixes", async () => {
    let called = false;
    const runCliFn = async (): Promise<CliResult> => {
      called = true;
      return { ok: true, data: {} };
    };

    const { runCommand } = createCliTool(runCliFn, { jira: jiraConfig });
    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = (await runCommand.execute(
      { command: "jira issue delete KAN-1 --confirm" },
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
    const chatConfig: CliConfig = { readOnlyPrefixes: [["spaces", "list"]] };

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
