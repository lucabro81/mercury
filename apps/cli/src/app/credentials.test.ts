/**
 * Packing a CLI's config folder into the value of its credentials variable,
 * and writing that variable into the app's env file, on temporary folders:
 * never a real CLI's config.
 */
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { chmodSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { packCredentials, setEnvVar } from "./credentials.ts";

let base: string;
beforeEach(() => {
  base = mkdtempSync(join(tmpdir(), "mercury-credentials-"));
});
afterEach(() => {
  rmSync(base, { recursive: true, force: true });
});

/** A fake CLI config folder at `dir`: one file at its root, one in a subfolder. */
function fakeConfig(dir: string): void {
  mkdirSync(join(dir, "profiles"), { recursive: true });
  writeFileSync(join(dir, "app.json"), '{"client_id":"fake"}\n');
  writeFileSync(join(dir, "profiles", "default.json"), '{"token":"fake"}\n');
}

/** Unpacks `value` the way the entrypoint does (base64 -d | tar xzf - -C dest)
 * and returns every file path under `dest`, sorted. */
async function unpack(value: string): Promise<string[]> {
  const dest = join(base, "unpacked");
  mkdirSync(dest);
  const proc = Bun.spawn(["tar", "xzf", "-", "-C", dest], { stdin: Buffer.from(value, "base64"), stderr: "pipe" });
  expect(await proc.exited).toBe(0);
  return [...new Bun.Glob("**/*").scanSync({ cwd: dest, dot: true })].sort();
}

describe("packCredentials", () => {
  test("the folder at the root of the archive, with everything in it, as base64 on one line", async () => {
    fakeConfig(join(base, "jira-cli"));
    const value = await packCredentials(join(base, "jira-cli"), "jira-cli");
    expect(value).toMatch(/^[A-Za-z0-9+/]+=*$/);
    expect(await unpack(value)).toEqual(["jira-cli/app.json", "jira-cli/profiles/default.json"]);
  });

  test("a folder with another name lands under the CLI's folder name", async () => {
    fakeConfig(join(base, "somewhere", "my-jira-login"));
    const value = await packCredentials(join(base, "somewhere", "my-jira-login"), "jira-cli");
    expect(await unpack(value)).toEqual(["jira-cli/app.json", "jira-cli/profiles/default.json"]);
  });

  // Regression: a config folder that is itself a symlink (dotfiles managed by
  // stow or chezmoi) was packed as the bare link, which the container unpacked
  // as a dangling symlink: the folder "existed" forever, the CLI never logged in.
  test("a config folder that is a symlink packs what it points to", async () => {
    fakeConfig(join(base, "dotfiles", "jira"));
    symlinkSync(join(base, "dotfiles", "jira"), join(base, "jira-cli"));
    const value = await packCredentials(join(base, "jira-cli"), "jira-cli");
    expect(await unpack(value)).toEqual(["jira-cli/app.json", "jira-cli/profiles/default.json"]);
  });

  test("a missing folder is an error that names it", async () => {
    await expect(packCredentials(join(base, "nope"), "jira-cli")).rejects.toThrow(`No folder at ${join(base, "nope")}`);
  });
});

describe("setEnvVar", () => {
  test("replaces the variable's line, leaving every other line as it was", () => {
    const file = join(base, "env");
    writeFileSync(file, "# comment\nOLLAMA_MODEL=qwen\nJIRA_CLI_CONFIG_TAR_B64=old\nJIRA_SITE_URL=https://x\n");
    setEnvVar(file, "JIRA_CLI_CONFIG_TAR_B64", "new");
    expect(readFileSync(file, "utf-8")).toBe("# comment\nOLLAMA_MODEL=qwen\nJIRA_CLI_CONFIG_TAR_B64=new\nJIRA_SITE_URL=https://x\n");
  });

  test("appends it when it isn't there, adding the missing final newline first", () => {
    const file = join(base, "env");
    writeFileSync(file, "OLLAMA_MODEL=qwen");
    setEnvVar(file, "JIRA_CLI_CONFIG_TAR_B64", "new");
    expect(readFileSync(file, "utf-8")).toBe("OLLAMA_MODEL=qwen\nJIRA_CLI_CONFIG_TAR_B64=new\n");
  });

  test("a commented-out line or a longer name isn't the variable", () => {
    const file = join(base, "env");
    writeFileSync(file, "# JIRA_CLI_CONFIG_TAR_B64=x\nJIRA_CLI_CONFIG_TAR_B64_OLD=y\n");
    setEnvVar(file, "JIRA_CLI_CONFIG_TAR_B64", "new");
    expect(readFileSync(file, "utf-8")).toBe("# JIRA_CLI_CONFIG_TAR_B64=x\nJIRA_CLI_CONFIG_TAR_B64_OLD=y\nJIRA_CLI_CONFIG_TAR_B64=new\n");
  });

  // Regression: only the first assignment was replaced, and Compose takes the
  // last one, so a pasted duplicate kept the stale credentials in effect.
  test("every assignment of the variable becomes the one new line, `export` form included", () => {
    const file = join(base, "env");
    writeFileSync(file, "JIRA_CLI_CONFIG_TAR_B64=old1\nA=1\nexport JIRA_CLI_CONFIG_TAR_B64=old2\nB=2\nJIRA_CLI_CONFIG_TAR_B64 = old3\n");
    setEnvVar(file, "JIRA_CLI_CONFIG_TAR_B64", "new");
    expect(readFileSync(file, "utf-8")).toBe("JIRA_CLI_CONFIG_TAR_B64=new\nA=1\nB=2\n");
  });

  test("an existing file keeps its permissions", () => {
    const file = join(base, "env");
    writeFileSync(file, "A=1\n", { mode: 0o640 });
    chmodSync(file, 0o640);
    setEnvVar(file, "JIRA_CLI_CONFIG_TAR_B64", "new");
    expect(statSync(file).mode & 0o777).toBe(0o640);
  });

  test("the file is replaced whole, through a temporary file next to it that doesn't stay behind", () => {
    const file = join(base, "env");
    writeFileSync(file, "A=1\n");
    setEnvVar(file, "JIRA_CLI_CONFIG_TAR_B64", "new");
    expect(readdirSync(base)).toEqual(["env"]);
  });

  test("a missing file is created, readable by its owner only", () => {
    const file = join(base, "env");
    setEnvVar(file, "JIRA_CLI_CONFIG_TAR_B64", "new");
    expect(readFileSync(file, "utf-8")).toBe("JIRA_CLI_CONFIG_TAR_B64=new\n");
    expect(statSync(file).mode & 0o777).toBe(0o600);
  });
});
