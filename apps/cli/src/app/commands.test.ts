/**
 * The app commands as the docker compose calls they make, in order, from the
 * app's folder: the exact argv of each call, what a failing call does to the
 * rest, and the exit code that comes back.
 */
import { describe, expect, test } from "bun:test";
import { runAppCommand, type AppDeps } from "./commands.ts";

const APP = { dir: "/apps/my-agent", name: "my-agent" };

/** Deps that record every call; `codes` are the exit codes of the successive
 * `run` calls (0 past the end), `captured` what each `capture` returns. */
function fake({ codes = [], captured = {} }: { codes?: number[]; captured?: Record<string, string> } = {}) {
  const calls: Array<{ kind: "run" | "capture"; argv: string[]; cwd: string }> = [];
  const deps: AppDeps = {
    run: async (argv, { cwd }) => {
      calls.push({ kind: "run", argv, cwd });
      return codes.shift() ?? 0;
    },
    capture: async (argv, { cwd }) => {
      calls.push({ kind: "capture", argv, cwd });
      return captured[argv.join(" ")] ?? "";
    },
    ask: async () => "",
    print: () => {},
  };
  return { deps, calls, runs: () => calls.filter((c) => c.kind === "run").map((c) => c.argv) };
}

describe("lifecycle", () => {
  test("start builds what changed and starts in the background", async () => {
    const f = fake();
    expect(await runAppCommand("start", [], APP, f.deps)).toBe(0);
    expect(f.runs()).toEqual([["docker", "compose", "up", "-d", "--build"]]);
    expect(f.calls.every((c) => c.cwd === APP.dir)).toBe(true);
  });

  test("start --no-cache rebuilds from scratch, then starts", async () => {
    const f = fake();
    expect(await runAppCommand("start", ["--no-cache"], APP, f.deps)).toBe(0);
    expect(f.runs()).toEqual([
      ["docker", "compose", "build", "--no-cache"],
      ["docker", "compose", "up", "-d"],
    ]);
  });

  test("a failed build stops there, with its exit code", async () => {
    const f = fake({ codes: [17] });
    expect(await runAppCommand("start", ["--no-cache"], APP, f.deps)).toBe(17);
    expect(f.runs()).toEqual([["docker", "compose", "build", "--no-cache"]]);
  });

  test("restart recreates the containers even when nothing changed", async () => {
    const f = fake();
    await runAppCommand("restart", [], APP, f.deps);
    expect(f.runs()).toEqual([["docker", "compose", "up", "-d", "--build", "--force-recreate"]]);
  });

  test("restart --no-cache", async () => {
    const f = fake();
    await runAppCommand("restart", ["--no-cache"], APP, f.deps);
    expect(f.runs()).toEqual([
      ["docker", "compose", "build", "--no-cache"],
      ["docker", "compose", "up", "-d", "--force-recreate"],
    ]);
  });

  test("stop", async () => {
    const f = fake();
    await runAppCommand("stop", [], APP, f.deps);
    expect(f.runs()).toEqual([["docker", "compose", "down"]]);
  });

  test("an unknown option is an error, and nothing runs", async () => {
    const f = fake();
    await expect(runAppCommand("start", ["--nocache"], APP, f.deps)).rejects.toThrow("--nocache");
    expect(f.calls).toEqual([]);
  });
});

describe("logs, repl, shell", () => {
  test("logs follows every service, or the one named", async () => {
    const f = fake();
    await runAppCommand("logs", [], APP, f.deps);
    await runAppCommand("logs", ["qdrant"], APP, f.deps);
    expect(f.runs()).toEqual([
      ["docker", "compose", "logs", "-f"],
      ["docker", "compose", "logs", "-f", "qdrant"],
    ]);
  });

  test("repl opens the dev REPL in a one-off container", async () => {
    const f = fake();
    await runAppCommand("repl", [], APP, f.deps);
    expect(f.runs()).toEqual([["docker", "compose", "run", "--rm", "mercury", "bun", "run", "repl"]]);
  });

  test("shell joins the running service", async () => {
    const f = fake({ captured: { "docker compose ps --status running --services": "qdrant\nmercury\n" } });
    await runAppCommand("shell", [], APP, f.deps);
    expect(f.runs()).toEqual([["docker", "compose", "exec", "mercury", "bash"]]);
  });

  test("shell opens a one-off container when the service isn't running", async () => {
    const f = fake({ captured: { "docker compose ps --status running --services": "qdrant\n" } });
    await runAppCommand("shell", [], APP, f.deps);
    expect(f.runs()).toEqual([["docker", "compose", "run", "--rm", "mercury", "bash"]]);
  });
});

describe("vault and memory", () => {
  test("vault passes its subcommand and arguments to mercury-vault in a one-off container", async () => {
    const f = fake();
    await runAppCommand("vault", ["write-curated", "curated/x.md", "--author", "luca"], APP, f.deps);
    expect(f.runs()).toEqual([
      ["docker", "compose", "run", "--rm", "-T", "mercury", "bun", "run", "mercury-vault", "write-curated", "curated/x.md", "--author", "luca"],
    ]);
  });

  test("memory passes its subcommand and arguments to mercury-memory", async () => {
    const f = fake();
    await runAppCommand("memory", ["read", "episodic_memory", "--limit", "5"], APP, f.deps);
    expect(f.runs()).toEqual([
      ["docker", "compose", "run", "--rm", "-T", "mercury", "bun", "run", "mercury-memory", "read", "episodic_memory", "--limit", "5"],
    ]);
  });

  test("the container's exit code comes back", async () => {
    const f = fake({ codes: [2] });
    expect(await runAppCommand("vault", ["read", "missing.md"], APP, f.deps)).toBe(2);
  });
});
