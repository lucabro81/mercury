/**
 * The commands that operate an app (`mfw start`, `mfw vault`, …): each one is
 * a short sequence of `docker compose` calls run from the app's folder, so the
 * docker details live here and not in every app. What runs a command is
 * injected (`AppDeps`), which is how the tests see the exact calls.
 */
import { parseArgs } from "node:util";
import type { App } from "./find-app.ts";

export type AppDeps = {
  /** Runs `argv` in `cwd` on the user's terminal (stdin, stdout, stderr) and returns its exit code. */
  run: (argv: string[], opts: { cwd: string }) => Promise<number>;
  /** Runs `argv` in `cwd` and returns its stdout; throws when it fails. */
  capture: (argv: string[], opts: { cwd: string }) => Promise<string>;
  /** Asks the user `question` and returns the answer as typed. */
  ask: (question: string) => Promise<string>;
  /** Tells the user something. */
  print: (line: string) => void;
};

/** The names of the app commands, as `mfw` dispatches them. */
export const APP_COMMANDS = ["start", "stop", "restart", "logs", "repl", "shell", "vault", "memory"] as const;
export type AppCommand = (typeof APP_COMMANDS)[number];

const COMPOSE = ["docker", "compose"];

/** The app's service, the one the image builds. */
const SERVICE = "mercury";

/** `args` parsed as `--no-cache` and nothing else. */
function noCacheFlag(args: string[]): boolean {
  const { values } = parseArgs({ args, options: { "no-cache": { type: "boolean", default: false } } });
  return values["no-cache"] as boolean;
}

/** The compose calls that build and start the app; `recreate` restarts containers even when nothing changed. */
function startCalls(noCache: boolean, recreate: boolean): string[][] {
  const up = [...COMPOSE, "up", "-d", ...(noCache ? [] : ["--build"]), ...(recreate ? ["--force-recreate"] : [])];
  return noCache ? [[...COMPOSE, "build", "--no-cache"], up] : [up];
}

/** Runs `calls` in order from the app's folder, stopping at the first that fails; returns its exit code, 0 if none did. */
async function runAll(calls: string[][], app: App, deps: AppDeps): Promise<number> {
  for (const argv of calls) {
    const code = await deps.run(argv, { cwd: app.dir });
    if (code !== 0) return code;
  }
  return 0;
}

/** Runs the app command `command` with `args` on `app`; returns the exit code.
 * Throws on arguments it can't take, before running anything. */
export async function runAppCommand(command: AppCommand, args: string[], app: App, deps: AppDeps): Promise<number> {
  switch (command) {
    case "start":
      return runAll(startCalls(noCacheFlag(args), false), app, deps);
    case "restart":
      return runAll(startCalls(noCacheFlag(args), true), app, deps);
    case "stop":
      parseArgs({ args, options: {} });
      return runAll([[...COMPOSE, "down"]], app, deps);
    case "logs": {
      const { positionals } = parseArgs({ args, options: {}, allowPositionals: true });
      return runAll([[...COMPOSE, "logs", "-f", ...positionals]], app, deps);
    }
    case "repl":
      parseArgs({ args, options: {} });
      return runAll([[...COMPOSE, "run", "--rm", SERVICE, "bun", "run", "repl"]], app, deps);
    case "shell": {
      parseArgs({ args, options: {} });
      const running = (await deps.capture([...COMPOSE, "ps", "--status", "running", "--services"], { cwd: app.dir }))
        .split("\n")
        .map((s) => s.trim());
      const shell = running.includes(SERVICE) ? ["exec", SERVICE, "bash"] : ["run", "--rm", SERVICE, "bash"];
      return runAll([[...COMPOSE, ...shell]], app, deps);
    }
    case "vault":
      // mercury-vault checks its own subcommands and arguments.
      return runAll([[...COMPOSE, "run", "--rm", "-T", SERVICE, "bun", "run", "mercury-vault", ...args]], app, deps);
    case "memory":
      return runAll([[...COMPOSE, "run", "--rm", "-T", SERVICE, "bun", "run", "mercury-memory", ...args]], app, deps);
  }
}

/** The real deps: docker on the user's terminal, questions on stdin. */
export function terminalDeps(): AppDeps {
  return {
    run: async (argv, { cwd }) => {
      const proc = Bun.spawn(argv, { cwd, stdin: "inherit", stdout: "inherit", stderr: "inherit" });
      return await proc.exited;
    },
    capture: async (argv, { cwd }) => {
      const proc = Bun.spawn(argv, { cwd, stdin: "ignore", stdout: "pipe", stderr: "inherit" });
      const [out, code] = await Promise.all([new Response(proc.stdout).text(), proc.exited]);
      if (code !== 0) throw new Error(`${argv.join(" ")} failed (exit ${code})`);
      return out;
    },
    ask: async (question) => {
      const { createInterface } = await import("node:readline/promises");
      const rl = createInterface({ input: process.stdin, output: process.stdout });
      try {
        return await rl.question(question);
      } finally {
        rl.close();
      }
    },
    print: (line) => console.log(line),
  };
}
