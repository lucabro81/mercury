/**
 * What `mfw create` does after writing the files: `bun install`, then a git
 * repository with a first commit and, when given, its origin. The commands
 * run through a fake runner, so these tests pin the order, the skips and the
 * failures without spawning anything; `main.test.ts` runs real git end to end.
 */
import { describe, expect, test } from "bun:test";
import { finishApp, finishMessage, INSIDE_A_REPOSITORY, type FinishReport, type Run } from "./finish.ts";

const DIR = "/apps/demo";
const MESSAGE = ["Scaffold with mfw create 1.2.3", "Channels: http\nPlugins: jira"];

/** A runner that records every command (`(live)` when its output goes
 * straight to the terminal) and answers from `codes`, keyed by the command
 * line (exit 0 for anything not listed). */
function fakeRun(codes: Record<string, number | { code: number; output: string }> = {}): { run: Run; calls: string[] } {
  const calls: string[] = [];
  const run: Run = async (argv, cwd, opts) => {
    const line = argv.join(" ");
    calls.push(`${cwd}: ${line}${opts?.live ? " (live)" : ""}`);
    const answer = codes[line] ?? 0;
    return typeof answer === "number" ? { code: answer, output: answer === 0 ? "" : `${argv[0]} failed` } : answer;
  };
  return { run, calls };
}

/** git answers for a folder that isn't inside a repository. */
const OUTSIDE_REPO = { "git rev-parse --is-inside-work-tree": 128 };

describe("finishApp", () => {
  test("installs with its output live, then creates the repository, commits and adds the origin, in this order", async () => {
    const { run, calls } = fakeRun(OUTSIDE_REPO);
    const report = await finishApp(DIR, { install: true, git: true, remote: "git@example.com:acme/demo.git", commitMessage: MESSAGE }, run);
    expect(report).toEqual({ install: "done", git: "done", remote: "done" });
    expect(calls).toEqual([
      `${DIR}: bun install (live)`,
      `${DIR}: git --version`,
      `${DIR}: git rev-parse --is-inside-work-tree`,
      `${DIR}: git init -q -b main`,
      `${DIR}: git add -A`,
      `${DIR}: git commit -q -m ${MESSAGE[0]} -m ${MESSAGE[1]}`,
      `${DIR}: git remote add origin git@example.com:acme/demo.git`,
    ]);
  });

  test("without a remote, adds no origin", async () => {
    const { run, calls } = fakeRun(OUTSIDE_REPO);
    const report = await finishApp(DIR, { install: true, git: true, commitMessage: MESSAGE }, run);
    expect(report).toEqual({ install: "done", git: "done", remote: "off" });
    expect(calls.some((c) => c.includes("remote"))).toBe(false);
  });

  test("--no-install and --no-git run nothing", async () => {
    const { run, calls } = fakeRun();
    const report = await finishApp(DIR, { install: false, git: false, commitMessage: MESSAGE }, run);
    expect(report).toEqual({ install: "off", git: "off", remote: "off" });
    expect(calls).toEqual([]);
  });

  test("a failed install, reported by its exit code, still commits the app without the lockfile", async () => {
    const { run, calls } = fakeRun({ ...OUTSIDE_REPO, "bun install": 1 });
    const report = await finishApp(DIR, { install: true, git: true, commitMessage: MESSAGE }, run);
    expect(report).toEqual({ install: { failed: "exit code 1" }, git: "done", remote: "off" });
    expect(calls).toContain(`${DIR}: git commit -q -m ${MESSAGE[0]} -m ${MESSAGE[1]}`);
  });

  test("skips git, saying why, when git isn't installed; the remote isn't tried", async () => {
    const { run, calls } = fakeRun({ "git --version": 127 });
    const report = await finishApp(DIR, { install: false, git: true, remote: "x", commitMessage: MESSAGE }, run);
    expect(report).toEqual({ install: "off", git: { skipped: "git isn't installed" }, remote: "off" });
    expect(calls).toEqual([`${DIR}: git --version`]);
  });

  test("skips git when the folder is already inside a repository", async () => {
    const { run, calls } = fakeRun();
    const report = await finishApp(DIR, { install: false, git: true, commitMessage: MESSAGE }, run);
    expect(report).toEqual({ install: "off", git: { skipped: INSIDE_A_REPOSITORY }, remote: "off" });
    expect(calls.some((c) => c.includes("git init"))).toBe(false);
  });

  // #103 review: an identity can come from the environment too; git decides,
  // and its own refusal is what the user reads.
  test("a refused commit (no identity, a hook) reports git's own words and stops there", async () => {
    const refusal = "Author identity unknown\n\n*** Please tell me who you are.\n";
    const { run, calls } = fakeRun({ ...OUTSIDE_REPO, [`git commit -q -m ${MESSAGE[0]} -m ${MESSAGE[1]}`]: { code: 128, output: refusal } });
    const report = await finishApp(DIR, { install: false, git: true, remote: "x", commitMessage: MESSAGE }, run);
    expect(report).toEqual({ install: "off", git: { failed: `git commit: ${refusal.trim()}` }, remote: "off" });
    expect(calls.some((c) => c.includes("remote"))).toBe(false);
  });

  test("a failed git step stops the ones after it and says which one", async () => {
    const { run, calls } = fakeRun({ ...OUTSIDE_REPO, "git add -A": { code: 1, output: "fatal: boom\n" } });
    const report = await finishApp(DIR, { install: false, git: true, remote: "x", commitMessage: MESSAGE }, run);
    expect(report).toEqual({ install: "off", git: { failed: "git add -A: fatal: boom" }, remote: "off" });
    expect(calls.at(-1)).toBe(`${DIR}: git add -A`);
  });

  test("a failed remote keeps the commit", async () => {
    const { run } = fakeRun({ ...OUTSIDE_REPO, "git remote add origin bad": { code: 3, output: "error: nope\n" } });
    const report = await finishApp(DIR, { install: false, git: true, remote: "bad", commitMessage: MESSAGE }, run);
    expect(report).toEqual({ install: "off", git: "done", remote: { failed: "error: nope" } });
  });
});

describe("finishMessage", () => {
  const TAIL = `  cp .env.example .env    # then fill it in
  mfw start               # bunx mfw start, without a global mfw`;
  const OPTIONAL = `
Optional, to have mfw everywhere:
  bun add -g @mercury-fw/cli
`;
  /** The commands that finish the repository by hand. */
  const BY_HAND = `  git init -b main
  git add -A
  git commit -m "Scaffold with mfw create"`;
  const message = (report: FinishReport, remote?: string) => finishMessage({ name: "demo", dir: DIR, remote, report });

  test("everything done: what happened, then the steps left, push included", () => {
    expect(message({ install: "done", git: "done", remote: "done" }, "git@example.com:acme/demo.git")).toBe(`Created demo in ${DIR}
  bun install: done
  git: first commit on main
  origin: git@example.com:acme/demo.git

Next:
  cd ${DIR}
${TAIL}
  git push -u origin main
${OPTIONAL}`);
  });

  test("nothing run: the steps the user does by hand, nothing to report", () => {
    expect(message({ install: "off", git: "off", remote: "off" })).toBe(`Created demo in ${DIR}

Next:
  cd ${DIR}
  bun install
${TAIL}
${OPTIONAL}`);
  });

  test("install not run but committed: install, then commit the lockfile", () => {
    for (const install of ["off", { failed: "exit code 1" }] as const) {
      const text = message({ install, git: "done", remote: "off" });
      expect(text).toContain(`Next:
  cd ${DIR}
  bun install
  git add bun.lock && git commit -m "Add bun.lock"
${TAIL}`);
    }
    expect(message({ install: { failed: "exit code 1" }, git: "done", remote: "off" })).toContain("  bun install: failed (exit code 1)\n");
  });

  test("git failed or not installed: says why, then the commands to finish by hand, the origin with them", () => {
    for (const git of [{ failed: "git commit: Author identity unknown" }, { skipped: "git isn't installed" }]) {
      const text = message({ install: "done", git, remote: "off" }, "git@example.com:acme/demo.git");
      expect(text).toContain(`Next:
  cd ${DIR}
${BY_HAND}
  git remote add origin git@example.com:acme/demo.git
${TAIL}
`);
      expect(text).not.toContain("git push");
    }
    expect(message({ install: "done", git: { failed: "git commit: Author identity unknown" }, remote: "off" })).toContain(
      "  git: failed (git commit: Author identity unknown)\n",
    );
    expect(message({ install: "done", git: { skipped: "git isn't installed" }, remote: "off" })).toContain(
      "  git: skipped, git isn't installed\n",
    );
  });

  test("git failed with the install not run: install first, so the commit holds the lockfile", () => {
    expect(message({ install: "off", git: { skipped: "git isn't installed" }, remote: "off" })).toContain(`Next:
  cd ${DIR}
  bun install
${BY_HAND}
${TAIL}
`);
  });

  test("inside another repository: no commands for git, and a remote given says it wasn't added", () => {
    const text = message({ install: "done", git: { skipped: INSIDE_A_REPOSITORY }, remote: "off" }, "x");
    expect(text).toContain(`  git: skipped, ${INSIDE_A_REPOSITORY}
  origin: not added, the app is in that repository
`);
    expect(text).toContain(`Next:
  cd ${DIR}
${TAIL}
`);
    expect(message({ install: "done", git: { skipped: INSIDE_A_REPOSITORY }, remote: "off" })).not.toContain("origin");
  });

  test("a failed origin: says why, gives the command next to the other git steps, no push", () => {
    const text = message({ install: "done", git: "done", remote: { failed: "error: nope" } }, "bad");
    expect(text).toContain("  origin: failed (error: nope)\n");
    expect(text).toContain(`Next:
  cd ${DIR}
  git remote add origin bad
${TAIL}
`);
    expect(text).not.toContain("git push");
  });
});
