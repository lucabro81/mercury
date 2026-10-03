/**
 * The CLI credentials folder a plugin declares in its own package.json
 * (`mercury.cliCredentials`): where the plugin's CLI keeps its login and reads
 * it back at runtime, either `{ folder }` under `~/.config` (the usual place)
 * or `{ path }` anywhere under the home. The app's env file carries it packed
 * into a variable (`mfw credentials set` writes it), and the core unpacks it
 * onto the credentials volume at startup. Declared by the plugin rather than
 * listed anywhere central, so a plugin from any author gets the same
 * mechanism; read as data, so both `mfw` on the host and the core in the
 * container find it without running the plugin's code.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

/** What a plugin declares: `name` as it was declared (the folder, or the
 * path), which `mfw credentials` takes and the variable is named after, and
 * `path` relative to the home. */
export type DeclaredCredentials = { name: string; path: string };

/** One dependency's declaration, with the env variable that carries it. */
export type CliCredentials = DeclaredCredentials & { package: string; variable: string };

/** What an app's dependencies declare: the usable declarations, and one line
 * per dependency left out (not installed, malformed, sharing a variable). */
export type AppCliCredentials = { declared: CliCredentials[]; problems: string[] };

/** A single folder name: no separators, no `.`/`..`, no leading dot. */
const FOLDER = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

/** One segment of a home-relative path, never starting with a dash (the last
 * one is a tar member name, not an option); `.` and `..` are refused apart. */
const SEGMENT = /^[A-Za-z0-9._][A-Za-z0-9._-]*$/;

/** The credentials volume is mounted on `~/.config`; a login declared
 * anywhere else in the home lives on it under this folder. */
const ELSEWHERE = ".config/mercury-home";

const INVALID =
  "invalid mercury.cliCredentials in package.json: expected { folder } with a single folder name under ~/.config, or { path } relative to the home and outside ~/.config";

/** Whether `path` is a usable home-relative path for a login: inside the
 * home and outside `~/.config`, the volume, where a login is a `folder`. */
function isHomePath(path: string): boolean {
  const segments = path.split("/");
  if (!segments.every((s) => SEGMENT.test(s) && s !== "." && s !== "..")) return false;
  return path !== ".config" && !path.startsWith(".config/");
}

/**
 * What `mercury.cliCredentials` of a package.json-shaped object declares, or
 * undefined when the package declares nothing. A malformed declaration throws:
 * a typo must surface, not silently leave the CLI without its login.
 * Hand-validated, like `readPinnedBinary`, to keep this package dependency-free.
 */
export function readCliCredentials(pkg: unknown): DeclaredCredentials | undefined {
  const mercury = (pkg as { mercury?: unknown } | undefined)?.mercury;
  if (mercury === undefined) return undefined;
  if (typeof mercury !== "object" || mercury === null || Array.isArray(mercury)) {
    throw new Error("invalid mercury in package.json: expected an object");
  }
  if (!("cliCredentials" in mercury)) return undefined;
  const declared = (mercury as { cliCredentials?: unknown }).cliCredentials;
  if (typeof declared !== "object" || declared === null) throw new Error(INVALID);
  const { folder, path } = declared as { folder?: unknown; path?: unknown };
  if (folder !== undefined && path === undefined && typeof folder === "string" && FOLDER.test(folder)) {
    return { name: folder, path: `.config/${folder}` };
  }
  if (path !== undefined && folder === undefined && typeof path === "string" && isHomePath(path)) {
    return { name: path, path };
  }
  throw new Error(INVALID);
}

/** Where a home-relative login lives on the credentials volume, as a path
 * relative to the home: where it is when it's under `~/.config` (the
 * volume's mount, a declared `folder`), under `~/.config/mercury-home`
 * otherwise, with the home path pointing there. */
export function volumePath(path: string): string {
  return path.startsWith(".config/") ? path : `${ELSEWHERE}/${path}`;
}

/** The env variable carrying a declared login packed, named after what was
 * declared: `jira-cli` → `JIRA_CLI_CONFIG_TAR_B64`, `.aws` → `AWS_CONFIG_TAR_B64`. */
export function credentialsVariable(name: string): string {
  return `${name.toUpperCase().replace(/[^A-Z0-9]/g, "_").replace(/^_+/, "")}_CONFIG_TAR_B64`;
}

/**
 * The declarations of the app's dependencies (its package.json `dependencies`,
 * read from its `node_modules`), in the manifest's order. A dependency that
 * isn't installed or declares a malformed folder is left out with a problem
 * line, and so are all the ones whose declarations map to the same variable (one
 * variable can't carry two logins) or whose paths are one inside the other
 * (one would be linked inside the other's copy on the volume): one bad plugin
 * never costs the others their login. Throws only when the app's own
 * package.json can't be read.
 */
export function appCliCredentials(appDir: string): AppCliCredentials {
  const manifest = JSON.parse(readFileSync(join(appDir, "package.json"), "utf-8")) as {
    dependencies?: Record<string, string>;
  };
  const found: CliCredentials[] = [];
  const problems: string[] = [];
  for (const name of Object.keys(manifest.dependencies ?? {})) {
    const path = join(appDir, "node_modules", name, "package.json");
    if (!existsSync(path)) {
      problems.push(`${name} is not installed (no ${path}): run bun install`);
      continue;
    }
    try {
      const declared = readCliCredentials(JSON.parse(readFileSync(path, "utf-8")));
      if (declared !== undefined) found.push({ package: name, ...declared, variable: credentialsVariable(declared.name) });
    } catch (err) {
      problems.push(`${name}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  const excluded = new Set<CliCredentials>();
  for (const c of found) {
    const sharing = found.filter((o) => o.variable === c.variable);
    if (sharing.length === 1) continue;
    sharing.forEach((o) => excluded.add(o));
    if (sharing[0] === c) {
      problems.push(
        `${sharing.map((o) => o.package).join(" and ")} declare CLI credentials (${sharing.map((o) => o.name).join(", ")}) carried by the same variable ${c.variable}: neither is used`,
      );
    }
  }
  const inside = (outer: string, inner: string) => inner.startsWith(`${outer}/`);
  found.forEach((a, i) => {
    for (const b of found.slice(i + 1)) {
      if (!inside(a.path, b.path) && !inside(b.path, a.path)) continue;
      excluded.add(a);
      excluded.add(b);
      problems.push(`${a.package} and ${b.package} declare CLI credentials (${a.name}, ${b.name}) one inside the other: neither is used`);
    }
  });
  return { declared: found.filter((c) => !excluded.has(c)), problems };
}
