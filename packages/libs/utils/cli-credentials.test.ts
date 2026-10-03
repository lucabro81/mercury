import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readCliCredentials, credentialsVariable, appCliCredentials } from "./index.ts";

/**
 * The plugin-declared CLI credentials folder (`mercury.cliCredentials` in a
 * plugin's package.json): what `mfw credentials` on the host and the core in
 * the container both read, so a plugin outside the CLI's catalog gets the same
 * mechanism as a first-party one.
 */
describe("readCliCredentials", () => {
  it("returns the declared folder", () => {
    expect(readCliCredentials({ mercury: { cliCredentials: { folder: "jira-cli" } } })).toBe("jira-cli");
  });

  it("returns undefined for a package that declares nothing", () => {
    expect(readCliCredentials({ name: "x" })).toBeUndefined();
    expect(readCliCredentials({ mercury: { cliBinary: { repo: "a", crate: "b", version: "1" } } })).toBeUndefined();
    expect(readCliCredentials(undefined)).toBeUndefined();
  });

  it("rejects a malformed declaration instead of ignoring it", () => {
    for (const cliCredentials of [null, "jira-cli", {}, { folder: "" }, { folder: 3 }]) {
      expect(() => readCliCredentials({ mercury: { cliCredentials } })).toThrow(/mercury\.cliCredentials/);
    }
  });

  it("rejects a folder that isn't a single name under ~/.config", () => {
    for (const folder of ["a/b", "../x", "..", ".", "/abs", "with space", ".hidden"]) {
      expect(() => readCliCredentials({ mercury: { cliCredentials: { folder } } })).toThrow(/mercury\.cliCredentials/);
    }
  });
});

describe("credentialsVariable", () => {
  it("derives exactly the names existing env files already use", () => {
    expect(credentialsVariable("jira-cli")).toBe("JIRA_CLI_CONFIG_TAR_B64");
    expect(credentialsVariable("bitbucket-cli")).toBe("BITBUCKET_CLI_CONFIG_TAR_B64");
    expect(credentialsVariable("atlassian-admin-cli")).toBe("ATLASSIAN_ADMIN_CLI_CONFIG_TAR_B64");
  });

  it("maps any other non-alphanumeric to an underscore", () => {
    expect(credentialsVariable("my.tool_cli")).toBe("MY_TOOL_CLI_CONFIG_TAR_B64");
  });
});

describe("appCliCredentials", () => {
  let app: string;

  /** Writes `node_modules/<name>/package.json` in the fake app. */
  function installed(name: string, manifest: Record<string, unknown>): void {
    const dir = join(app, "node_modules", name);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "package.json"), JSON.stringify({ name, ...manifest }));
  }

  beforeEach(() => {
    app = mkdtempSync(join(tmpdir(), "cli-credentials-"));
  });
  afterEach(() => {
    rmSync(app, { recursive: true, force: true });
  });

  it("collects the declarations of the app's dependencies, in the manifest's order", () => {
    writeFileSync(
      join(app, "package.json"),
      JSON.stringify({
        dependencies: { "@scope/plugin-a": "^1.0.0", "plain-lib": "^2.0.0", "third-party-plugin": "^0.1.0" },
        devDependencies: { "@scope/dev-tool": "^1.0.0" },
      }),
    );
    installed("@scope/plugin-a", { mercury: { cliCredentials: { folder: "a-cli" } } });
    installed("plain-lib", {});
    installed("third-party-plugin", { mercury: { cliCredentials: { folder: "tp" } } });
    // A devDependency isn't part of what the app runs: not collected.
    installed("@scope/dev-tool", { mercury: { cliCredentials: { folder: "dev" } } });

    expect(appCliCredentials(app)).toEqual([
      { package: "@scope/plugin-a", folder: "a-cli", variable: "A_CLI_CONFIG_TAR_B64" },
      { package: "third-party-plugin", folder: "tp", variable: "TP_CONFIG_TAR_B64" },
    ]);
  });

  it("returns nothing for an app without dependencies", () => {
    writeFileSync(join(app, "package.json"), JSON.stringify({ name: "x" }));
    expect(appCliCredentials(app)).toEqual([]);
  });

  it("fails naming the dependency that isn't installed", () => {
    writeFileSync(join(app, "package.json"), JSON.stringify({ dependencies: { "missing-plugin": "^1.0.0" } }));
    expect(() => appCliCredentials(app)).toThrow(/missing-plugin.*not installed/);
  });

  it("fails naming the dependency whose declaration is malformed", () => {
    writeFileSync(join(app, "package.json"), JSON.stringify({ dependencies: { "bad-plugin": "^1.0.0" } }));
    installed("bad-plugin", { mercury: { cliCredentials: { folder: "../escape" } } });
    expect(() => appCliCredentials(app)).toThrow(/bad-plugin/);
  });

  it("fails when two dependencies declare the same folder", () => {
    writeFileSync(join(app, "package.json"), JSON.stringify({ dependencies: { one: "^1.0.0", two: "^1.0.0" } }));
    installed("one", { mercury: { cliCredentials: { folder: "same" } } });
    installed("two", { mercury: { cliCredentials: { folder: "same" } } });
    expect(() => appCliCredentials(app)).toThrow(/"same".*one.*two/);
  });
});
