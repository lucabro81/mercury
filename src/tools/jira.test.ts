import { describe, it, expect } from "bun:test";
import { isAllowed, createJiraTool } from "./jira.ts";
import type { CliResult } from "./cli-executor.ts";

describe("isAllowed", () => {
  it("allows read-only subcommands", () => {
    expect(isAllowed(["issue", "search", "--jql", "project=KAN"])).toBe(true);
    expect(isAllowed(["issue", "get", "KAN-42"])).toBe(true);
    expect(isAllowed(["issue", "transitions", "KAN-42"])).toBe(true);
    expect(isAllowed(["doctor"])).toBe(true);
    expect(isAllowed(["auth", "whoami"])).toBe(true);
  });

  it("rejects write subcommands", () => {
    expect(isAllowed(["issue", "delete", "KAN-1", "--confirm"])).toBe(false);
    expect(isAllowed(["issue", "create", "--project", "KAN"])).toBe(false);
    expect(isAllowed(["issue", "transition", "KAN-1", "--to", "Done"])).toBe(
      false,
    );
    expect(isAllowed(["issue", "comment", "add", "KAN-1"])).toBe(false);
  });

  it("always allows --help, even on a write subcommand", () => {
    expect(isAllowed(["issue", "create", "--help"])).toBe(true);
    expect(isAllowed(["--help"])).toBe(true);
  });

  // Regression: jira's --select is a global flag, documented (top-level
  // --help: "Usage: jira [OPTIONS] <COMMAND>") to come BEFORE the
  // subcommand, not just after. Observed for real: the model called
  // ["--select", "issues.key", "issue", "search", "--jql", "..."] for an
  // ordinary read query, and the old positional-prefix check rejected it
  // as "not permitted" since args[0] was "--select", not "issue".
  it("allows a read-only subcommand even when --select appears before it", () => {
    expect(
      isAllowed(["--select", "issues.key,issues.fields.summary", "issue", "search", "--jql", "project=KAN"]),
    ).toBe(true);
    expect(isAllowed(["--select", "id", "doctor"])).toBe(true);
  });

  it("still rejects a write subcommand when --select appears before it", () => {
    expect(isAllowed(["--select", "id", "issue", "delete", "KAN-1", "--confirm"])).toBe(false);
  });
});

describe("createJiraTool", () => {
  it("execute calls runCliFn with the exact args for an allowed command", async () => {
    let receivedBinary: string | undefined;
    let receivedArgs: string[] | undefined;
    const fakeResult: CliResult = { ok: true, data: { issues: [] } };
    const runCliFn = async (binary: string, args: string[]) => {
      receivedBinary = binary;
      receivedArgs = args;
      return fakeResult;
    };

    const { jiraCli } = createJiraTool(runCliFn);
    const args = ["issue", "search", "--jql", "project=KAN"];
    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = await jiraCli.execute({ args }, {} as never);

    expect(receivedBinary).toBe("jira");
    expect(receivedArgs).toEqual(args);
    expect(result).toEqual(fakeResult);
  });

  it("execute does not call runCliFn for a disallowed command, and returns a not-permitted error", async () => {
    let called = false;
    const runCliFn = async () => {
      called = true;
      return { ok: true, data: {} } as CliResult;
    };

    const { jiraCli } = createJiraTool(runCliFn);
    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = (await jiraCli.execute(
      { args: ["issue", "delete", "KAN-1", "--confirm"] },
      {} as never,
    )) as CliResult;

    expect(called).toBe(false);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("not permitted");
    }
  });

  // Observed for real with a smaller (9b) model: it called ["search", "--jql",
  // ...] — a genuinely invalid command (missing "issue", confirmed against
  // the real CLI: "unrecognized subcommand 'search'") — and the rejection
  // message ("not permitted... read-only access only") read as a permissions
  // problem rather than "this exact shape isn't recognized," so the model
  // spent its next turn guessing at permissions instead of retrying with the
  // right prefix. Listing the valid prefixes in the error gives it what it
  // needs to self-correct in one step instead of needing a --help round trip.
  it("lists the valid read-only prefixes in the rejection error, to help a model self-correct", async () => {
    const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: {} });
    const { jiraCli } = createJiraTool(runCliFn);
    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = (await jiraCli.execute(
      { args: ["search", "--jql", "project=KAN"] },
      {} as never,
    )) as CliResult;

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("issue search");
      expect(result.error).toContain("issue get");
      expect(result.error).toContain("issue transitions");
      expect(result.error).toContain("doctor");
      expect(result.error).toContain("auth whoami");
    }
  });

  it("execute propagates a runCliFn error result as-is, never throws", async () => {
    const runCliFn = async (): Promise<CliResult> => ({
      ok: false,
      error: "jira exited with code 1: boom",
    });

    const { jiraCli } = createJiraTool(runCliFn);
    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = await jiraCli.execute(
      { args: ["issue", "get", "KAN-1"] },
      {} as never,
    );

    expect(result).toEqual({ ok: false, error: "jira exited with code 1: boom" });
  });

  it("rejects an empty args array at the schema level", () => {
    const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: {} });
    const { jiraCli } = createJiraTool(runCliFn);
    // inputSchema is a zod object passed through tool() as-is
    const schema = jiraCli.inputSchema as unknown as {
      safeParse: (v: unknown) => { success: boolean };
    };
    expect(schema.safeParse({ args: [] }).success).toBe(false);
    expect(schema.safeParse({ args: ["doctor"] }).success).toBe(true);
  });
});
