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
export const APP_COMMANDS = ["start", "stop", "restart", "logs", "repl", "shell", "vault", "memory", "reset"] as const;
export type AppCommand = (typeof APP_COMMANDS)[number];

const COMPOSE = ["docker", "compose"];

/** The app's service, the one the image builds. */
const SERVICE = "mercury";

/** The core's maintenance CLIs, from the container's working directory (the
 * app's folder, where node_modules/@mercury-fw/core is). A path and not a bin:
 * a monorepo image installs before copying the sources, and Bun doesn't link a
 * bin whose file isn't there yet. The core moves in lockstep with this CLI. */
const VAULT_CLI = "node_modules/@mercury-fw/core/src/wiki/vault-cli.ts";
const MEMORY_CLI = "node_modules/@mercury-fw/core/src/memory/memory-cli.ts";

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

/** What `mfw reset` can wipe: the compose service using the volume, the
 * volume's key in the compose file, and how to say what's lost. */
const RESET_TARGETS = {
  memory: { service: "qdrant", volume: "qdrant-data", what: "Layer-3 memory (every Qdrant collection)" },
  wiki: { service: SERVICE, volume: "wiki-vault", what: "the wiki vault (every note)" },
} as const;

/** `mfw reset <memory|wiki>`: deletes the target's volume once the user types
 * the app's name, then brings its service back up on an empty volume. The
 * volume's real name comes from the compose file, and a wrong answer deletes
 * nothing. */
async function reset(args: string[], app: App, deps: AppDeps): Promise<number> {
  const { positionals } = parseArgs({ args, options: {}, allowPositionals: true });
  const key = positionals[0];
  if (positionals.length !== 1 || (key !== "memory" && key !== "wiki")) {
    throw new Error(`reset takes one of: ${Object.keys(RESET_TARGETS).join(", ")}`);
  }
  const target = RESET_TARGETS[key];
  const config = JSON.parse(
    await deps.capture([...COMPOSE, "config", "--no-interpolate", "--format", "json"], { cwd: app.dir }),
  ) as { volumes?: Record<string, { name?: string }> };
  const volume = config.volumes?.[target.volume]?.name;
  if (volume === undefined) {
    throw new Error(`The compose file has no "${target.volume}" volume to reset`);
  }
  const answer = await deps.ask(
    `This deletes ${target.what} for good: volume ${volume}. Type the app's name (${app.name}) to confirm: `,
  );
  if (answer.trim() !== app.name) {
    deps.print("Not confirmed: nothing deleted.");
    return 1;
  }
  return runAll(
    [
      [...COMPOSE, "stop", target.service],
      [...COMPOSE, "rm", "-f", target.service],
      ["docker", "volume", "rm", volume],
      [...COMPOSE, "up", "-d", target.service],
    ],
    app,
    deps,
  );
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
      // The core's CLIs check their own subcommands and arguments.
      return runAll([[...COMPOSE, "run", "--rm", "-T", SERVICE, "bun", VAULT_CLI, ...args]], app, deps);
    case "memory":
      return runAll([[...COMPOSE, "run", "--rm", "-T", SERVICE, "bun", MEMORY_CLI, ...args]], app, deps);
    case "reset":
      return reset(args, app, deps);
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
