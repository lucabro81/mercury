/**
 * The CLI credentials folder a plugin declares in its own package.json
 * (`mercury.cliCredentials: { folder }`): the folder under `~/.config` where
 * the plugin's CLI keeps its login and reads it back at runtime. The app's env
 * file carries it packed into a variable (`mfw credentials set` writes it), and
 * the core unpacks it onto the credentials volume at startup. Declared by the
 * plugin rather than listed anywhere central, so a plugin from any author gets
 * the same mechanism; read as data, so both `mfw` on the host and the core in
 * the container find it without running the plugin's code.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

/** One dependency's declaration, with the env variable that carries it. */
export type CliCredentials = { package: string; folder: string; variable: string };

/** A single folder name: no separators, no `.`/`..`, no leading dot. */
const FOLDER = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

/**
 * The folder declared in `mercury.cliCredentials` of a package.json-shaped
 * object, or undefined when the package declares none. A malformed declaration
 * throws: a typo must surface, not silently leave the CLI without its login.
 * Hand-validated, like `readPinnedBinary`, to keep this package dependency-free.
 */
export function readCliCredentials(pkg: unknown): string | undefined {
  const mercury = (pkg as { mercury?: Record<string, unknown> } | undefined)?.mercury;
  if (mercury === undefined || !("cliCredentials" in mercury)) return undefined;
  const declared = mercury.cliCredentials as { folder?: unknown } | null;
  const folder = typeof declared === "object" && declared !== null ? declared.folder : undefined;
  if (typeof folder !== "string" || !FOLDER.test(folder)) {
    throw new Error(
      "invalid mercury.cliCredentials in package.json: expected { folder } with a single folder name under ~/.config",
    );
  }
  return folder;
}

/** The env variable carrying `folder` packed: `jira-cli` → `JIRA_CLI_CONFIG_TAR_B64`. */
export function credentialsVariable(folder: string): string {
  return `${folder.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_CONFIG_TAR_B64`;
}

/**
 * The declarations of the app's dependencies (its package.json `dependencies`,
 * read from its `node_modules`), in the manifest's order. Throws naming the
 * dependency when one isn't installed or declares a malformed folder, and when
 * two declare the same folder (one volume folder can't hold two logins).
 */
export function appCliCredentials(appDir: string): CliCredentials[] {
  const manifest = JSON.parse(readFileSync(join(appDir, "package.json"), "utf-8")) as {
    dependencies?: Record<string, string>;
  };
  const found: CliCredentials[] = [];
  for (const name of Object.keys(manifest.dependencies ?? {})) {
    const path = join(appDir, "node_modules", name, "package.json");
    if (!existsSync(path)) {
      throw new Error(`${name} is not installed (no ${path}): run bun install`);
    }
    let folder: string | undefined;
    try {
      folder = readCliCredentials(JSON.parse(readFileSync(path, "utf-8")));
    } catch (err) {
      throw new Error(`${name}: ${err instanceof Error ? err.message : String(err)}`);
    }
    if (folder === undefined) continue;
    const clash = found.find((c) => c.folder === folder);
    if (clash !== undefined) {
      throw new Error(`CLI credentials folder "${folder}" is declared by both ${clash.package} and ${name}`);
    }
    found.push({ package: name, folder, variable: credentialsVariable(folder) });
  }
  return found;
}
