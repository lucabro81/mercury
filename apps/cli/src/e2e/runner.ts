/**
 * Runs e2e tests against an app: for each case (as many times as it
 * repeats), a fresh REPL session gets the case's turns, the checks run on
 * what each turn did, and every check is printed; the exit code says whether
 * every case passed enough runs. The session, the container commands and the
 * report's destination are injected (`session.ts` and `commands.ts` hold the
 * real ones), so the tests drive the runner with scripted turns.
 */
import { CATALOG } from "../catalog.ts";
import type { Context, E2eCase, E2eTest, Run, Turn } from "./define.ts";
import { turnFromDump } from "./dump.ts";
import { createExpect, type Check } from "./expect.ts";

/** A REPL session in the app: `turn` sends one line and resolves with what
 * `/dump` wrote for it and what the REPL printed meanwhile. */
export type Session = {
  turn: (line: string) => Promise<{ dump: unknown; output: string }>;
  close: () => Promise<void>;
};

export type RunnerDeps = {
  openSession: () => Promise<Session>;
  cli: Context["cli"];
  /** The app's dependencies, to check the test's plugins and channels against. */
  appPackages: Record<string, string>;
  print: (line: string) => void;
  /** Milliseconds, for each turn's duration. */
  now: () => number;
  writeReport: (report: CaseReport[]) => Promise<void>;
};

/** One run of a case, as the report keeps it. */
export type RunReport = { ok: boolean; turns: Turn[]; checks: Check[] };
export type CaseReport = { file: string; case: string; passed: boolean; runs: RunReport[] };

/** The prompt the REPL prints after a reply, with its context-usage suffix. */
const PROMPT = /(\[[^\]\n]*\] )?> $/;

/** A turn's printed output as an answer: no styling, no trailing prompt. */
function answerFromOutput(output: string): string {
  return output.replace(/\u001b\[[0-9;]*m/g, "").replace(PROMPT, "").trim();
}

/** The test's plugins and channels the app doesn't depend on, as a message, or undefined. */
function missing(test: E2eTest, packages: Record<string, string>): string | undefined {
  const wanted = [
    ...(test.plugins ?? []).map((id) => ({ id, kind: "tool" as const, word: "plugin" })),
    ...(test.channels ?? []).map((id) => ({ id, kind: "channel" as const, word: "channel" })),
  ];
  const lacking = wanted.flatMap(({ id, kind, word }) => {
    const pkg = CATALOG.find((e) => e.kind === kind && e.id === id)?.package;
    if (pkg === undefined) return [`${word} ${id} (not in the catalog)`];
    return packages[pkg] === undefined ? [`${word} ${id} (${pkg})`] : [];
  });
  return lacking.length > 0 ? `the app lacks what the test needs: ${lacking.join(", ")}` : undefined;
}

/** Runs the tests in `tests` (each with the file it came from); returns the
 * exit code: 0 when every case passed enough runs. `repeat` overrides each
 * case's own. */
export async function runE2e(
  tests: Array<{ file: string; test: E2eTest }>,
  opts: { repeat?: number },
  deps: RunnerDeps,
): Promise<number> {
  const report: CaseReport[] = [];
  let code = 0;
  for (const { file, test } of tests) {
    deps.print(file);
    const lacking = missing(test, deps.appPackages);
    if (lacking !== undefined) {
      deps.print(`  ${lacking}`);
      code = 1;
      continue;
    }
    for (const c of test.cases) {
      const result = await runCase(c, opts.repeat, deps);
      report.push({ file, case: c.name, ...result });
      if (!result.passed) code = 1;
    }
  }
  await deps.writeReport(report);
  return code;
}

/** Runs one case as many times as it repeats, printing each run's checks and the verdict. */
async function runCase(c: E2eCase, repeatOverride: number | undefined, deps: RunnerDeps): Promise<{ passed: boolean; runs: RunReport[] }> {
  const repeat = repeatOverride ?? c.repeat ?? 1;
  const minPasses = Math.min(c.minPasses ?? repeat, repeat);
  deps.print(`  ${c.name}`);
  const runs: RunReport[] = [];
  for (let i = 1; i <= repeat; i++) {
    if (repeat > 1) deps.print(`    run ${i}/${repeat}`);
    const run = await runOnce(c, deps);
    const indent = repeat > 1 ? "      " : "    ";
    for (const check of run.checks) {
      deps.print(`${indent}${check.ok ? "✓" : "✗"} ${check.label}${check.ok || check.detail === undefined ? "" : `: ${check.detail}`}`);
    }
    runs.push(run);
  }
  const passes = runs.filter((r) => r.ok).length;
  const passed = passes >= minPasses;
  deps.print(
    repeat > 1
      ? `  ${c.name}: ${passes}/${repeat} runs passed (needs ${minPasses})${passed ? "" : " FAILED"}`
      : `  ${c.name}: ${passed ? "passed" : "FAILED"}`,
  );
  return { passed, runs };
}

/** One run of a case in a fresh session: `before`, the turns, the checks, `after`. */
async function runOnce(c: E2eCase, deps: RunnerDeps): Promise<RunReport> {
  const ctx: Context = { cli: deps.cli };
  const turns: Turn[] = [];
  let checks: Check[] = [];
  try {
    await c.before?.(ctx);
    const session = await deps.openSession();
    try {
      for (const next of c.turns) {
        const line = typeof next === "string" ? next : next(turns.at(-1)!);
        if (line.includes("\n")) throw new Error("a turn must be one line (the REPL reads one line per turn)");
        const start = deps.now();
        const { dump, output } = await session.turn(line);
        const seconds = (deps.now() - start) / 1000;
        const data = turnFromDump(dump);
        const answer = data.calls.length === 0 && data.answer === "" ? answerFromOutput(output) : data.answer;
        turns.push({ calls: data.calls, answer, seconds });
      }
    } finally {
      await session.close();
    }
    const run: Run = { turns, last: turns.at(-1)! };
    const recorder = createExpect(run);
    try {
      await c.check(run, recorder.expect, ctx);
      checks = recorder.checks();
      // A case that checks nothing proves nothing.
      if (checks.length === 0) checks = [{ label: "the case made no checks", ok: false }];
    } catch (err) {
      checks = [...recorder.checks(), { label: `check threw: ${err instanceof Error ? err.message : String(err)}`, ok: false }];
    }
  } catch (err) {
    checks = [{ label: `run failed: ${err instanceof Error ? err.message : String(err)}`, ok: false }];
  } finally {
    try {
      await c.after?.(ctx);
    } catch (err) {
      checks = [...checks, { label: `after threw: ${err instanceof Error ? err.message : String(err)}`, ok: false }];
    }
  }
  return { ok: checks.every((ch) => ch.ok), turns, checks };
}
