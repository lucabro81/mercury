/**
 * `mfw create` end to end, run as the real command without the wizard
 * (`--yes`): the files on disk are exactly what `renderApp` produces for the
 * same answers, and a command line that can't work exits non-zero with a
 * message saying why, writing nothing.
 */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, spyOn, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { AppDeps } from "./app/commands.ts";
import { main } from "./main.ts";
import { renderApp } from "./render.ts";
import { cliVersion } from "./versions.ts";

const CLI = new URL("./bin.ts", import.meta.url).pathname;

/** The version the fake registry reports as `latest` for every plugin and channel. */
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
 * chosen plugins and channels at what the registry reports. */
const versions: Record<string, string> = {
  "@mercury-fw/cli": cliVersion(),
  "@mercury-fw/core": cliVersion(),
  "@mercury-fw/formatter": cliVersion(),
  "@mercury-fw/channel-http": PLUGIN_VERSION,
  "@mercury-fw/plugin-jira": PLUGIN_VERSION,
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

// #96: `bun create mercury-agent` can run a stale CLI out of Bun's bunx cache
// (a release behind), which writes an old template. The CLI asks the registry
// first and, when it's behind, hands the whole command to the newer one.
describe("mfw create with a newer CLI on the registry", () => {
  const NEWER = "999.0.0";
  let newerRegistry: ReturnType<typeof Bun.serve>;
  const saved = { registry: process.env.MFW_REGISTRY, updated: process.env.MFW_SELF_UPDATED };
  beforeAll(() => {
    newerRegistry = Bun.serve({
      port: 0,
      fetch: (req) => {
        const name = decodeURIComponent(new URL(req.url).pathname.slice(1).replace(/\/latest$/, ""));
        return Response.json({ name, version: name === "@mercury-fw/cli" ? NEWER : PLUGIN_VERSION });
      },
    });
  });
  afterAll(() => {
    newerRegistry.stop(true);
  });
  beforeEach(() => {
    process.env.MFW_REGISTRY = newerRegistry.url.origin;
    delete process.env.MFW_SELF_UPDATED;
  });
  afterEach(() => {
    for (const [key, value] of [["MFW_REGISTRY", saved.registry], ["MFW_SELF_UPDATED", saved.updated]] as const) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  /** A relaunch that records what it was asked to run and answers `code`. */
  function fakeRelaunch(code = 0) {
    const calls: Array<{ argv: string[]; env: Record<string, string> }> = [];
    const relaunch = async (argv: string[], env: Record<string, string>) => {
      calls.push({ argv, env });
      return code;
    };
    return { calls, relaunch };
  }

  /** A relaunch that records what it was asked to run: `bunx … --version`
   * (installing the newer CLI) answers `install`, `create` answers `create`;
   * `install: "throw"` is bunx failing to start at all. */
  function scriptedRelaunch({ install = 0 as number | "throw", create = 0 } = {}) {
    const calls: Array<{ argv: string[]; env: Record<string, string> }> = [];
    const relaunch = async (argv: string[], env: Record<string, string>) => {
      calls.push({ argv, env });
      if (argv.includes("--version")) {
        if (install === "throw") throw new Error("Executable not found in $PATH: \"bunx\"");
        return install;
      }
      return create;
    };
    return { calls, relaunch };
  }

  test("installs the newer one, runs it with the same arguments, writes nothing itself, exits with its code", async () => {
    const dir = join(base, "demo");
    const { calls, relaunch } = scriptedRelaunch({ create: 7 });
    const errors = spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(await main(["create", dir, "--plugins", "jira", "--yes"], { relaunch })).toBe(7);
      // #104: a stale (global) CLI also says how to stop being stale.
      expect(errors.mock.calls.map((c) => c[0])).toEqual([
        `mfw ${cliVersion()} is behind the registry's ${NEWER}: running ${NEWER} instead.`,
        "update your mfw: mfw upgrade",
      ]);
    } finally {
      errors.mockRestore();
    }
    const env = { MFW_SELF_UPDATED: NEWER, NPM_CONFIG_REGISTRY: newerRegistry.url.origin };
    expect(calls).toEqual([
      { argv: ["bunx", `@mercury-fw/cli@${NEWER}`, "--version"], env },
      { argv: ["bunx", `@mercury-fw/cli@${NEWER}`, "create", dir, "--plugins", "jira", "--yes"], env },
    ]);
    expect(existsSync(dir)).toBe(false);
  });

  // The newer CLI's own failure (a wizard cancelled, a bad folder) is its
  // answer: no second round here, which would ask the questions again.
  test("a newer CLI that ran and failed: its exit code, nothing created here", async () => {
    const dir = join(base, "demo");
    const { relaunch } = scriptedRelaunch({ create: 1 });
    expect(await main(["create", dir, "--yes"], { relaunch })).toBe(1);
    expect(existsSync(dir)).toBe(false);
  });

  test("a newer CLI that can't be installed (or bunx that can't start): a warning, and this CLI creates the app", async () => {
    for (const install of [1, "throw"] as const) {
      const dir = join(base, `demo-${install}`);
      const { calls, relaunch } = scriptedRelaunch({ install });
      expect(await main(["create", dir, "--yes"], { relaunch })).toBe(0);
      expect(calls.map((c) => c.argv.at(-1))).toEqual(["--version"]);
      expect(existsSync(join(dir, "package.json"))).toBe(true);
    }
  });

  // #104: `mfw upgrade` updates the global install to the registry's latest.
  test("mfw upgrade installs the registry's newer CLI globally, exiting with the install's code", async () => {
    for (const code of [0, 3]) {
      const { calls, relaunch } = fakeRelaunch(code);
      expect(await main(["upgrade"], { cwd: base, relaunch })).toBe(code);
      expect(calls).toEqual([
        {
          argv: ["bun", "add", "-g", `@mercury-fw/cli@${NEWER}`],
          env: { NPM_CONFIG_REGISTRY: newerRegistry.url.origin },
        },
      ]);
    }
  });

  test("mfw upgrade with this CLI already the latest: installs nothing, exit 0", async () => {
    process.env.MFW_REGISTRY = registry.url.origin; // answers an older version for everything
    const { calls, relaunch } = fakeRelaunch();
    expect(await main(["upgrade"], { cwd: base, relaunch })).toBe(0);
    expect(calls).toEqual([]);
  });

  test("mfw upgrade with an unreachable registry: exit 1, installs nothing", async () => {
    process.env.MFW_REGISTRY = "http://127.0.0.1:9";
    const { calls, relaunch } = fakeRelaunch();
    expect(await main(["upgrade"], { cwd: base, relaunch })).toBe(1);
    expect(calls).toEqual([]);
  });

  test("the registry handed to the newer CLI has no trailing slash", async () => {
    process.env.MFW_REGISTRY = `${newerRegistry.url.origin}/`;
    const { calls, relaunch } = scriptedRelaunch();
    await main(["create", join(base, "demo"), "--yes"], { relaunch });
    expect(calls.map((c) => c.env.NPM_CONFIG_REGISTRY)).toEqual([newerRegistry.url.origin, newerRegistry.url.origin]);
  });

  test("once relaunched (MFW_SELF_UPDATED set), it doesn't relaunch again: it creates the app", async () => {
    process.env.MFW_SELF_UPDATED = NEWER;
    const dir = join(base, "demo");
    const { calls, relaunch } = fakeRelaunch();
    expect(await main(["create", dir, "--yes"], { relaunch })).toBe(0);
    expect(calls).toEqual([]);
    expect(existsSync(join(dir, "package.json"))).toBe(true);
  });

  test("an unreachable registry is only a warning: an app with no plugins is still created", async () => {
    const dir = join(base, "demo");
    const result = await runWith("http://127.0.0.1:9", "create", dir, "--yes");
    expect(result.code).toBe(0);
    expect(result.stderr).toContain("couldn't check for a newer mfw: Can't reach http://127.0.0.1:9");
    expect(existsSync(join(dir, "package.json"))).toBe(true);
  });
});

// #104: a global `mfw` runs inside apps made with other framework versions;
// the app's own CLI (its devDependency) is the one that matches, so the
// global one hands the command over to it when the versions differ.
describe("a global mfw inside an app with its own CLI", () => {
  const saved = process.env.MFW_DEFERRED;
  beforeEach(() => {
    delete process.env.MFW_DEFERRED;
  });
  afterEach(() => {
    if (saved === undefined) delete process.env.MFW_DEFERRED;
    else process.env.MFW_DEFERRED = saved;
  });

  /** An app in `base/my-agent`, its CLI installed at `local` (none when
   * undefined), plus deps and a relaunch that record what they're asked. */
  function setup(local: string | undefined) {
    const dir = join(base, "my-agent");
    mkdirSync(join(dir, "src"), { recursive: true });
    writeFileSync(join(dir, "mercury.config.ts"), "");
    writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "my-agent" }));
    if (local !== undefined) {
      mkdirSync(join(dir, "node_modules", "@mercury-fw", "cli"), { recursive: true });
      writeFileSync(join(dir, "node_modules", "@mercury-fw", "cli", "package.json"), JSON.stringify({ version: local }));
    }
    const runs: string[][] = [];
    const deps: AppDeps = {
      run: async (argv) => {
        runs.push(argv);
        return 0;
      },
      capture: async () => "",
      ask: async () => "",
      print: () => {},
      home: "/nonexistent-home",
    };
    const relaunches: Array<{ argv: string[]; env: Record<string, string> }> = [];
    const relaunch = async (argv: string[], env: Record<string, string>) => {
      relaunches.push({ argv, env });
      return 5;
    };
    return { dir, runs, deps, relaunches, relaunch };
  }

  test("the app's CLI at another version: runs that one with the same arguments, from a subfolder too", async () => {
    const { dir, runs, deps, relaunches, relaunch } = setup("0.1.0");
    expect(await main(["logs", "mercury"], { cwd: join(dir, "src"), deps, relaunch })).toBe(5);
    expect(relaunches).toEqual([
      {
        argv: ["bun", join(dir, "node_modules", "@mercury-fw", "cli", "src", "bin.ts"), "logs", "mercury"],
        env: { MFW_DEFERRED: "1" },
      },
    ]);
    expect(runs).toEqual([]);
  });

  test("the app's CLI at this same version: runs here", async () => {
    const { dir, runs, deps, relaunches, relaunch } = setup(cliVersion());
    expect(await main(["start"], { cwd: dir, deps, relaunch })).toBe(0);
    expect(relaunches).toEqual([]);
    expect(runs).toEqual([["docker", "compose", "up", "-d", "--build"]]);
  });

  test("an app not installed yet (no node_modules): runs here", async () => {
    const { dir, runs, deps, relaunches, relaunch } = setup(undefined);
    expect(await main(["start"], { cwd: dir, deps, relaunch })).toBe(0);
    expect(relaunches).toEqual([]);
    expect(runs.length).toBe(1);
  });

  test("already handed over (MFW_DEFERRED): runs here, no loop", async () => {
    process.env.MFW_DEFERRED = "1";
    const { dir, runs, deps, relaunches, relaunch } = setup("0.1.0");
    expect(await main(["start"], { cwd: dir, deps, relaunch })).toBe(0);
    expect(relaunches).toEqual([]);
    expect(runs.length).toBe(1);
  });

  test("create and upgrade are the global CLI's own: never handed over", async () => {
    const { dir, relaunches, relaunch } = setup("0.1.0");
    // No registry check in this test (#96's relaunch): it isn't what's tested.
    const updated = process.env.MFW_SELF_UPDATED;
    process.env.MFW_SELF_UPDATED = cliVersion();
    try {
      await main(["create", join(dir, "nested"), "--yes"], { cwd: dir, relaunch });
      await main(["upgrade", "--help"], { cwd: dir, relaunch });
    } finally {
      if (updated === undefined) delete process.env.MFW_SELF_UPDATED;
      else process.env.MFW_SELF_UPDATED = updated;
    }
    expect(relaunches).toEqual([]);
  });
});
