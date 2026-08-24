/**
 * Behavioural characterisation of Mercury's Jira surface, asserted at the
 * widest seam that exists today: the tool the model actually calls, and the
 * turn pipeline that delivers its answer.
 *
 * Purpose is narrow and deliberate — this file is the **invariance oracle**
 * for the plugin extraction. Every other Jira-touching test in this repo is
 * a unit test bound to the shape of a module that the extraction is about to
 * move (`cli-tool.ts`, `issue-list-extractor.ts`, `issue-list-heuristic.ts`,
 * `turn-runner.ts`), so those tests will legitimately move with their code
 * and can't tell us whether behaviour stayed the same. These assertions can:
 * they name no module that is scheduled to move.
 *
 * The single exception is `buildJiraTools` below, which is the seam itself
 * and therefore the one thing expected to change when the composition changes.
 * Nothing under `describe` may reference `createCliTool`, `formatterPlugin`,
 * `createJiraIssueListHandler`, or `looksLikeIssueList` directly — if a change
 * to this file touches anything but that helper, the change altered behaviour
 * rather than relocating it.
 *
 * Config is read from the real `@mercury/plugin-jira` package, not a
 * hand-written fixture, so a semantic edit to the shipped allowlist (a prefix
 * losing its `confirm`, a `postProcess` hook disappearing) fails here rather
 * than passing against a copy that drifted.
 */
import { describe, expect, test } from "bun:test";
import type { Tool } from "ai";
import { loadCliConfigFromObject } from "./tools/cli-config-loader.ts";
import { jiraCliConfig, jiraPlugin, createIssueListGuard } from "@mercury/plugin-jira";
import { formatterPlugin } from "./plugins/formatter.ts";
import { createJiraIssueListHandler } from "./plugins/jira-issue-list-handler.ts";
import { createCliTool } from "./tools/cli-tool.ts";
import { createConfirmationStore, type ConfirmationStore } from "./tools/confirmation-store.ts";
import type { CliResult } from "./tools/cli-executor.ts";
import { tryConfirm } from "./router/confirm-flow.ts";
import { createTurnRunner } from "./router/turn-runner.ts";
import type { InboundTurn, TurnSink } from "./router/provider.ts";
import type { SessionHistory } from "./session/history.ts";
import type { StepInfo } from "./session/step-info.ts";

const SITE_URL = "https://example.atlassian.net";
const SESSION_KEY = "session-under-test";

/** Records every `runCli` invocation so a test can assert something did *not* run. */
type CliSpy = { calls: Array<{ binary: string; args: string[] }>; result: CliResult };

function cliSpy(result: CliResult): CliSpy {
  return { calls: [], result };
}

function spyRunCli(spy: CliSpy) {
  return async (binary: string, args: string[]): Promise<CliResult> => {
    spy.calls.push({ binary, args });
    return spy.result;
  };
}

/**
 * THE SEAM. Composes the Jira toolset the same way `mercury.config.ts` +
 * `src/index.ts` do — the real plugin wrapped by the formatter decorator with
 * the real render handler, real config file, real confirmation store — and is
 * the only place in this file allowed to know how that composition happens.
 * When the composition changes this function is what changes; every assertion
 * below should survive untouched.
 */
async function buildJiraTools(
  spy: CliSpy,
  opts: { store?: ConfirmationStore } = {},
): Promise<{ tools: Record<string, Tool>; store: ConfirmationStore }> {
  const loaded = await loadCliConfigFromObject(jiraCliConfig, { runCliFn: spyRunCli(spy) });
  if (!loaded.ok) {
    throw new Error(`plugin config failed to load in test setup: ${loaded.reason}`);
  }
  const configs = { [loaded.binary]: loaded.config };
  const store = opts.store ?? createConfirmationStore();
  // Real composition: the Jira plugin decorated with the formatter + its render
  // handler, built with JIRA_SITE_URL so the issue-list extractor registers.
  const decorated = formatterPlugin(jiraPlugin, createJiraIssueListHandler({}));
  const contributions = decorated.build!({ model: {} as never, env: { JIRA_SITE_URL: SITE_URL }, log: () => {} });
  const tools = createCliTool(spyRunCli(spy), configs, {
    sessionKey: SESSION_KEY,
    store,
    vaultPath: "/unused",
    userId: "user-under-test",
    // Vault writes are a paper trail, not part of the behaviour under test;
    // stubbed so these tests touch no filesystem.
    writeConfirmationNoteFn: async () => {},
    postProcessors: contributions.postProcessors,
  });
  return { tools, store };
}

/** Invokes `runCommand` exactly as the AI SDK would, and returns its raw result. */
async function runCommand(tools: Record<string, Tool>, command: string): Promise<any> {
  const tool = tools.runCommand;
  if (!tool?.execute) throw new Error("runCommand tool is not present or has no execute");
  return await tool.execute({ command }, { toolCallId: "call-1", messages: [] } as never);
}

describe("jira read path", () => {
  test("a successful issue search carries a deterministically formatted list", async () => {
    const spy = cliSpy({
      ok: true,
      data: {
        issues: [
          { key: "KAN-1", fields: { summary: "Fix the login redirect", status: { name: "In Progress" } } },
          { key: "KAN-2", fields: { summary: "Update the changelog", status: { name: "Done" } } },
        ],
      },
    });
    const { tools } = await buildJiraTools(spy);

    const result = await runCommand(tools, 'jira issue search --jql "project = KAN"');

    expect(result.ok).toBe(true);
    // The user-facing rendering now travels on the `display` channel as the one
    // already-rendered block the composition handler produced — byte-identical
    // to the historical list string.
    expect(result.display).toEqual({
      type: "issue-list",
      items: [
        "KAN-1 [In Progress] Fix the login redirect\n" +
          `${SITE_URL}/browse/KAN-1\n\n` +
          "KAN-2 [Done] Update the changelog\n" +
          `${SITE_URL}/browse/KAN-2`,
      ],
    });
    // The raw payload survives the post-processor untouched — the display is
    // added alongside it, never in place of it.
    expect(result.data.issues).toHaveLength(2);
    expect(spy.calls).toEqual([{ binary: "jira", args: ["issue", "search", "--jql", "project = KAN"] }]);
  });

  test("an empty result set formats as a sentence, not an empty list", async () => {
    const spy = cliSpy({ ok: true, data: { issues: [] } });
    const { tools } = await buildJiraTools(spy);

    const result = await runCommand(tools, 'jira issue search --jql "project = NOPE"');

    expect(result.ok).toBe(true);
    // An empty search yields the "No matching issues." sentence, rendered by
    // the composition handler and carried as the display's single block.
    expect(result.display).toEqual({ type: "issue-list", items: ["No matching issues."] });
  });

  test("a --select that prunes summary fails with a self-correctable error instead of a wrong list", async () => {
    const spy = cliSpy({ ok: true, data: { issues: [{ key: "KAN-1", fields: {} }] } });
    const { tools } = await buildJiraTools(spy);

    const result = await runCommand(tools, "jira --select issues.key issue search");

    expect(result.ok).toBe(false);
    expect(result.error).toContain("summary");
    expect(result.error).toContain("--fields");
    expect(result.data).toBeUndefined();
  });

  test("a bare {} result explains that formattedList is not reachable via --select", async () => {
    const spy = cliSpy({ ok: true, data: {} });
    const { tools } = await buildJiraTools(spy);

    const result = await runCommand(tools, "jira --select formattedList issue search");

    expect(result.ok).toBe(true);
    expect(result.data.formattedListNote).toContain("--select");
    expect(result.display).toBeUndefined();
  });
});

describe("jira confirmation gate", () => {
  test("an irreversible command stages instead of running, and reports a token", async () => {
    const spy = cliSpy({ ok: true, data: { deleted: true } });
    const { tools } = await buildJiraTools(spy);

    const result = await runCommand(tools, "jira issue delete KAN-1");

    expect(result.pendingConfirmation).toBe(true);
    expect(typeof result.token).toBe("string");
    expect(result.ok).toBe(false);
    // The whole point of the gate: nothing reached the CLI.
    expect(spy.calls).toEqual([]);
  });

  test("confirming the token runs the staged command, with --confirm supplied by Mercury", async () => {
    const spy = cliSpy({ ok: true, data: { deleted: true } });
    const { tools, store } = await buildJiraTools(spy);

    const staged = await runCommand(tools, "jira issue delete KAN-1");
    const reply = await tryConfirm(staged.token, SESSION_KEY, {
      store,
      runCliFn: spyRunCli(spy),
      userId: "user-under-test",
      vaultPath: "/unused",
      writeConfirmationNoteFn: async () => {},
    });

    expect(reply).toContain("Confermato");
    // `--confirm` is appended at staging time whether or not the model wrote
    // it — the underlying CLI refuses a delete without its own flag.
    expect(spy.calls).toEqual([{ binary: "jira", args: ["issue", "delete", "KAN-1", "--confirm"] }]);
  });

  test("a token is single-use: replaying it never runs the command twice", async () => {
    const spy = cliSpy({ ok: true, data: { deleted: true } });
    const { tools, store } = await buildJiraTools(spy);
    const confirmDeps = {
      store,
      runCliFn: spyRunCli(spy),
      userId: "user-under-test",
      vaultPath: "/unused",
      writeConfirmationNoteFn: async () => {},
    };

    const staged = await runCommand(tools, "jira issue delete KAN-1");
    await tryConfirm(staged.token, SESSION_KEY, confirmDeps);
    const replay = await tryConfirm(staged.token, SESSION_KEY, confirmDeps);

    expect(replay).toContain("Nessuna conferma in sospeso");
    expect(spy.calls).toHaveLength(1);
  });

  test("a token minted for one session cannot be confirmed from another", async () => {
    const spy = cliSpy({ ok: true, data: { deleted: true } });
    const { tools, store } = await buildJiraTools(spy);

    const staged = await runCommand(tools, "jira issue delete KAN-1");
    const reply = await tryConfirm(staged.token, "a-different-session", {
      store,
      runCliFn: spyRunCli(spy),
      userId: "user-under-test",
      vaultPath: "/unused",
      writeConfirmationNoteFn: async () => {},
    });

    expect(reply).toContain("Nessuna conferma in sospeso");
    expect(spy.calls).toEqual([]);
  });

  test("a command outside the allowlist is refused with the valid shapes named", async () => {
    const spy = cliSpy({ ok: true, data: {} });
    const { tools } = await buildJiraTools(spy);

    const result = await runCommand(tools, "jira project delete KAN");

    expect(result.ok).toBe(false);
    expect(result.error).toContain("not permitted");
    expect(spy.calls).toEqual([]);
  });
});

// --- turn pipeline ---------------------------------------------------------

function fakeHistory(overrides: Partial<SessionHistory> = {}): SessionHistory {
  return {
    addUserMessage: async () => {},
    addAssistantMessage: async () => {},
    replaceLastAssistantMessage: () => {},
    getMessages: () => [],
    getCharCount: () => 0,
    ...overrides,
  };
}

function baseTurn(): InboundTurn {
  return {
    channel: "test",
    multiUser: false,
    text: "quali issue sono aperte?",
    sessionKey: SESSION_KEY,
    wikiUserId: "wiki-user",
    logPrefix: "",
  };
}

function collectingSink(): TurnSink & { delivered: string[] } {
  const delivered: string[] = [];
  return {
    onToolStart: () => {},
    finalize: async (text) => {
      delivered.push(text);
    },
    dispose: () => {},
    get delivered() {
      return delivered;
    },
  } as TurnSink & { delivered: string[] };
}

/** A tool step carrying an issue-list `display` channel, as a real issue search produces. */
function stepWithIssueList(items: string[]): StepInfo {
  return {
    toolCalls: [{ toolCallId: "s1", toolName: "runCommand", input: { command: "jira issue search" } }],
    toolResults: [
      { toolCallId: "s1", toolName: "runCommand", output: { ok: true, data: {}, display: { type: "issue-list", items } } },
    ],
    content: [],
  };
}

/**
 * Drives one turn where the model produced `modelText` after a search that
 * yielded `formattedList`, and returns what the user actually received.
 * `correctorOutput` is what the correction pass rewrites the answer to.
 */
async function deliverTurn(opts: {
  modelText: string;
  formattedList: string;
  correctorOutput?: string;
}): Promise<string> {
  const sink = collectingSink();
  const runner = createTurnRunner({
    model: {} as never,
    systemPrompts: { singleUser: "s", multiUser: "m" },
    buildTools: () => ({}),
    getOrCreateHistory: () => fakeHistory(),
    trackSession: () => {},
    registerCaptureCallback: () => {},
    maybeCapture: async () => {},
    processToolCorrections: async () => {},
    logStep: () => {},
    logPostTurnGuardFn: () => {},
    recordStepFn: () => {},
    postTurnGuards: [createIssueListGuard(async () => opts.correctorOutput ?? "")],
    runTurnFn: async (_history, _input, deps) => {
      deps.onStepFinish?.(stepWithIssueList([opts.formattedList]));
      return opts.modelText;
    },
  });

  await runner(baseTurn(), sink);
  expect(sink.delivered).toHaveLength(1);
  return sink.delivered[0] as string;
}

describe("jira answer delivery", () => {
  const FORMATTED = `KAN-1 [In Progress] Fix the login redirect\n${SITE_URL}/browse/KAN-1`;

  test("the deterministic list reaches the user even when the model never relays it", async () => {
    const delivered = await deliverTurn({
      modelText: "Ho trovato una issue aperta.",
      formattedList: FORMATTED,
    });

    expect(delivered).toBe(`Ho trovato una issue aperta.\n\n${FORMATTED}`);
  });

  test("the list is not appended twice when the model already included it verbatim", async () => {
    const delivered = await deliverTurn({
      modelText: `Ecco:\n\n${FORMATTED}`,
      formattedList: FORMATTED,
    });

    expect(delivered).toBe(`Ecco:\n\n${FORMATTED}`);
  });

  test("a model that restates the list by hand gets its text replaced, not appended to", async () => {
    const restated = "Ecco le issue:\n- KAN-1: Fix the login redirect\n- KAN-2: Update the changelog";
    const delivered = await deliverTurn({
      modelText: restated,
      formattedList: FORMATTED,
      correctorOutput: "Ho trovato due issue aperte.",
    });

    expect(delivered).toBe(`Ho trovato due issue aperte.\n\n${FORMATTED}`);
    expect(delivered).not.toContain("- KAN-1:");
  });

  test("a corrector whose own output still restates the list falls back to a fixed reply", async () => {
    const restated = "Ecco le issue:\n- KAN-1: Fix the login redirect\n- KAN-2: Update the changelog";
    const delivered = await deliverTurn({
      modelText: restated,
      formattedList: FORMATTED,
      correctorOutput: "- KAN-1: ancora una lista\n- KAN-2: pure questa",
    });

    expect(delivered).toBe(`Ecco i risultati.\n\n${FORMATTED}`);
  });

  test("ordinary prose that merely mentions one issue key is left alone", async () => {
    const prose = "Ho guardato KAN-1 e mi sembra già risolta, non serve altro.";
    const delivered = await deliverTurn({ modelText: prose, formattedList: FORMATTED });

    expect(delivered).toBe(`${prose}\n\n${FORMATTED}`);
  });
});
