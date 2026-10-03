import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync, rmSync } from "node:fs";
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
  let configDir: string;
  let logs: string[];

  /** The app declares `deps`, each installed with the given credentials folder (or none). */
  function appWith(deps: Record<string, string | undefined>): void {
    writeFileSync(
      join(app, "package.json"),
      JSON.stringify({ dependencies: Object.fromEntries(Object.keys(deps).map((d) => [d, "^1.0.0"])) }),
    );
    for (const [name, folder] of Object.entries(deps)) {
      const dir = join(app, "node_modules", name);
      mkdirSync(dir, { recursive: true });
      const manifest = folder === undefined ? { name } : { name, mercury: { cliCredentials: { folder } } };
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
    await materializeCliCredentials({ appDir: app, configDir, env, log: (m) => logs.push(m) });
  }

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "materialize-"));
    app = join(root, "app");
    mkdirSync(app);
    configDir = join(root, "home", ".config");
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

  it("logs, without throwing, when the declarations can't be read", async () => {
    writeFileSync(join(app, "package.json"), JSON.stringify({ dependencies: { missing: "^1.0.0" } }));
    await run({});
    expect(logs).toHaveLength(1);
    expect(logs[0]).toStartWith("CLI credentials not unpacked: missing is not installed");
  });
});
