/**
 * The shape of an e2e test, as a test file imports it
 * (`import { e2e } from "@mercury-fw/cli/e2e"`): the plugins and channels the
 * app must have, and cases of turns sent to the app's real model through its
 * REPL, each with checks on the calls it made and the answer it gave.
 * `mfw e2e` runs them (`runner.ts`).
 */
import type { Call, TurnData } from "./dump.ts";

export type { Call } from "./dump.ts";

/** One turn as a check sees it: its calls, its answer, how long it took. */
export type Turn = TurnData & { seconds: number };

/** A case's run: every turn in order, and the last one. */
export type Run = { turns: Turn[]; last: Turn };

/** Runs `command` in the app's container (`sh -c`), outside the model:
 * preparing data, reading what a turn changed, cleaning up. */
export type Cli = (command: string) => Promise<{ code: number; output: string }>;

/** What `before`, `after` and `check` can reach besides the run. */
export type Context = { cli: Cli };

/** The checks a case makes. Call helpers look at every turn's calls, answer
 * helpers at the last answer; each records a named check and never throws,
 * so a case reports every failure at once. */
export type Expect = {
  /** At least one call to `tool`, matching `match` when given. */
  call(tool: string, match?: (call: Call) => boolean, label?: string): void;
  /** Every call to `tool` matches `match` (and there is at least one). */
  everyCall(tool: string, match: (call: Call) => boolean, label?: string): void;
  /** No call failed or went without a result. */
  noFailedCalls(label?: string): void;
  /** The number of calls, to every tool or to `tool`, within the bounds. */
  callCount(bounds: { min?: number; max?: number }, tool?: string, label?: string): void;
  /** The answer contains `pattern`, or matches it. */
  answer(pattern: string | RegExp, label?: string): void;
  /** The answer doesn't contain `pattern`, or doesn't match it. */
  answerNot(pattern: string | RegExp, label?: string): void;
  /** Anything else. */
  that(label: string, condition: boolean): void;
};

/** One case: the turns sent, in one REPL session, and the checks on them. */
export type E2eCase = {
  name: string;
  /** A message, or a function of the turn before (a follow-up, a confirmation token). */
  turns: Array<string | ((previous: Turn) => string)>;
  /** How many times to run it (the model isn't deterministic); default 1. */
  repeat?: number;
  /** How many runs must pass; default every one. */
  minPasses?: number;
  before?: (ctx: Context) => unknown;
  after?: (ctx: Context) => unknown;
  check: (run: Run, expect: Expect, ctx: Context) => unknown;
};

/** An e2e test: what the app must have, and its cases. */
export type E2eTest = {
  /** Catalog ids of the tool plugins the app must have (`jira`, …). */
  plugins?: string[];
  /** Catalog ids of the channels the app must have (`http`, …). */
  channels?: string[];
  cases: E2eCase[];
};

/** Declares an e2e test: the identity, there for the types. */
export function e2e(test: E2eTest): E2eTest {
  return test;
}
