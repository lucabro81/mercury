/**
 * `mfw credentials set|reset` on a temporary app (a manifest with the jira
 * plugin and a third-party plugin among its dependencies, each declaring its
 * CLI credentials folder in its installed package.json) and a fake CLI config
 * folder: what ends up in the env file, what's printed (never the value,
 * unless asked), and the docker calls of a reset.
 */
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { appCommands, type AppDeps } from "./commands.ts";

let base: string;
let app: { dir: string; name: string };
let envFile: string;
beforeEach(() => {
  base = mkdtempSync(join(tmpdir(), "mercury-credentials-cmd-"));
  app = { dir: join(base, "my-agent"), name: "my-agent" };
  mkdirSync(app.dir);
  writeFileSync(
    join(app.dir, "package.json"),
    JSON.stringify({
      name: "my-agent",
      dependencies: { "@mercury-fw/core": "^0.26.0", "@mercury-fw/plugin-jira": "^0.1.0", "acme-mercury-plugin": "^1.0.0" },
    }),
  );
  installed("@mercury-fw/core", {});
  installed("@mercury-fw/plugin-jira", { mercury: { cliCredentials: { folder: "jira-cli" } } });
  // Not in the CLI's catalog: the declaration alone is what makes it work.
  installed("acme-mercury-plugin", { mercury: { cliCredentials: { folder: "acme-cli" } } });
  envFile = join(app.dir, [".", "env"].join(""));
  mkdirSync(join(base, "home", ".config", "jira-cli"), { recursive: true });
  writeFileSync(join(base, "home", ".config", "jira-cli", "app.json"), '{"client_id":"fake"}\n');
});
afterEach(() => {
  rmSync(base, { recursive: true, force: true });
});

/** Writes `node_modules/<name>/package.json` in the app. */
function installed(name: string, manifest: Record<string, unknown>): void {
  mkdirSync(join(app.dir, "node_modules", name), { recursive: true });
  writeFileSync(join(app.dir, "node_modules", name, "package.json"), JSON.stringify({ name, ...manifest }));
}

/** Deps that record docker calls, the printed lines, and answer `answer`. */
function fake({ answer = "", codes = [] as number[] } = {}) {
  const runs: string[][] = [];
  const printed: string[] = [];
  const asked: string[] = [];
  const deps: AppDeps = {
    run: async (argv) => {
      runs.push(argv);
      return codes.shift() ?? 0;
    },
    capture: async () => "",
    ask: async (q) => {
      asked.push(q);
      return answer;
    },
    print: (line) => void printed.push(line),
    // Never the real home: a test must not read a real CLI's credentials.
    home: join(base, "home"),
  };
  return { deps, runs, printed, asked };
}

describe("credentials set", () => {
  test("packs ~/.config/<folder> into the plugin's variable in the env file, never printing the value", async () => {
    const f = fake();
    expect(await appCommands(app, f.deps).credentialsSet("jira-cli", { print: false })).toBe(0);
    const line = readFileSync(envFile, "utf-8");
    expect(line).toMatch(/^JIRA_CLI_CONFIG_TAR_B64=[A-Za-z0-9+/]+=*\n$/);
    const value = line.trim().split("=").slice(1).join("=");
    expect(f.printed.join("\n")).not.toContain(value);
    expect(f.printed).toEqual([
      `JIRA_CLI_CONFIG_TAR_B64 set in ${envFile}, from ${join(base, "home", ".config", "jira-cli")}.`,
      "The app unpacks it at its next start, if the volume has no jira-cli folder yet; if it has one, run mfw credentials reset jira-cli first.",
    ]);
    expect(f.runs).toEqual([]);
  });

  test("--from packs another folder", async () => {
    mkdirSync(join(base, "elsewhere"));
    writeFileSync(join(base, "elsewhere", "token.json"), "{}\n");
    const f = fake();
    await appCommands(app, f.deps).credentialsSet("jira-cli", { from: join(base, "elsewhere"), print: false });
    expect(f.printed[0]).toBe(`JIRA_CLI_CONFIG_TAR_B64 set in ${envFile}, from ${join(base, "elsewhere")}.`);
    expect(readFileSync(envFile, "utf-8")).toStartWith("JIRA_CLI_CONFIG_TAR_B64=");
  });

  test("--print prints the line and leaves the env file alone", async () => {
    const f = fake();
    await appCommands(app, f.deps).credentialsSet("jira-cli", { from: join(base, "home", ".config", "jira-cli"), print: true });
    expect(f.printed).toHaveLength(1);
    expect(f.printed[0]).toMatch(/^JIRA_CLI_CONFIG_TAR_B64=[A-Za-z0-9+/]+=*$/);
    expect(existsSync(envFile)).toBe(false);
  });

  test("the plugin can be named by its package too", async () => {
    const f = fake();
    expect(await appCommands(app, f.deps).credentialsSet("@mercury-fw/plugin-jira", { print: false })).toBe(0);
    expect(readFileSync(envFile, "utf-8")).toStartWith("JIRA_CLI_CONFIG_TAR_B64=");
  });

  test("a plugin outside the CLI's catalog works the same, through its declaration", async () => {
    mkdirSync(join(base, "home", ".config", "acme-cli"), { recursive: true });
    writeFileSync(join(base, "home", ".config", "acme-cli", "auth"), "x\n");
    const f = fake();
    expect(await appCommands(app, f.deps).credentialsSet("acme-mercury-plugin", { print: false })).toBe(0);
    expect(readFileSync(envFile, "utf-8")).toMatch(/^ACME_CLI_CONFIG_TAR_B64=[A-Za-z0-9+/]+=*\n$/);
  });

  // The short catalog name ("jira") isn't a name a third-party plugin has to
  // follow, so it's no longer accepted.
  test.each(["jira", "bitbucket"])("%p isn't a declared package or folder: an error listing what the app has", async (name) => {
    const f = fake();
    await expect(appCommands(app, f.deps).credentialsSet(name, { print: false })).rejects.toThrow(
      `my-agent has no CLI credentials named "${name}". It has: @mercury-fw/plugin-jira (jira-cli), acme-mercury-plugin (acme-cli).`,
    );
    expect(existsSync(envFile)).toBe(false);
  });

  test("an app without its dependencies installed says to install them", async () => {
    rmSync(join(app.dir, "node_modules"), { recursive: true });
    const f = fake();
    await expect(appCommands(app, f.deps).credentialsSet("jira-cli", { print: false })).rejects.toThrow("run bun install");
  });
});

describe("credentials reset", () => {
  const STEPS = [
    ["docker", "compose", "stop", "mercury"],
    ["docker", "compose", "run", "--rm", "--no-deps", "-T", "mercury", "rm", "-rf", "/home/mercury/.config/jira-cli"],
    ["docker", "compose", "up", "-d", "mercury"],
  ];

  test.each(["jira-cli", "@mercury-fw/plugin-jira"])(
    "named %p, confirmed with the folder's name: the folder goes from the volume, the app comes back",
    async (plugin) => {
      const f = fake({ answer: "jira-cli" });
      expect(await appCommands(app, f.deps).credentialsReset(plugin)).toBe(0);
      expect(f.asked).toEqual([
        "This deletes the jira-cli folder from the app's credentials volume, and any token the CLI refreshed since it was unpacked. Type the folder's name (jira-cli) to confirm: ",
      ]);
      expect(f.runs).toEqual(STEPS);
    },
  );

  test.each(["", "y", "jira", "@mercury-fw/plugin-jira", "my-agent"])("answer %p: nothing is deleted, exit 1", async (answer) => {
    const f = fake({ answer });
    expect(await appCommands(app, f.deps).credentialsReset("@mercury-fw/plugin-jira")).toBe(1);
    expect(f.runs).toEqual([]);
    expect(f.printed).toEqual(["Not confirmed: nothing deleted."]);
  });

  test("a step failing after the stop says the app is down", async () => {
    const f = fake({ answer: "jira-cli", codes: [0, 1] });
    expect(await appCommands(app, f.deps).credentialsReset("jira-cli")).toBe(1);
    expect(f.runs).toEqual(STEPS.slice(0, 2));
    expect(f.printed).toEqual(["The mercury service was stopped and not restarted: mfw start brings it back."]);
  });

  test("a plugin the app doesn't have is refused before any question", async () => {
    const f = fake({ answer: "bitbucket" });
    await expect(appCommands(app, f.deps).credentialsReset("bitbucket")).rejects.toThrow('no CLI credentials named "bitbucket"');
    expect(f.asked).toEqual([]);
    expect(f.runs).toEqual([]);
  });
});
