/**
 * The checks a test case makes on a run: each helper records a named, passed
 * or failed check and never throws, so a case reports every failure at once.
 * Call helpers look at every turn's calls; answer helpers at the last answer.
 */
import { describe, expect, test } from "bun:test";
import type { Call } from "./dump.ts";
import type { Run, Turn } from "./define.ts";
import { createExpect } from "./expect.ts";

const call = (tool: string, input: unknown, ok = true): Call => ({ tool, input, output: { ok }, ok, pending: false });
const turn = (calls: Call[], answer: string): Turn => ({ calls, answer, seconds: 1 });
const runOf = (...turns: Turn[]): Run => ({ turns, last: turns.at(-1)! });

const RUN = runOf(
  turn([call("read_skill", { name: "jira" })], "Loading."),
  turn(
    [
      call("jiraCommand", { command: "jira project search --query support --select values.key" }),
      call("jiraCommand", { command: "jira user search --query Brognara" }, false),
    ],
    "The key is CS.",
  ),
);
const hasSelect = (c: Call) => String((c.input as { command?: string }).command).includes("--select ");

describe("createExpect", () => {
  test("everyCall: passes when every call to the tool matches, fails naming the first that doesn't", () => {
    const passing = createExpect(runOf(turn([call("jiraCommand", { command: "x --select a" })], "")));
    passing.expect.everyCall("jiraCommand", hasSelect, "every jira call has --select");
    expect(passing.checks()).toEqual([{ label: "every jira call has --select", ok: true }]);

    const failing = createExpect(RUN);
    failing.expect.everyCall("jiraCommand", hasSelect, "every jira call has --select");
    expect(failing.checks()).toEqual([
      { label: "every jira call has --select", ok: false, detail: 'jiraCommand {"command":"jira user search --query Brognara"}' },
    ]);
  });

  test("everyCall with no call to the tool fails: nothing to vouch for", () => {
    const e = createExpect(runOf(turn([], "")));
    e.expect.everyCall("jiraCommand", hasSelect);
    expect(e.checks()).toEqual([{ label: "every jiraCommand call matches", ok: false, detail: "no jiraCommand call" }]);
  });

  test("call: at least one call to the tool, matching when a match is given", () => {
    const e = createExpect(RUN);
    e.expect.call("read_skill");
    e.expect.call("jiraCommand", (c) => String((c.input as { command: string }).command).startsWith("jira project search"), "searched the project");
    e.expect.call("present");
    expect(e.checks()).toEqual([
      { label: "a read_skill call", ok: true },
      { label: "searched the project", ok: true },
      { label: "a present call", ok: false, detail: "calls: read_skill, jiraCommand, jiraCommand" },
    ]);
  });

  test("noFailedCalls: names the failed ones", () => {
    const e = createExpect(RUN);
    e.expect.noFailedCalls();
    expect(e.checks()).toEqual([{ label: "no failed calls", ok: false, detail: 'jiraCommand {"command":"jira user search --query Brognara"}' }]);
  });

  test("callCount: across every turn, or one tool's, within the bounds", () => {
    const e = createExpect(RUN);
    e.expect.callCount({ max: 3 });
    e.expect.callCount({ max: 1 }, "jiraCommand");
    e.expect.callCount({ min: 1, max: 1 }, "read_skill");
    expect(e.checks()).toEqual([
      { label: "at most 3 calls", ok: true },
      { label: "at most 1 jiraCommand call", ok: false, detail: "2" },
      { label: "1 to 1 read_skill call", ok: true },
    ]);
  });

  test("answer and answerNot: the last answer, by text or pattern", () => {
    const e = createExpect(RUN);
    e.expect.answer(/\bCS\b/);
    e.expect.answer("Loading");
    e.expect.answerNot("token");
    expect(e.checks()).toEqual([
      { label: "answer matches /\\bCS\\b/", ok: true },
      { label: 'answer contains "Loading"', ok: false, detail: "The key is CS." },
      { label: 'answer doesn\'t contain "token"', ok: true },
    ]);
  });

  test("that: anything else, by label", () => {
    const e = createExpect(RUN);
    e.expect.that("two turns", RUN.turns.length === 2);
    e.expect.that("three turns", RUN.turns.length === 3);
    expect(e.checks()).toEqual([
      { label: "two turns", ok: true },
      { label: "three turns", ok: false },
    ]);
  });
});
