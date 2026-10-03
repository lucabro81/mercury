import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync, readlinkSync, lstatSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { materializeCliCredentials } from "./materialize.ts";

/**
 * Unpacking each plugin-declared CLI credentials variable onto the config
 * folder at startup: only when the folder isn't there yet (what the CLI writes
 * back, like a refreshed token, must survive a redeploy), never throwing.
 */
describe("materializeCliCredentials", () => {
  let root: string;
  let app: string;
  let home: string;
  let configDir: string;
  let logs: string[];

  /** The app declares `deps`, each installed with the given credentials folder
   * under ~/.config, or the given declaration, or none. */
  function appWith(deps: Record<string, string | { path: string } | undefined>): void {
    writeFileSync(
      join(app, "package.json"),
      JSON.stringify({ dependencies: Object.fromEntries(Object.keys(deps).map((d) => [d, "^1.0.0"])) }),
    );
    for (const [name, folder] of Object.entries(deps)) {
      const dir = join(app, "node_modules", name);
      mkdirSync(dir, { recursive: true });
      const declaration = typeof folder === "string" ? { folder } : folder;
      const manifest = declaration === undefined ? { name } : { name, mercury: { cliCredentials: declaration } };
      writeFileSync(join(dir, "package.json"), JSON.stringify(manifest));
    }
  }

  /** `folder/token` holding `content`, packed the way `mfw credentials set` packs it. */
  async function packed(folder: string, content: string): Promise<string> {
    const src = join(root, "src");
    mkdirSync(join(src, folder), { recursive: true });
    writeFileSync(join(src, folder, "token"), content);
    const proc = Bun.spawn(["tar", "-cz", "-f", "-", "-C", src, folder], { stdout: "pipe" });
    const bytes = await new Response(proc.stdout).arrayBuffer();
    await proc.exited;
    rmSync(src, { recursive: true, force: true });
    return Buffer.from(bytes).toString("base64");
  }

  async function run(env: Record<string, string | undefined>): Promise<void> {
    await materializeCliCredentials({ appDir: app, homeDir: home, env, log: (m) => logs.push(m) });
  }

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "materialize-"));
    app = join(root, "app");
    mkdirSync(app);
    home = join(root, "home");
    configDir = join(home, ".config");
    logs = [];
  });
  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it("unpacks the variable into the folder when the folder is missing", async () => {
    appWith({ "plugin-a": "a-cli", "plain-lib": undefined });
    await run({ A_CLI_CONFIG_TAR_B64: await packed("a-cli", "secret-1") });
    expect(readFileSync(join(configDir, "a-cli", "token"), "utf-8")).toBe("secret-1");
    expect(logs).toEqual([]);
  });

  it("leaves an existing folder alone: a refreshed token beats the older variable", async () => {
    appWith({ "plugin-a": "a-cli" });
    mkdirSync(join(configDir, "a-cli"), { recursive: true });
    writeFileSync(join(configDir, "a-cli", "token"), "refreshed");
    await run({ A_CLI_CONFIG_TAR_B64: await packed("a-cli", "stale") });
    expect(readFileSync(join(configDir, "a-cli", "token"), "utf-8")).toBe("refreshed");
    expect(logs).toEqual([]);
  });

  it("warns when there's neither the folder nor the variable", async () => {
    appWith({ "@scope/plugin-a": "a-cli" });
    await run({});
    expect(existsSync(join(configDir, "a-cli"))).toBe(false);
    expect(logs).toEqual([
      "@scope/plugin-a: no login for its CLI (no a-cli folder, A_CLI_CONFIG_TAR_B64 not set): run mfw credentials set a-cli",
    ]);
  });

  it("extracts only the declared folder from the archive", async () => {
    appWith({ "plugin-a": "a-cli" });
    // A variable packed from another CLI's folder: nothing of it lands.
    await run({ A_CLI_CONFIG_TAR_B64: await packed("other-cli", "x") });
    expect(existsSync(join(configDir, "other-cli"))).toBe(false);
    expect(readdirSync(configDir)).toEqual([]);
    expect(logs).toHaveLength(1);
    expect(logs[0]).toStartWith("plugin-a: could not unpack A_CLI_CONFIG_TAR_B64 into a-cli:");
  });

  it("logs a variable that isn't a packed folder and carries on with the next one", async () => {
    appWith({ "plugin-a": "a-cli", "plugin-b": "b-cli" });
    await run({ A_CLI_CONFIG_TAR_B64: "not-an-archive", B_CLI_CONFIG_TAR_B64: await packed("b-cli", "ok") });
    expect(readFileSync(join(configDir, "b-cli", "token"), "utf-8")).toBe("ok");
    // Nothing half-unpacked left behind: a partial a-cli would count as present
    // and block the corrected variable on the next start.
    expect(readdirSync(configDir)).toEqual(["b-cli"]);
    expect(logs).toHaveLength(1);
    expect(logs[0]).toStartWith("plugin-a: could not unpack A_CLI_CONFIG_TAR_B64 into a-cli:");
  });

  // #144: a CLI may keep its login outside ~/.config. The volume is mounted on
  // ~/.config, so the login lives there, under mercury-home, and the home path
  // points to it: what the CLI writes back survives a redeploy too.
  it("a login declared elsewhere in the home lives on the volume, linked from where the CLI looks", async () => {
    appWith({ "plugin-aws": { path: ".aws" }, "plugin-deep": { path: ".local/share/tool" } });
    await run({
      AWS_CONFIG_TAR_B64: await packed(".aws", "aws-secret"),
      LOCAL_SHARE_TOOL_CONFIG_TAR_B64: await packed("tool", "deep-secret"),
    });
    expect(readFileSync(join(configDir, "mercury-home", ".aws", "token"), "utf-8")).toBe("aws-secret");
    expect(readlinkSync(join(home, ".aws"))).toBe(join(configDir, "mercury-home", ".aws"));
    expect(readFileSync(join(home, ".aws", "token"), "utf-8")).toBe("aws-secret");
    expect(readFileSync(join(home, ".local", "share", "tool", "token"), "utf-8")).toBe("deep-secret");
    expect(lstatSync(join(home, ".local", "share", "tool")).isSymbolicLink()).toBe(true);
    expect(logs).toEqual([]);
  });

  it("on a later start, with the login already on the volume, only the link is made again", async () => {
    appWith({ "plugin-aws": { path: ".aws" } });
    mkdirSync(join(configDir, "mercury-home", ".aws"), { recursive: true });
    writeFileSync(join(configDir, "mercury-home", ".aws", "token"), "refreshed");
    await run({ AWS_CONFIG_TAR_B64: await packed(".aws", "stale") });
    expect(readFileSync(join(home, ".aws", "token"), "utf-8")).toBe("refreshed");
    expect(logs).toEqual([]);
  });

  it("a link already in place is left as it is", async () => {
    appWith({ "plugin-aws": { path: ".aws" } });
    mkdirSync(join(configDir, "mercury-home", ".aws"), { recursive: true });
    symlinkSync(join(configDir, "mercury-home", ".aws"), join(home, ".aws"));
    const before = lstatSync(join(home, ".aws")).ino;
    await run({});
    // The same link, not one removed and made again.
    expect(lstatSync(join(home, ".aws")).ino).toBe(before);
    expect(readlinkSync(join(home, ".aws"))).toBe(join(configDir, "mercury-home", ".aws"));
    expect(logs).toEqual([]);
  });

  it("a link pointing elsewhere is never replaced: logged", async () => {
    appWith({ "plugin-aws": { path: ".aws" } });
    mkdirSync(join(configDir, "mercury-home", ".aws"), { recursive: true });
    symlinkSync(join(root, "somewhere-else"), join(home, ".aws"));
    await run({});
    expect(readlinkSync(join(home, ".aws"))).toBe(join(root, "somewhere-else"));
    expect(logs).toEqual([
      `plugin-aws: ${join(home, ".aws")} is already there and isn't a link to the credentials volume: the CLI won't find its login`,
    ]);
  });

  it("a login declared elsewhere that fails to unpack leaves nothing behind and makes no link", async () => {
    appWith({ "plugin-aws": { path: ".aws" } });
    await run({ AWS_CONFIG_TAR_B64: "not-an-archive" });
    expect(readdirSync(join(configDir, "mercury-home"))).toEqual([]);
    expect(lstatSync(join(home, ".aws"), { throwIfNoEntry: false })).toBeUndefined();
    expect(logs).toHaveLength(1);
    expect(logs[0]).toStartWith("plugin-aws: could not unpack AWS_CONFIG_TAR_B64 into .aws:");
  });

  // Review of #144: a link that couldn't be made threw out of the startup and
  // took the whole app down with it.
  it("a link that can't be made is logged, and the next plugin is still handled", async () => {
    appWith({ "plugin-deep": { path: ".local/share/tool" }, "plugin-a": "a-cli" });
    mkdirSync(home, { recursive: true });
    writeFileSync(join(home, ".local"), "a file where a folder should be");
    await run({
      LOCAL_SHARE_TOOL_CONFIG_TAR_B64: await packed("tool", "deep-secret"),
      A_CLI_CONFIG_TAR_B64: await packed("a-cli", "secret-1"),
    });
    expect(readFileSync(join(configDir, "mercury-home", ".local", "share", "tool", "token"), "utf-8")).toBe("deep-secret");
    expect(readFileSync(join(configDir, "a-cli", "token"), "utf-8")).toBe("secret-1");
    expect(logs).toHaveLength(1);
    expect(logs[0]).toStartWith(`plugin-deep: could not link ${join(home, ".local", "share", "tool")} to the credentials volume:`);
  });

  it("something else at the home path is never replaced: logged, the login stays on the volume", async () => {
    appWith({ "plugin-aws": { path: ".aws" } });
    mkdirSync(join(home, ".aws"), { recursive: true });
    writeFileSync(join(home, ".aws", "mine"), "x");
    await run({ AWS_CONFIG_TAR_B64: await packed(".aws", "aws-secret") });
    expect(readFileSync(join(home, ".aws", "mine"), "utf-8")).toBe("x");
    expect(readFileSync(join(configDir, "mercury-home", ".aws", "token"), "utf-8")).toBe("aws-secret");
    expect(logs).toEqual([
      `plugin-aws: ${join(home, ".aws")} is already there and isn't a link to the credentials volume: the CLI won't find its login`,
    ]);
  });

  it("no link without a login on the volume, just the warning", async () => {
    appWith({ "plugin-aws": { path: ".aws" } });
    await run({});
    expect(existsSync(join(home, ".aws"))).toBe(false);
    expect(lstatSync(join(home, ".aws"), { throwIfNoEntry: false })).toBeUndefined();
    expect(logs).toEqual([
      "plugin-aws: no login for its CLI (no .aws folder, AWS_CONFIG_TAR_B64 not set): run mfw credentials set .aws",
    ]);
  });

  // Review of #144: one dependency that couldn't be read stopped every
  // plugin's login from being unpacked.
  it("logs a dependency it can't read and still unpacks the others", async () => {
    appWith({ "plugin-a": "a-cli" });
    const manifest = JSON.parse(readFileSync(join(app, "package.json"), "utf-8"));
    manifest.dependencies.missing = "^1.0.0";
    writeFileSync(join(app, "package.json"), JSON.stringify(manifest));
    await run({ A_CLI_CONFIG_TAR_B64: await packed("a-cli", "secret-1") });
    expect(readFileSync(join(configDir, "a-cli", "token"), "utf-8")).toBe("secret-1");
    expect(logs).toHaveLength(1);
    expect(logs[0]).toStartWith("CLI credentials: missing is not installed");
  });

  it("logs, without throwing, when the app has no readable package.json", async () => {
    await run({});
    expect(logs).toHaveLength(1);
    expect(logs[0]).toStartWith("CLI credentials not unpacked: ");
  });
});
