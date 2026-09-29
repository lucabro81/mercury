/**
 * `mercury create` end to end, run as the real command without the wizard
 * (`--yes`): the files on disk are exactly what `renderApp` produces for the
 * same answers, and a command line that can't work exits non-zero with a
 * message saying why, writing nothing.
 */
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { renderApp } from "./render.ts";
import { packageVersions } from "./versions.ts";
import { CATALOG } from "./catalog.ts";

const CLI = new URL("./index.ts", import.meta.url).pathname;

let base: string;
beforeEach(() => {
  base = mkdtempSync(join(tmpdir(), "mercury-cli-create-"));
});
afterEach(() => {
  rmSync(base, { recursive: true, force: true });
});

/** Runs the CLI with `args`, returning its exit code and output. */
function run(...args: string[]): { code: number; stdout: string; stderr: string } {
  // stdin closed and a timeout: a run that wrongly reaches the wizard fails
  // instead of hanging the suite.
  const proc = Bun.spawnSync(["bun", CLI, ...args], { stdin: "ignore", stdout: "pipe", stderr: "pipe", timeout: 10_000 });
  return { code: proc.exitCode, stdout: proc.stdout.toString(), stderr: proc.stderr.toString() };
}

const versions = packageVersions(["@mercury/core", "@mercury/formatter", ...CATALOG.map((e) => e.package)]);

describe("mercury create --yes", () => {
  test("writes exactly the rendered app, named after the folder by default", () => {
    const dir = join(base, "demo");
    const result = run("create", dir, "--channels", "http", "--plugins", "jira", "--yes");
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

  test("takes the name, assistant name and role from the flags", () => {
    const dir = join(base, "folder");
    expect(run("create", dir, "--name", "demo", "--assistant-name", "Hermes", "--role", "a helper", "-y").code).toBe(0);
    expect(JSON.parse(readFileSync(join(dir, "package.json"), "utf-8")).name).toBe("demo");
    expect(readFileSync(join(dir, "persona/identity.md"), "utf-8")).toBe("You are Hermes, a helper.\n");
  });

  test("an unknown plugin exits 1, lists the valid ones, writes nothing", () => {
    const dir = join(base, "demo");
    const result = run("create", dir, "--plugins", "slack", "--yes");
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('Unknown plugin "slack" (valid: jira, bitbucket, atlassian-admin)');
    expect(existsSync(dir)).toBe(false);
  });

  test("a folder name that isn't a valid app name exits 1 and suggests --name", () => {
    const result = run("create", join(base, "My App"), "--yes");
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("--name");
  });
});

// Regression: these were only discovered after the whole wizard had been
// answered; they must fail before any question is asked.
describe("mercury create, checks before the wizard", () => {
  test("an unknown channel given as a flag, without --yes, exits 1 naming the valid ones", () => {
    const result = run("create", join(base, "demo"), "--channels", "slack");
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('Unknown channel "slack" (valid: google-chat, http)');
  });

  test("a folder that isn't empty, without --yes, exits 1 and is left alone", () => {
    const dir = join(base, "demo");
    mkdirSync(dir);
    writeFileSync(join(dir, "notes.txt"), "mine");
    const result = run("create", dir);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("is not empty");
    expect(readdirSync(dir)).toEqual(["notes.txt"]);
  });
});

describe("mercury (usage)", () => {
  test("no command prints the usage and exits 1", () => {
    const result = run();
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("mercury create <folder>");
  });

  test("an unknown command exits 1 naming it", () => {
    const result = run("deploy");
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('Unknown command "deploy"');
  });

  // Regression: --help after `create` hit the strict flag parser and errored.
  test("create --help and create -h print the usage and exit 0", () => {
    for (const flag of ["--help", "-h"]) {
      const result = run("create", "demo", flag);
      expect(result.code).toBe(0);
      expect(result.stdout).toContain("mercury create <folder>");
    }
  });

  test("--help prints the usage and exits 0", () => {
    const result = run("--help");
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("mercury create <folder>");
  });
});
