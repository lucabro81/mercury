/**
 * `mfw e2e`'s runner against a scripted REPL session: the turns it sends,
 * the checks it evaluates and reports, repetitions, the app's plugins checked
 * first, and `before`/`after`. The real session (docker compose, the REPL's
 * `/dump`) is `session.ts`; this only sees what the session hands back.
 */
import { describe, expect, test } from "bun:test";
import type { E2eTest, Turn } from "./define.ts";
import { runE2e, type RunnerDeps, type Session } from "./runner.ts";

/** A scripted answer to one turn: the steps `/dump` would write, and the printed output. */
type Scripted = { dump: unknown[]; output?: string };

const answering = (text: string, calls: Array<{ tool: string; command?: string; ok?: boolean }> = []): Scripted => ({
  dump: [
    {
      content: calls.flatMap((c, i) => [
        { type: "tool-call", toolCallId: `${i}`, toolName: c.tool, input: { command: c.command } },
        { type: "tool-result", toolCallId: `${i}`, toolName: c.tool, output: { ok: c.ok ?? true } },
      ]),
    },
    { content: [{ type: "text", text }] },
  ],
});

/** Deps whose sessions answer each turn with the next of `script` (cycling
 * through the list on each new session when given one list per session). */
function fake(script: Scripted[][], { packages = { "@mercury-fw/plugin-jira": "^0.4.0" } as Record<string, string> } = {}) {
  const sent: string[][] = [];
  const printed: string[] = [];
  const cli: string[] = [];
  const reports: unknown[] = [];
  let sessions = 0;
  const deps: RunnerDeps = {
    openSession: async (): Promise<Session> => {
      const answers = [...(script[sessions % script.length] ?? [])];
      const lines: string[] = [];
      sent.push(lines);
      sessions++;
      return {
        turn: async (line) => {
          lines.push(line);
          const next = answers.shift() ?? { dump: [] };
          return { dump: next.dump, output: next.output ?? "" };
        },
        close: async () => {},
      };
    },
    cli: async (command) => {
      cli.push(command);
      return { code: 0, output: "" };
    },
    appPackages: packages,
    print: (line) => void printed.push(line),
    now: (() => {
      let t = 0;
      return () => (t += 2000);
    })(),
    writeReport: async (report) => void reports.push(report),
  };
  return { deps, sent, printed, cli, reports, sessions: () => sessions };
}

const ONE_CASE: E2eTest = {
  plugins: ["jira"],
  cases: [
    {
      name: "project key",
      turns: ["What is the key of Customer Support?"],
      check: (run, expect) => {
        expect.everyCall("jiraCommand", (c) => String((c.input as { command: string }).command).includes("--select "), "--select everywhere");
        expect.answer(/\bCS\b/);
      },
    },
  ],
};

describe("runE2e", () => {
  test("sends the turns, checks the run, prints every check, exit 0 when all pass", async () => {
    const f = fake([[answering("The key is CS.", [{ tool: "jiraCommand", command: "jira project search --select values.key" }])]]);
    expect(await runE2e([{ file: "t.e2e.ts", test: ONE_CASE }], {}, f.deps)).toBe(0);
    expect(f.sent).toEqual([["What is the key of Customer Support?"]]);
    expect(f.printed).toEqual(["t.e2e.ts", "  project key", "    ✓ --select everywhere", "    ✓ answer matches /\\bCS\\b/", "  project key: passed"]);
  });

  test("a failed check: its detail, the case failed, exit 1", async () => {
    const f = fake([[answering("No idea.", [{ tool: "jiraCommand", command: "jira project search" }])]]);
    expect(await runE2e([{ file: "t.e2e.ts", test: ONE_CASE }], {}, f.deps)).toBe(1);
    expect(f.printed).toContain('    ✗ --select everywhere: jiraCommand {"command":"jira project search"}');
    expect(f.printed).toContain("    ✗ answer matches /\\bCS\\b/: No idea.");
    expect(f.printed.at(-1)).toBe("  project key: FAILED");
  });

  test("a turn can be a function of the turn before, and every turn is checked", async () => {
    const f = fake([[answering("Staged, token AB12"), answering("Done.")]]);
    let seen: Turn | undefined;
    const test: E2eTest = {
      cases: [
        {
          name: "confirm",
          turns: ["Delete SUP-1", (previous) => ((seen = previous), previous.answer.split(" ").at(-1)!)],
          check: (run, expect) => expect.that("two turns", run.turns.length === 2 && run.last.answer === "Done."),
        },
      ],
    };
    expect(await runE2e([{ file: "t.e2e.ts", test }], {}, f.deps)).toBe(0);
    expect(f.sent).toEqual([["Delete SUP-1", "AB12"]]);
    expect(seen?.answer).toBe("Staged, token AB12");
  });

  test("each turn takes the time between sending it and its dump", async () => {
    const f = fake([[answering("x")]]);
    let seconds = 0;
    const test: E2eTest = { cases: [{ name: "c", turns: ["q"], check: (run) => void (seconds = run.last.seconds) }] };
    await runE2e([{ file: "t.e2e.ts", test }], {}, f.deps);
    expect(seconds).toBe(2);
  });

  test("a turn with no model steps (a confirmation reply) takes its answer from the printed output", async () => {
    const f = fake([[{ dump: [], output: "\u001b[2mexecuted\u001b[0m: jira issue delete SUP-1\n[~5k/~262k tokens] > " }]]);
    let answer = "";
    const test: E2eTest = { cases: [{ name: "c", turns: ["AB12"], check: (run) => void (answer = run.last.answer) }] };
    await runE2e([{ file: "t.e2e.ts", test }], {}, f.deps);
    expect(answer).toBe("executed: jira issue delete SUP-1");
  });

  test("repeat and minPasses: each run in its own session, the case passes on enough runs", async () => {
    const pass = [answering("CS")];
    const fail = [answering("no")];
    const test = (minPasses?: number): E2eTest => ({
      cases: [{ name: "c", turns: ["q"], repeat: 3, ...(minPasses ? { minPasses } : {}), check: (run, e) => e.answer("CS") }],
    });
    const lenient = fake([pass, fail, pass]);
    expect(await runE2e([{ file: "t.e2e.ts", test: test(2) }], {}, lenient.deps)).toBe(0);
    expect(lenient.sessions()).toBe(3);
    expect(lenient.printed.at(-1)).toBe("  c: 2/3 runs passed (needs 2)");
    const strict = fake([pass, fail, pass]);
    expect(await runE2e([{ file: "t.e2e.ts", test: test() }], {}, strict.deps)).toBe(1);
    expect(strict.printed.at(-1)).toBe("  c: 2/3 runs passed (needs 3) FAILED");
  });

  test("--repeat overrides the case's own, minPasses capped to it", async () => {
    const f = fake([[answering("CS")]]);
    const test: E2eTest = { cases: [{ name: "c", turns: ["q"], repeat: 5, minPasses: 5, check: (run, e) => e.answer("CS") }] };
    expect(await runE2e([{ file: "t.e2e.ts", test }], { repeat: 2 }, f.deps)).toBe(0);
    expect(f.sessions()).toBe(2);
  });

  test("an app without a plugin or channel the test needs: says which, runs nothing, exit 1", async () => {
    const f = fake([[answering("x")]], { packages: { "@mercury-fw/core": "^0.30.0" } });
    const test: E2eTest = { plugins: ["jira"], channels: ["http"], cases: ONE_CASE.cases };
    expect(await runE2e([{ file: "t.e2e.ts", test }], {}, f.deps)).toBe(1);
    expect(f.printed).toEqual(["t.e2e.ts", "  the app lacks what the test needs: plugin jira (@mercury-fw/plugin-jira), channel http (@mercury-fw/channel-http)"]);
    expect(f.sessions()).toBe(0);
  });

  test("before and after run around each run with cli; after runs even when check throws, which fails the run", async () => {
    const f = fake([[answering("x")]]);
    const test: E2eTest = {
      cases: [
        {
          name: "c",
          turns: ["q"],
          before: ({ cli }) => cli("setup"),
          after: ({ cli }) => cli("cleanup"),
          check: () => {
            throw new Error("bad check");
          },
        },
      ],
    };
    expect(await runE2e([{ file: "t.e2e.ts", test }], {}, f.deps)).toBe(1);
    expect(f.cli).toEqual(["setup", "cleanup"]);
    expect(f.printed).toContain("    ✗ check threw: bad check");
  });

  test("a case whose check records nothing fails, saying so", async () => {
    const f = fake([[answering("x")]]);
    const test: E2eTest = { cases: [{ name: "c", turns: ["q"], check: () => {} }] };
    expect(await runE2e([{ file: "t.e2e.ts", test }], {}, f.deps)).toBe(1);
    expect(f.printed).toContain("    ✗ the case made no checks");
  });

  test("a turn spanning lines is refused: the REPL reads one line per turn", async () => {
    const f = fake([[answering("x")]]);
    const test: E2eTest = { cases: [{ name: "c", turns: ["one\ntwo"], check: () => {} }] };
    expect(await runE2e([{ file: "t.e2e.ts", test }], {}, f.deps)).toBe(1);
    expect(f.printed).toContain("    ✗ run failed: a turn must be one line (the REPL reads one line per turn)");
  });

  test("the report holds every run's turns and checks", async () => {
    const f = fake([[answering("CS", [{ tool: "jiraCommand", command: "x --select y" }])]]);
    await runE2e([{ file: "t.e2e.ts", test: ONE_CASE }], {}, f.deps);
    expect(f.reports).toEqual([
      [
        {
          file: "t.e2e.ts",
          case: "project key",
          passed: true,
          runs: [
            {
              ok: true,
              turns: [{ calls: [{ tool: "jiraCommand", input: { command: "x --select y" }, output: { ok: true }, ok: true }], answer: "CS", seconds: 2 }],
              checks: [
                { label: "--select everywhere", ok: true },
                { label: "answer matches /\\bCS\\b/", ok: true },
              ],
            },
          ],
        },
      ],
    ]);
  });
});
