/**
 * What `mfw create` does once the app's files are written: `bun install`, then
 * a git repository on `main` with a first commit and, when given, its origin
 * (never pushed: that stays the user's). Every step is best effort: a failure
 * never undoes what came before, and the report says what happened, which
 * `finishMessage` turns into the command's last words, next steps included.
 */

/** Runs `argv` in `cwd`; resolves with its exit code and its output (stdout
 * and stderr together), or with an empty output when `live` sends it straight
 * to the terminal. A missing binary resolves with a non-zero code. */
export type Run = (argv: string[], cwd: string, opts?: { live?: boolean }) => Promise<{ code: number; output: string }>;

/** Why git is skipped for an app created inside another repository: on
 * purpose, so there's nothing to finish by hand. */
export const INSIDE_A_REPOSITORY = "the folder is already inside a git repository";

/** What to do after writing: `remote` is taken as typed. */
export type FinishOptions = {
  install: boolean;
  git: boolean;
  remote?: string;
  /** The first commit's message, one `-m` per paragraph. */
  commitMessage: string[];
};

/** A step that ran (`done`), wasn't asked for (`off`), was skipped with a
 * reason, or failed with the command's output. */
type Outcome = "done" | "off" | { failed: string };

export type FinishReport = {
  install: Outcome;
  git: Outcome | { skipped: string };
  remote: Outcome;
};

/** The real runner: a child process with its output captured. */
export const spawnRun: Run = async (argv, cwd, opts) => {
  try {
    if (opts?.live) {
      const proc = Bun.spawn(argv, { cwd, stdin: "ignore", stdout: "inherit", stderr: "inherit" });
      return { code: await proc.exited, output: "" };
    }
    const proc = Bun.spawn(argv, { cwd, stdin: "ignore", stdout: "pipe", stderr: "pipe" });
    const [stdout, stderr, code] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
      proc.exited,
    ]);
    return { code, output: stdout + stderr };
  } catch (err) {
    return { code: 127, output: err instanceof Error ? err.message : String(err) };
  }
};

/** Runs the steps after writing the app in `dir`; see the file's comment. */
export async function finishApp(dir: string, opts: FinishOptions, run: Run): Promise<FinishReport> {
  const report: FinishReport = { install: "off", git: "off", remote: "off" };
  if (opts.install) {
    // Live: an install can take a while, and its progress is worth seeing.
    const installed = await run(["bun", "install"], dir, { live: true });
    report.install = installed.code === 0 ? "done" : { failed: `exit code ${installed.code}` };
  }
  if (!opts.git) return report;

  const skipped = await whyNoGit(dir, run);
  if (skipped !== undefined) {
    report.git = { skipped };
    return report;
  }
  const commit = opts.commitMessage.flatMap((paragraph) => ["-m", paragraph]);
  const steps: [label: string, argv: string[]][] = [
    ["git init", ["git", "init", "-q", "-b", "main"]],
    ["git add -A", ["git", "add", "-A"]],
    ["git commit", ["git", "commit", "-q", ...commit]],
  ];
  for (const [label, argv] of steps) {
    const step = await run(argv, dir);
    if (step.code !== 0) {
      report.git = { failed: `${label}: ${step.output.trim()}` };
      return report;
    }
  }
  report.git = "done";

  if (opts.remote !== undefined) {
    const added = await run(["git", "remote", "add", "origin", opts.remote], dir);
    report.remote = added.code === 0 ? "done" : { failed: added.output.trim() };
  }
  return report;
}

/** Why the repository can't be created in `dir`, or undefined when it can.
 * Whether git can commit (an identity, hooks, signing) is git's to say: the
 * commit runs, and its refusal is reported as it is. */
async function whyNoGit(dir: string, run: Run): Promise<string | undefined> {
  if ((await run(["git", "--version"], dir)).code !== 0) return "git isn't installed";
  // An app created inside a monorepo belongs to that repository, not a nested one.
  if ((await run(["git", "rev-parse", "--is-inside-work-tree"], dir)).code === 0) return INSIDE_A_REPOSITORY;
  return undefined;
}

/** `outcome` as a status line's value, or undefined for a step that was off. */
function statusOf(outcome: FinishReport[keyof FinishReport], done: string): string | undefined {
  if (outcome === "off") return undefined;
  if (outcome === "done") return done;
  if ("skipped" in outcome) return `skipped, ${outcome.skipped}`;
  return `failed (${outcome.failed})`;
}

/** The command's closing output: where the app is, what the steps after
 * writing did, and what's left to run. */
export function finishMessage(app: { name: string; dir: string; remote?: string; report: FinishReport }): string {
  const { report } = app;
  const insideRepository = typeof report.git === "object" && "skipped" in report.git && report.git.skipped === INSIDE_A_REPOSITORY;
  // A repository that git didn't finish (not installed, a step refused) is
  // finished by hand; one skipped on purpose isn't.
  const byHand = report.git !== "done" && report.git !== "off" && !insideRepository;
  const status = [
    ["bun install", statusOf(report.install, "done")],
    ["git", statusOf(report.git, "first commit on main")],
    ["origin", insideRepository && app.remote !== undefined ? "not added, the app is in that repository" : statusOf(report.remote, app.remote ?? "")],
  ].flatMap(([step, value]) => (value === undefined ? [] : [`  ${step}: ${value}\n`]));

  const next = [`cd ${app.dir}`];
  if (report.install !== "done") next.push("bun install");
  if (byHand) {
    next.push("git init -b main", "git add -A", 'git commit -m "Scaffold with mfw create"');
    if (app.remote !== undefined) next.push(`git remote add origin ${app.remote}`);
  } else if (report.git === "done") {
    if (report.install !== "done") next.push('git add bun.lock && git commit -m "Add bun.lock"');
    if (app.remote !== undefined && report.remote !== "done") next.push(`git remote add origin ${app.remote}`);
  }
  next.push("cp .env.example .env    # then fill it in", "mfw start               # bunx mfw start, without a global mfw");
  if (report.git === "done" && report.remote === "done") next.push("git push -u origin main");

  return `Created ${app.name} in ${app.dir}
${status.join("")}
Next:
${next.map((line) => `  ${line}\n`).join("")}
Optional, to have mfw everywhere:
  bun add -g @mercury-fw/cli
`;
}
