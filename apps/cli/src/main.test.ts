/**
 * `mfw create` end to end, run as the real command without the wizard
 * (`--yes`): the files on disk are exactly what `renderApp` produces for the
 * same answers, and a command line that can't work exits non-zero with a
 * message saying why, writing nothing.
 */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { AppDeps } from "./app/commands.ts";
import { main } from "./main.ts";
import { renderApp } from "./render.ts";
import { cliVersion } from "./versions.ts";

const CLI = new URL("./bin.ts", import.meta.url).pathname;

/** The version the fake registry reports as `latest` for every package it's asked about. */
const PLUGIN_VERSION = "0.7.3";

/** A fake registry for the whole file: `latest` of any package is PLUGIN_VERSION. */
let registry: ReturnType<typeof Bun.serve>;
beforeAll(() => {
  registry = Bun.serve({
    port: 0,
    fetch: (req) => {
      const name = decodeURIComponent(new URL(req.url).pathname.slice(1).replace(/\/latest$/, ""));
      return Response.json({ name, version: PLUGIN_VERSION });
    },
  });
});
afterAll(() => {
  registry.stop(true);
});

let base: string;
beforeEach(() => {
  base = mkdtempSync(join(tmpdir(), "mercury-cli-create-"));
});
afterEach(() => {
  rmSync(base, { recursive: true, force: true });
});

/** Runs the CLI with `args` against the fake registry, returning its exit code
 * and output. Async, so the fake registry in this process can answer it. */
async function run(...args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  return runWith(registry.url.origin, ...args);
}

/** Runs the CLI with `args` against the registry at `registryUrl`. */
async function runWith(registryUrl: string, ...args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  // stdin closed and a timeout: a run that wrongly reaches the wizard fails
  // instead of hanging the suite.
  const proc = Bun.spawn(["bun", CLI, ...args], {
    stdin: "ignore",
    stdout: "pipe",
    stderr: "pipe",
    timeout: 10_000,
    env: { ...process.env, MFW_REGISTRY: registryUrl },
  });
  const [stdout, stderr, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  return { code, stdout, stderr };
}

/** The versions the command writes: the framework at the CLI's version, the
 * chosen plugins and channels, TypeScript and Bun's types at what the registry
 * reports. */
const versions: Record<string, string> = {
  "@mercury-fw/cli": cliVersion(),
  "@mercury-fw/core": cliVersion(),
  "@mercury-fw/formatter": cliVersion(),
  "@mercury-fw/channel-http": PLUGIN_VERSION,
  "@mercury-fw/plugin-jira": PLUGIN_VERSION,
  typescript: PLUGIN_VERSION,
  "@types/bun": PLUGIN_VERSION,
};

describe("mfw create --yes", () => {
  test("writes exactly the rendered app, named after the folder by default", async () => {
    const dir = join(base, "demo");
    const result = await run("create", dir, "--channels", "http", "--plugins", "jira", "--yes");
    expect(result.code).toBe(0);
    const expected = renderApp({
      name: "demo",
      assistantName: "Mercury",
      role: "an internal assistant",
      channels: ["http"],
      plugins: ["jira"],
      versions,
    });
    for (const [path, content] of expected) {
      expect(readFileSync(join(dir, path), "utf-8"), path).toBe(content);
    }
    expect(result.stdout).toContain(dir);
  });

  test("an unreachable registry exits 1 saying so, writing nothing", async () => {
    const dir = join(base, "demo");
    const result = await runWith("http://127.0.0.1:9", "create", dir, "--plugins", "jira", "--yes");
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("Can't reach http://127.0.0.1:9");
    expect(existsSync(dir)).toBe(false);
  });

  test("takes the name, assistant name and role from the flags", async () => {
    const dir = join(base, "folder");
    expect((await run("create", dir, "--name", "demo", "--assistant-name", "Hermes", "--role", "a helper", "-y")).code).toBe(0);
    expect(JSON.parse(readFileSync(join(dir, "package.json"), "utf-8")).name).toBe("demo");
    expect(readFileSync(join(dir, "persona/identity.md"), "utf-8")).toBe("You are Hermes, a helper.\n");
  });

  test("an unknown plugin exits 1, lists the valid ones, writes nothing", async () => {
    const dir = join(base, "demo");
    const result = await run("create", dir, "--plugins", "slack", "--yes");
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('Unknown plugin "slack" (valid: jira, bitbucket, atlassian-admin)');
    expect(existsSync(dir)).toBe(false);
  });

  test("the folder is created in kebab case, only its last segment; the app is named after it", async () => {
    const result = await run("create", join(base, "Sub Dir", "My App"), "--yes");
    expect(result.code).toBe(0);
    const dir = join(base, "Sub Dir", "my-app");
    expect(JSON.parse(readFileSync(join(dir, "package.json"), "utf-8")).name).toBe("my-app");
    expect(existsSync(join(base, "Sub Dir", "My App"))).toBe(false);
    expect(result.stdout).toContain(dir);
  });

  test("--name is kept as given, the folder is still kebab case", async () => {
    const result = await run("create", join(base, "Bot Folder"), "--name", "comperio.bot", "--yes");
    expect(result.code).toBe(0);
    const pkg = JSON.parse(readFileSync(join(base, "bot-folder", "package.json"), "utf-8"));
    expect(pkg.name).toBe("comperio.bot");
  });

  test("a folder name with nothing usable in it exits 1, writing nothing", async () => {
    const result = await run("create", join(base, "!!!"), "--yes");
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('"!!!"');
    expect(readdirSync(base)).toEqual([]);
  });
});

// Regression: these were only discovered after the whole wizard had been
// answered; they must fail before any question is asked.
describe("mfw create, checks before the wizard", () => {
  test("an unknown channel given as a flag, without --yes, exits 1 naming the valid ones", async () => {
    const result = await run("create", join(base, "demo"), "--channels", "slack");
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('Unknown channel "slack" (valid: google-chat, http)');
  });

  test("a folder that isn't empty, without --yes, exits 1 and is left alone", async () => {
    const dir = join(base, "demo");
    mkdirSync(dir);
    writeFileSync(join(dir, "notes.txt"), "mine");
    const result = await run("create", dir);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("is not empty");
    expect(readdirSync(dir)).toEqual(["notes.txt"]);
  });
});

describe("mfw (usage), through the real binary", () => {
  test("no command prints the help and exits 1", async () => {
    const result = await run();
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("Usage: mfw");
    expect(result.stderr).toContain("create");
  });

  test("an unknown command exits 1 naming it", async () => {
    const result = await run("deploy");
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("unknown command 'deploy'");
  });

  // Regression: --help after `create` hit the strict flag parser and errored.
  test("create --help and create -h print create's help and exit 0", async () => {
    for (const flag of ["--help", "-h"]) {
      const result = await run("create", "demo", flag);
      expect(result.code).toBe(0);
      expect(result.stdout).toContain("Usage: mfw create [options] <folder>");
    }
  });

  test("--help prints the help and exits 0", async () => {
    const result = await run("--help");
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("Usage: mfw");
  });
});

describe("app commands", () => {
  /** An app in `base/my-agent`, and deps that record the docker calls. */
  function setup() {
    const dir = join(base, "my-agent");
    mkdirSync(join(dir, "src"), { recursive: true });
    writeFileSync(join(dir, "mercury.config.ts"), "");
    writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "my-agent" }));
    const runs: Array<{ argv: string[]; cwd: string }> = [];
    const deps: AppDeps = {
      run: async (argv, { cwd }) => {
        runs.push({ argv, cwd });
        return 0;
      },
      capture: async () => "",
      ask: async () => "",
      print: () => {},
      home: "/nonexistent-home",
    };
    return { dir, runs, deps };
  }

  test("run from a subfolder, they act on the app's folder", async () => {
    const { dir, runs, deps } = setup();
    expect(await main(["start"], { cwd: join(dir, "src"), deps })).toBe(0);
    expect(runs).toEqual([{ argv: ["docker", "compose", "up", "-d", "--build"], cwd: dir }]);
  });

  test("outside an app they exit 1 without running anything", async () => {
    const { runs, deps } = setup();
    expect(await main(["start"], { cwd: base, deps })).toBe(1);
    expect(runs).toEqual([]);
  });

  test("a bad argument exits 1 without running anything", async () => {
    const { dir, runs, deps } = setup();
    expect(await main(["reset", "everything"], { cwd: dir, deps })).toBe(1);
    expect(runs).toEqual([]);
  });
});
