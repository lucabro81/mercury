import { describe, it, expect } from "bun:test";
import {
  stripGlobalFlags,
  matchCommand,
  formatPrefixes,
  createCliTool,
  omitFormattedListForModel,
  type CliConfig,
} from "./cli-tool.ts";
import { createConfirmationStore } from "./confirmation-store.ts";
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
      { prefix: ["issue", "search"], confirm: false, mutating: false },
      { prefix: ["issue", "get"], confirm: false, mutating: false },
      { prefix: ["doctor"], confirm: false, mutating: false },
      { prefix: ["issue", "delete"], confirm: true, mutating: true },
    ],
  };

  it("returns allowed for args matching a confirm:false prefix", () => {
    expect(matchCommand(["issue", "search", "--jql", "project=KAN"], config)).toEqual({
      kind: "allowed",
      mutating: false,
    });
    expect(matchCommand(["doctor"], config)).toEqual({ kind: "allowed", mutating: false });
  });

  it("returns allowed with mutating:true for a confirm:false, mutating:true prefix (e.g. create)", () => {
    const withCreate: CliConfig = {
      allowedPrefixes: [
        ...config.allowedPrefixes,
        { prefix: ["issue", "create"], confirm: false, mutating: true },
      ],
    };
    expect(matchCommand(["issue", "create", "--project", "KAN"], withCreate)).toEqual({
      kind: "allowed",
      mutating: true,
    });
  });

  it("returns confirm-required for args matching a confirm:true prefix", () => {
    expect(matchCommand(["issue", "delete", "KAN-1"], config)).toEqual({
      kind: "confirm-required",
      prefix: ["issue", "delete"],
      mutating: true,
    });
  });

  it("returns not-allowed for args matching no configured prefix", () => {
    expect(matchCommand(["issue", "create", "--project", "KAN"], config)).toEqual({ kind: "not-allowed" });
  });

  it("always allows --help, even for an otherwise-disallowed shape", () => {
    expect(matchCommand(["issue", "create", "--help"], config)).toEqual({ kind: "allowed", mutating: false });
    expect(matchCommand(["--help"], config)).toEqual({ kind: "allowed", mutating: false });
  });

  it("applies a config's globalFlags before matching prefixes", () => {
    const withFlags: CliConfig = {
      allowedPrefixes: [{ prefix: ["issue", "search"], confirm: false, mutating: false }],
      globalFlags: [{ flag: "--select", takesValue: true }],
    };
    expect(matchCommand(["--select", "id", "issue", "search"], withFlags)).toEqual({
      kind: "allowed",
      mutating: false,
    });
    expect(matchCommand(["--select", "id", "issue", "delete"], withFlags)).toEqual({ kind: "not-allowed" });
  });

  it("uses args as-is when a config has no globalFlags", () => {
    expect(matchCommand(["--select", "id", "issue", "search"], config)).toEqual({ kind: "not-allowed" });
  });

  it("carries a matched prefix's postProcess name through on an allowed result", () => {
    const withPostProcess: CliConfig = {
      allowedPrefixes: [{ prefix: ["issue", "search"], confirm: false, mutating: false, postProcess: "issue-list" }],
    };
    expect(matchCommand(["issue", "search", "--jql", "project=KAN"], withPostProcess)).toEqual({
      kind: "allowed",
      mutating: false,
      postProcess: "issue-list",
    });
  });

  it("leaves postProcess undefined for a prefix that doesn't declare one", () => {
    expect(matchCommand(["doctor"], config)).toEqual({ kind: "allowed", mutating: false });
  });

  // Proves the allowlist logic is genuinely generic across CLIs, not just
  // "jira with extra steps" — two configs with unrelated prefix sets must
  // each only allow their own shapes.
  it("evaluates independently per config, proving the logic generalizes across CLIs", () => {
    const jiraLike: CliConfig = {
      allowedPrefixes: [{ prefix: ["issue", "search"], confirm: false, mutating: false }],
    };
    const chatLike: CliConfig = {
      allowedPrefixes: [{ prefix: ["spaces", "list"], confirm: false, mutating: false }],
    };

    expect(matchCommand(["issue", "search"], jiraLike)).toEqual({ kind: "allowed", mutating: false });
    expect(matchCommand(["spaces", "list"], jiraLike)).toEqual({ kind: "not-allowed" });

    expect(matchCommand(["spaces", "list"], chatLike)).toEqual({ kind: "allowed", mutating: false });
    expect(matchCommand(["issue", "search"], chatLike)).toEqual({ kind: "not-allowed" });
  });
});

describe("omitFormattedListForModel", () => {
  it("strips formattedList from data when present", () => {
    expect(omitFormattedListForModel({ ok: true, data: { issues: [], formattedList: "MER-1\nhttps://x" } })).toEqual({
      ok: true,
      data: { issues: [] },
    });
  });

  it("leaves formattedListNote untouched when that's what's present instead", () => {
    const output = { ok: true, data: { formattedListNote: "could not build a list, retry with --select-all" } };
    expect(omitFormattedListForModel(output)).toEqual(output);
  });

  it("leaves a result with no data field untouched", () => {
    const output = { ok: false, error: "boom" };
    expect(omitFormattedListForModel(output)).toEqual(output);
  });

  it("leaves a result whose data has no formattedList untouched", () => {
    const output = { ok: true, data: { issues: [{ key: "MER-1" }] } };
    expect(omitFormattedListForModel(output)).toEqual(output);
  });

  it("leaves non-object output (e.g. a plain error string) untouched", () => {
    expect(omitFormattedListForModel("not an object")).toBe("not an object");
    expect(omitFormattedListForModel(null)).toBe(null);
  });

  it("keeps every other field in data intact alongside stripping formattedList", () => {
    expect(
      omitFormattedListForModel({
        ok: true,
        data: { issues: [{ key: "MER-1" }], total: 1, formattedList: "MER-1\nhttps://x" },
      }),
    ).toEqual({ ok: true, data: { issues: [{ key: "MER-1" }], total: 1 } });
  });

  it("does not mutate the input object", () => {
    const output = { ok: true, data: { formattedList: "MER-1\nhttps://x", issues: [] } };
    const snapshot = JSON.parse(JSON.stringify(output));
    omitFormattedListForModel(output);
    expect(output).toEqual(snapshot);
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
      { prefix: ["issue", "search"], confirm: false, mutating: false },
      { prefix: ["issue", "get"], confirm: false, mutating: false },
      { prefix: ["doctor"], confirm: false, mutating: false },
      { prefix: ["issue", "delete"], confirm: true, mutating: true },
    ],
  };

  // Fresh store + sessionKey per test that doesn't care about confirmation
  // staging specifically — a real ConfirmationStore is required by
  // createCliTool's signature now, but only the confirm-required tests
  // below actually exercise it. vaultPath/userId/writeConfirmationNoteFn
  // are needed by every call now too (the confirm-required branch writes a
  // note unconditionally), but a no-op fake is enough outside those tests.
  function defaultOpts() {
    return {
      sessionKey: "test-session",
      store: createConfirmationStore(),
      vaultPath: "/vault",
      userId: "user-x",
      writeConfirmationNoteFn: async () => {},
    };
  }

  // Shared by the confirm-required tests below, which do care about the
  // store/sessionKey but not usually about the note-writing side effect —
  // tests that DO care override writeConfirmationNoteFn explicitly.
  function confirmOpts(store: ReturnType<typeof createConfirmationStore>) {
    return { sessionKey: "terminal", store, vaultPath: "/vault", userId: "user-x", writeConfirmationNoteFn: async () => {} };
  }

  it("execute parses the command and calls runCliFn with the exact binary and args for an allowed command", async () => {
    let receivedBinary: string | undefined;
    let receivedArgs: string[] | undefined;
    const fakeResult: CliResult = { ok: true, data: { issues: [] } };
    const runCliFn = async (binary: string, args: string[]) => {
      receivedBinary = binary;
      receivedArgs = args;
      return fakeResult;
    };

    const { runCommand } = createCliTool(runCliFn, { jira: jiraConfig }, defaultOpts());
    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = await runCommand.execute(
      { command: 'jira issue search --jql "project = KAN"' },
      {} as never,
    );

    expect(receivedBinary).toBe("jira");
    expect(receivedArgs).toEqual(["issue", "search", "--jql", "project = KAN"]);
    expect(result).toEqual(fakeResult);
  });

  describe("postProcessors", () => {
    const withPostProcess: CliConfig = {
      allowedPrefixes: [{ prefix: ["issue", "search"], confirm: false, mutating: false, postProcess: "issue-list" }],
    };

    it("applies the named post-processor to a successful result when the matched prefix declares one", async () => {
      const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: { issues: [] } });
      const postProcessors = {
        "issue-list": (_parsed: { binary: string; args: string[] }, result: CliResult): CliResult =>
          result.ok ? { ok: true, data: { ...(result.data as object), formattedList: "no issues" } } : result,
      };

      const { runCommand } = createCliTool(runCliFn, { jira: withPostProcess }, { ...defaultOpts(), postProcessors });
      // @ts-expect-error - execute is guaranteed present for this tool definition
      const result = await runCommand.execute({ command: 'jira issue search --jql "project = KAN"' }, {} as never);

      expect(result).toEqual({ ok: true, data: { issues: [], formattedList: "no issues" } });
    });

    it("passes the parsed binary/args to the post-processor", async () => {
      const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: { issues: [] } });
      let received: { binary: string; args: string[] } | undefined;
      const postProcessors = {
        "issue-list": (parsed: { binary: string; args: string[] }, result: CliResult): CliResult => {
          received = parsed;
          return result;
        },
      };

      const { runCommand } = createCliTool(runCliFn, { jira: withPostProcess }, { ...defaultOpts(), postProcessors });
      // @ts-expect-error - execute is guaranteed present for this tool definition
      await runCommand.execute({ command: 'jira issue search --jql "project = KAN"' }, {} as never);

      expect(received).toEqual({ binary: "jira", args: ["issue", "search", "--jql", "project = KAN"] });
    });

    it("leaves the result untouched when no postProcessors map is supplied", async () => {
      const fakeResult: CliResult = { ok: true, data: { issues: [] } };
      const runCliFn = async (): Promise<CliResult> => fakeResult;

      const { runCommand } = createCliTool(runCliFn, { jira: withPostProcess }, defaultOpts());
      // @ts-expect-error - execute is guaranteed present for this tool definition
      const result = await runCommand.execute({ command: 'jira issue search --jql "project = KAN"' }, {} as never);

      expect(result).toEqual(fakeResult);
    });

    it("leaves the result untouched when the matched prefix's postProcess name isn't registered", async () => {
      const fakeResult: CliResult = { ok: true, data: { issues: [] } };
      const runCliFn = async (): Promise<CliResult> => fakeResult;

      const { runCommand } = createCliTool(runCliFn, { jira: withPostProcess }, {
        ...defaultOpts(),
        postProcessors: { "some-other-hook": (_p, r: CliResult) => r },
      });
      // @ts-expect-error - execute is guaranteed present for this tool definition
      const result = await runCommand.execute({ command: 'jira issue search --jql "project = KAN"' }, {} as never);

      expect(result).toEqual(fakeResult);
    });

    it("leaves the result untouched for a matched prefix that declares no postProcess, even with a postProcessors map present", async () => {
      const fakeResult: CliResult = { ok: true, data: "ok" };
      const runCliFn = async (): Promise<CliResult> => fakeResult;

      const { runCommand } = createCliTool(runCliFn, { jira: jiraConfig }, {
        ...defaultOpts(),
        postProcessors: { "issue-list": (_p, r: CliResult) => ({ ok: true, data: "mutated" }) },
      });
      // @ts-expect-error - execute is guaranteed present for this tool definition
      const result = await runCommand.execute({ command: "jira doctor" }, {} as never);

      expect(result).toEqual(fakeResult);
    });

    it("wires toModelOutput to strip formattedList from what the model sees, while execute's own return keeps it", async () => {
      const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: { issues: [] } });
      const postProcessors = {
        "issue-list": (_parsed: { binary: string; args: string[] }, result: CliResult): CliResult =>
          result.ok ? { ok: true, data: { ...(result.data as object), formattedList: "no issues" } } : result,
      };

      const { runCommand } = createCliTool(runCliFn, { jira: withPostProcess }, { ...defaultOpts(), postProcessors });
      // @ts-expect-error - execute is guaranteed present for this tool definition
      const result = await runCommand.execute({ command: 'jira issue search --jql "project = KAN"' }, {} as never);
      expect(result).toEqual({ ok: true, data: { issues: [], formattedList: "no issues" } });

      const modelOutput = await runCommand.toModelOutput?.({
        toolCallId: "call-1",
        input: { command: 'jira issue search --jql "project = KAN"' },
        output: result,
      } as never);
      expect(modelOutput).toEqual({ type: "json", value: { ok: true, data: { issues: [] } } });
    });

    it("lets a post-processor turn a successful CLI result into an error (e.g. missing required fields)", async () => {
      const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: { issues: [{ key: "KAN-1" }] } });
      const postProcessors = {
        "issue-list": (): CliResult => ({ ok: false, error: "missing required field: summary" }),
      };

      const { runCommand } = createCliTool(runCliFn, { jira: withPostProcess }, { ...defaultOpts(), postProcessors });
      // @ts-expect-error - execute is guaranteed present for this tool definition
      const result = await runCommand.execute({ command: 'jira issue search --jql "project = KAN"' }, {} as never);

      expect(result).toEqual({ ok: false, error: "missing required field: summary" });
    });
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

    const { runCommand } = createCliTool(runCliFn, { jira: jiraConfig }, defaultOpts());
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

  // The confirm-required branch is distinct from "not permitted": the
  // shape IS recognized, but instead of running it, it's staged in the
  // ConfirmationStore under the tool's own sessionKey and a structured
  // `token` is handed back — runCliFn only runs later, once that token
  // comes back through whatever channel-specific confirmation mechanism
  // the caller's provider uses (see confirm-flow.ts and
  // terminal-provider.ts/google-chat-provider.ts).
  it("execute stages a confirm-required command instead of running it, and returns its token", async () => {
    let called = false;
    const runCliFn = async (): Promise<CliResult> => {
      called = true;
      return { ok: true, data: {} };
    };
    const store = createConfirmationStore({ tokenFn: () => "TOK1" });

    const { runCommand } = createCliTool(runCliFn, { jira: jiraConfig }, confirmOpts(store));
    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = (await runCommand.execute(
      { command: "jira issue delete KAN-1 --confirm" },
      {} as never,
    )) as CliResult & { pendingConfirmation?: true; token?: string };

    expect(called).toBe(false);
    expect(result.ok).toBe(false);
    expect(result.pendingConfirmation).toBe(true);
    expect(result.token).toBe("TOK1");
    if (!result.ok) {
      expect(result.error).not.toContain("not permitted");
    }

    // the FULL argv was staged, not just the matched prefix
    expect(store.take("terminal", "TOK1")).toEqual({
      kind: "cli",
      binary: "jira",
      args: ["issue", "delete", "KAN-1", "--confirm"],
      requestedAt: expect.any(String),
    });
  });

  // Regression test: the model asked for "jira issue delete MER-19"
  // (without --confirm) in a real conversation. Mercury staged it exactly
  // as typed, and once the user confirmed via card, execution failed
  // because jira-cli itself refuses to delete without its own --confirm
  // flag — a completely separate safety net from Mercury's own token, and
  // one the model can't be relied on to remember. Staging must add it
  // whenever it's missing, so the confirmed command actually succeeds.
  it("adds --confirm to the staged args when the model omitted it", async () => {
    const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: {} });
    const store = createConfirmationStore({ tokenFn: () => "TOK1" });

    const { runCommand } = createCliTool(runCliFn, { jira: jiraConfig }, confirmOpts(store));
    // @ts-expect-error - execute is guaranteed present for this tool definition
    await runCommand.execute({ command: "jira issue delete MER-19" }, {} as never);

    expect(store.take("terminal", "TOK1")).toEqual({
      kind: "cli",
      binary: "jira",
      args: ["issue", "delete", "MER-19", "--confirm"],
      requestedAt: expect.any(String),
    });
  });

  it("does not duplicate --confirm when the model already included it", async () => {
    const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: {} });
    const store = createConfirmationStore({ tokenFn: () => "TOK1" });

    const { runCommand } = createCliTool(runCliFn, { jira: jiraConfig }, confirmOpts(store));
    // @ts-expect-error - execute is guaranteed present for this tool definition
    await runCommand.execute({ command: "jira issue delete MER-19 --confirm" }, {} as never);

    expect(store.take("terminal", "TOK1")).toEqual({
      kind: "cli",
      binary: "jira",
      args: ["issue", "delete", "MER-19", "--confirm"],
      requestedAt: expect.any(String),
    });
  });

  // Confirming is now channel-specific (a card button on Google Chat, a
  // typed token on the terminal — see terminal-provider.ts/google-chat-
  // provider.ts) instead of a fixed instruction the model relays as text.
  // The tool result stays channel-neutral: it hands over the structured
  // `token`, but must not dictate literal wording ("reply `conferma X`")
  // that would be wrong on a channel using a button instead.
  it("does not instruct the model to relay a literal 'conferma <token>' reply — that's channel-specific now", async () => {
    const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: {} });
    const store = createConfirmationStore({ tokenFn: () => "TOK1" });

    const { runCommand } = createCliTool(runCliFn, { jira: jiraConfig }, confirmOpts(store));
    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = (await runCommand.execute(
      { command: "jira issue delete KAN-1 --confirm" },
      {} as never,
    )) as CliResult & { pendingConfirmation?: true; token?: string };

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.toLowerCase()).not.toContain("conferma");
    }
  });

  // Regression guard for the stale-primer bug: the propose half of a
  // confirm-required action must write a deterministic "pending" record
  // (inferred/confirmations/<userId>/<token>.md) so a persistent memory
  // layer never has to guess/summarize this from free-text conversation —
  // see writeConfirmationNote in wiki-note.ts.
  it("writes a pending confirmation note when staging a confirm-required command", async () => {
    const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: {} });
    const store = createConfirmationStore({ tokenFn: () => "TOK1" });
    const writes: Array<{ vaultPath: string; userId: string; token: string; fields: unknown }> = [];
    const writeConfirmationNoteFn = async (vaultPath: string, userId: string, token: string, fields: unknown) => {
      writes.push({ vaultPath, userId, token, fields });
    };

    const { runCommand } = createCliTool(runCliFn, { jira: jiraConfig }, {
      ...confirmOpts(store),
      vaultPath: "/my-vault",
      userId: "users/42",
      writeConfirmationNoteFn,
    });
    // @ts-expect-error - execute is guaranteed present for this tool definition
    await runCommand.execute({ command: "jira issue delete KAN-1 --confirm" }, {} as never);

    expect(writes).toEqual([
      {
        vaultPath: "/my-vault",
        userId: "users/42",
        token: "TOK1",
        fields: {
          status: "pending",
          requestedAt: expect.any(String),
          resolvedAt: null,
          command: "jira issue delete KAN-1 --confirm",
        },
      },
    ]);
  });

  // A wiki-write failure (disk issue, git problem) must not break the live
  // confirmation flow itself — the user still needs to see the card/token
  // and be able to confirm. The note is a secondary paper trail, not a
  // precondition for staging to succeed.
  it("still stages and returns the token even if writing the confirmation note fails", async () => {
    const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: {} });
    const store = createConfirmationStore({ tokenFn: () => "TOK1" });
    const writeConfirmationNoteFn = async () => {
      throw new Error("disk full");
    };

    const { runCommand } = createCliTool(runCliFn, { jira: jiraConfig }, { ...confirmOpts(store), writeConfirmationNoteFn });
    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = (await runCommand.execute(
      { command: "jira issue delete KAN-1 --confirm" },
      {} as never,
    )) as CliResult & { pendingConfirmation?: true; token?: string };

    expect(result.pendingConfirmation).toBe(true);
    expect(result.token).toBe("TOK1");
  });

  it("stages a confirm-required command under the tool's own sessionKey, not a different one", async () => {
    const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: {} });
    const store = createConfirmationStore({ tokenFn: () => "TOK1" });

    const { runCommand } = createCliTool(runCliFn, { jira: jiraConfig }, confirmOpts(store));
    // @ts-expect-error - execute is guaranteed present for this tool definition
    await runCommand.execute({ command: "jira issue delete KAN-1 --confirm" }, {} as never);

    expect(store.take("some-other-session", "TOK1")).toBeNull();
  });

  // The "not permitted" message must only advertise prefixes that will
  // actually run — otherwise the model would keep retrying a shape that's
  // recognized but always rejected for a different reason.
  it("excludes confirm-gated prefixes from the 'not permitted' message's valid-commands list", async () => {
    const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: {} });
    const { runCommand } = createCliTool(runCliFn, { jira: jiraConfig }, defaultOpts());
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

    const { runCommand } = createCliTool(runCliFn, { jira: jiraConfig }, defaultOpts());
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

    const { runCommand } = createCliTool(runCliFn, { jira: jiraConfig }, defaultOpts());
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

    const { runCommand } = createCliTool(runCliFn, { jira: jiraConfig }, defaultOpts());
    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = await runCommand.execute({ command: "jira issue get KAN-1" }, {} as never);

    expect(result).toEqual({ ok: false, error: "jira exited with code 1: boom" });
  });

  it("rejects an empty command at the schema level", () => {
    const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: {} });
    const { runCommand } = createCliTool(runCliFn, { jira: jiraConfig }, defaultOpts());
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
    const chatConfig: CliConfig = {
      allowedPrefixes: [{ prefix: ["spaces", "list"], confirm: false, mutating: false }],
    };

    const { runCommand } = createCliTool(runCliFn, { jira: jiraConfig, "google-chat": chatConfig }, defaultOpts());
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
