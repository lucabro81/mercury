/**
 * The commands that operate an app (`mfw start`, `mfw vault`, …): each one is
 * a short sequence of `docker compose` calls run from the app's folder, so the
 * docker details live here and not in every app. The command line is parsed
 * and validated before any of this runs (`program.ts`); what runs a command is
 * injected (`AppDeps`), which is how the tests see the exact calls.
 */
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

const COMPOSE = ["docker", "compose"];

/** The app's service, the one the image builds. */
const SERVICE = "mercury";

/** The core's maintenance CLIs, from the container's working directory (the
 * app's folder, where node_modules/@mercury-fw/core is). A path and not a bin:
 * a monorepo image installs before copying the sources, and Bun doesn't link a
 * bin whose file isn't there yet. The core moves in lockstep with this CLI. */
export const VAULT_CLI = "node_modules/@mercury-fw/core/src/wiki/vault-cli.ts";
export const MEMORY_CLI = "node_modules/@mercury-fw/core/src/memory/memory-cli.ts";

/** What `mfw reset` can wipe: the compose service using the volume, the
 * volume's key in the compose file, and how to say what's lost. */
export const RESET_TARGETS = {
  memory: { service: "qdrant", volume: "qdrant-data", what: "Layer-3 memory (every Qdrant collection)" },
  wiki: { service: SERVICE, volume: "wiki-vault", what: "the wiki vault (every note)" },
} as const;
export type ResetTarget = keyof typeof RESET_TARGETS;

/** The compose calls that build and start the app; `recreate` restarts containers even when nothing changed. */
function startCalls(noCache: boolean, recreate: boolean): string[][] {
  const up = [...COMPOSE, "up", "-d", ...(noCache ? [] : ["--build"]), ...(recreate ? ["--force-recreate"] : [])];
  return noCache ? [[...COMPOSE, "build", "--no-cache"], up] : [up];
}

/** The commands bound to `app`, each returning its exit code. */
export function appCommands(app: App, deps: AppDeps) {
  /** Runs `calls` in order from the app's folder, stopping at the first that fails; returns its exit code, 0 if none did. */
  const runAll = async (calls: string[][]): Promise<number> => {
    for (const argv of calls) {
      const code = await deps.run(argv, { cwd: app.dir });
      if (code !== 0) return code;
    }
    return 0;
  };
  const oneOff = (argv: string[]) => runAll([[...COMPOSE, "run", "--rm", "-T", SERVICE, ...argv]]);

  return {
    start: ({ noCache }: { noCache: boolean }) => runAll(startCalls(noCache, false)),
    restart: ({ noCache }: { noCache: boolean }) => runAll(startCalls(noCache, true)),
    stop: () => runAll([[...COMPOSE, "down"]]),
    logs: (service?: string) => runAll([[...COMPOSE, "logs", "-f", ...(service === undefined ? [] : [service])]]),
    repl: () => runAll([[...COMPOSE, "run", "--rm", SERVICE, "bun", "run", "repl"]]),
    shell: async () => {
      const running = (await deps.capture([...COMPOSE, "ps", "--status", "running", "--services"], { cwd: app.dir }))
        .split("\n")
        .map((s) => s.trim());
      const shell = running.includes(SERVICE) ? ["exec", SERVICE, "bash"] : ["run", "--rm", SERVICE, "bash"];
      return runAll([[...COMPOSE, ...shell]]);
    },
    /** `args` is the vault CLI's own command line (`list`, `read <path>`, …). */
    vault: (args: string[]) => oneOff(["bun", VAULT_CLI, ...args]),
    /** `args` is the memory CLI's own command line (`list`, `read <collection>`, …). */
    memory: (args: string[]) => oneOff(["bun", MEMORY_CLI, ...args]),
    /** Deletes `target`'s volume once the user types the app's name, then
     * brings its service back up on an empty volume. The volume's real name
     * comes from the compose file, and a wrong answer deletes nothing. */
    reset: async (target: ResetTarget) => {
      const { service, volume: key, what } = RESET_TARGETS[target];
      const config = JSON.parse(
        await deps.capture([...COMPOSE, "config", "--no-interpolate", "--format", "json"], { cwd: app.dir }),
      ) as { volumes?: Record<string, { name?: string }> };
      const volume = config.volumes?.[key]?.name;
      if (volume === undefined) {
        throw new Error(`The compose file has no "${key}" volume to reset`);
      }
      const answer = await deps.ask(`This deletes ${what} for good: volume ${volume}. Type the app's name (${app.name}) to confirm: `);
      if (answer.trim() !== app.name) {
        deps.print("Not confirmed: nothing deleted.");
        return 1;
      }
      return runAll([
        [...COMPOSE, "stop", service],
        [...COMPOSE, "rm", "-f", service],
        ["docker", "volume", "rm", volume],
        [...COMPOSE, "up", "-d", service],
      ]);
    },
  };
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
