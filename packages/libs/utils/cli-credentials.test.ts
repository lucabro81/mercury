import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readCliCredentials, credentialsVariable, appCliCredentials, volumePath } from "./index.ts";

/**
 * The plugin-declared CLI credentials folder (`mercury.cliCredentials` in a
 * plugin's package.json): what `mfw credentials` on the host and the core in
 * the container both read, so a plugin outside the CLI's catalog gets the same
 * mechanism as a first-party one.
 */
describe("readCliCredentials", () => {
  it("a folder is under ~/.config, the default", () => {
    expect(readCliCredentials({ mercury: { cliCredentials: { folder: "jira-cli" } } })).toEqual({
      name: "jira-cli",
      path: ".config/jira-cli",
    });
  });

  // #144: a CLI may keep its login outside ~/.config.
  it("a path is anywhere under the home", () => {
    expect(readCliCredentials({ mercury: { cliCredentials: { path: ".aws" } } })).toEqual({ name: ".aws", path: ".aws" });
    expect(readCliCredentials({ mercury: { cliCredentials: { path: ".local/share/tool" } } })).toEqual({
      name: ".local/share/tool",
      path: ".local/share/tool",
    });
  });

  it("returns undefined for a package that declares nothing", () => {
    expect(readCliCredentials({ name: "x" })).toBeUndefined();
    expect(readCliCredentials({ mercury: { cliBinary: { repo: "a", crate: "b", version: "1" } } })).toBeUndefined();
    expect(readCliCredentials(undefined)).toBeUndefined();
  });

  // Review of #144: a non-object `mercury` threw a bare TypeError from `in`.
  it("rejects a `mercury` field that isn't an object, with the same clear error", () => {
    for (const mercury of [null, "x", 3, []]) {
      expect(() => readCliCredentials({ mercury })).toThrow(/invalid mercury in package\.json/);
    }
  });

  it("rejects a malformed declaration instead of ignoring it", () => {
    for (const cliCredentials of [null, "jira-cli", {}, { folder: "" }, { folder: 3 }, { path: 3 }, { folder: "a", path: ".a" }]) {
      expect(() => readCliCredentials({ mercury: { cliCredentials } })).toThrow(/mercury\.cliCredentials/);
    }
  });

  it("rejects a folder that isn't a single name under ~/.config", () => {
    for (const folder of ["a/b", "../x", "..", ".", "/abs", "with space", ".hidden"]) {
      expect(() => readCliCredentials({ mercury: { cliCredentials: { folder } } })).toThrow(/mercury\.cliCredentials/);
    }
  });

  // Review of #144: under ~/.config a path would duplicate a folder with
  // another variable; that's what `folder` is for.
  it("rejects a path under ~/.config: that's a folder", () => {
    for (const path of [".config/x", ".config/x/y"]) {
      expect(() => readCliCredentials({ mercury: { cliCredentials: { path } } }), path).toThrow(/mercury\.cliCredentials/);
    }
  });

  it("rejects a path that leaves the home, or covers the whole volume or Mercury's part of it", () => {
    // "-x": the last segment is a tar member name, never an option. Review of #144.
    for (const path of ["", "/abs", "../x", "a/../../x", "./a", "a//b", "a/", "with space", "-x", "a/-x", ".config", ".config/mercury-home", ".config/mercury-home/x"]) {
      expect(() => readCliCredentials({ mercury: { cliCredentials: { path } } }), path).toThrow(/mercury\.cliCredentials/);
    }
  });
});

describe("volumePath", () => {
  it("a folder under ~/.config is on the volume where it is", () => {
    expect(volumePath(".config/jira-cli")).toBe(".config/jira-cli");
    expect(volumePath(".config/tool/sub")).toBe(".config/tool/sub");
  });

  it("anything else goes under ~/.config/mercury-home, the volume being ~/.config", () => {
    expect(volumePath(".aws")).toBe(".config/mercury-home/.aws");
    expect(volumePath(".local/share/tool")).toBe(".config/mercury-home/.local/share/tool");
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

  it("a path's leading dot doesn't start the name with an underscore", () => {
    expect(credentialsVariable(".aws")).toBe("AWS_CONFIG_TAR_B64");
    expect(credentialsVariable(".local/share/tool")).toBe("LOCAL_SHARE_TOOL_CONFIG_TAR_B64");
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
    installed("third-party-plugin", { mercury: { cliCredentials: { path: ".tp" } } });
    // A devDependency isn't part of what the app runs: not collected.
    installed("@scope/dev-tool", { mercury: { cliCredentials: { folder: "dev" } } });

    expect(appCliCredentials(app)).toEqual({
      declared: [
        { package: "@scope/plugin-a", name: "a-cli", path: ".config/a-cli", variable: "A_CLI_CONFIG_TAR_B64" },
        { package: "third-party-plugin", name: ".tp", path: ".tp", variable: "TP_CONFIG_TAR_B64" },
      ],
      problems: [],
    });
  });

  it("returns nothing for an app without dependencies", () => {
    writeFileSync(join(app, "package.json"), JSON.stringify({ name: "x" }));
    expect(appCliCredentials(app)).toEqual({ declared: [], problems: [] });
  });

  // Review of #144: one bad dependency used to make the whole read throw, so
  // the good plugins lost their login too. Each problem now drops only its own.
  it("reports a dependency that isn't installed, and keeps the others", () => {
    writeFileSync(join(app, "package.json"), JSON.stringify({ dependencies: { "missing-plugin": "^1.0.0", good: "^1.0.0" } }));
    installed("good", { mercury: { cliCredentials: { folder: "good-cli" } } });
    const { declared, problems } = appCliCredentials(app);
    expect(declared).toEqual([{ package: "good", name: "good-cli", path: ".config/good-cli", variable: "GOOD_CLI_CONFIG_TAR_B64" }]);
    expect(problems).toEqual([
      `missing-plugin is not installed (no ${join(app, "node_modules", "missing-plugin", "package.json")}): run bun install`,
    ]);
  });

  it("reports a malformed declaration, and keeps the others", () => {
    writeFileSync(join(app, "package.json"), JSON.stringify({ dependencies: { "bad-plugin": "^1.0.0", good: "^1.0.0" } }));
    installed("bad-plugin", { mercury: { cliCredentials: { folder: "../escape" } } });
    installed("good", { mercury: { cliCredentials: { folder: "good-cli" } } });
    const { declared, problems } = appCliCredentials(app);
    expect(declared.map((c) => c.package)).toEqual(["good"]);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toStartWith("bad-plugin: invalid mercury.cliCredentials");
  });

  // Review of #144: a login inside another's would be linked inside that
  // one's copy on the volume.
  it("drops both dependencies whose paths are one inside the other, and keeps the others", () => {
    writeFileSync(
      join(app, "package.json"),
      JSON.stringify({ dependencies: { outer: "^1.0.0", good: "^1.0.0", inner: "^1.0.0", sibling: "^1.0.0" } }),
    );
    installed("outer", { mercury: { cliCredentials: { path: ".aws" } } });
    installed("good", { mercury: { cliCredentials: { folder: "good-cli" } } });
    installed("inner", { mercury: { cliCredentials: { path: ".aws/sso" } } });
    // Same prefix as a string, not as a path: no overlap.
    installed("sibling", { mercury: { cliCredentials: { path: ".aws-other" } } });
    const { declared, problems } = appCliCredentials(app);
    expect(declared.map((c) => c.package)).toEqual(["good", "sibling"]);
    expect(problems).toEqual(["outer and inner declare CLI credentials (.aws, .aws/sso) one inside the other: neither is used"]);
  });

  // Review of #144: the clash was checked on the folder, but two folders can
  // share a variable (jira-cli, jira_cli), which would hand both one login.
  it.each([
    [{ folder: "same" }, { folder: "same" }, "same", "same"],
    [{ folder: "jira-cli" }, { folder: "jira_cli" }, "jira-cli", "jira_cli"],
    [{ folder: "Jira-cli" }, { folder: "jira-cli" }, "Jira-cli", "jira-cli"],
    [{ folder: "aws" }, { path: ".aws" }, "aws", ".aws"],
  ])("drops both dependencies whose declarations %p and %p map to one variable, and keeps the others", (da, db, a, b) => {
    writeFileSync(
      join(app, "package.json"),
      JSON.stringify({ dependencies: { one: "^1.0.0", good: "^1.0.0", two: "^1.0.0" } }),
    );
    installed("one", { mercury: { cliCredentials: da } });
    installed("good", { mercury: { cliCredentials: { folder: "good-cli" } } });
    installed("two", { mercury: { cliCredentials: db } });
    const { declared, problems } = appCliCredentials(app);
    expect(declared.map((c) => c.package)).toEqual(["good"]);
    expect(problems).toEqual([
      `one and two declare CLI credentials (${a}, ${b}) carried by the same variable ${credentialsVariable(a)}: neither is used`,
    ]);
  });
});
