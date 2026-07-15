/**
 * Loads Mercury's externally-configured, maintainer-authored per-CLI
 * config files (e.g. `cli-configs/jira.json`, bind-mounted at runtime —
 * see `docker-compose.override.yml` — never baked into the image). This
 * is the mechanism that replaced a hardcoded `Record<string, CliConfig>`
 * in `src/index.ts` and the hand-written `jira.ts` module: the maintainer
 * who sets `MERCURY_CLIS` is already fully trusted with the machine, so
 * the config they supply is data to validate and load, not a policy
 * Mercury itself second-guesses beyond schema/version checks.
 *
 * Every failure mode here is fail-closed: a missing file, invalid JSON,
 * a schema violation, a binary-name mismatch, or an unmet `minVersion`
 * all mean that CLI simply never ends up in the map `src/index.ts` uses
 * to build `runCommand`'s allowlist — never a thrown exception, never a
 * partially-applied config.
 */
import { CliConfigFileSchema, type CliConfigFile } from "./cli-config-schema.ts";
import { checkCliVersion } from "./cli-version-check.ts";
import type { runCli } from "./cli-executor.ts";
import type { CliConfig } from "./cli-tool.ts";

export type CliConfigFileResult = { ok: true; raw: CliConfigFile } | { ok: false; reason: string };

/** Reads and validates a single config file at `path`. Never throws. */
export async function loadCliConfigFile(path: string): Promise<CliConfigFileResult> {
  let text: string;
  try {
    text = await Bun.file(path).text();
  } catch (err) {
    return { ok: false, reason: `could not read ${path}: ${String(err)}` };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    return { ok: false, reason: `${path} is not valid JSON: ${String(err)}` };
  }

  const validated = CliConfigFileSchema.safeParse(parsed);
  if (!validated.success) {
    const issues = validated.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    return { ok: false, reason: `${path} does not match the expected schema: ${issues}` };
  }

  return { ok: true, raw: validated.data };
}

/** Maps the external file shape into the internal runtime `CliConfig`
 * shape `src/tools/cli-tool.ts` consumes. */
export function toCliConfig(raw: CliConfigFile): CliConfig {
  return {
    allowedPrefixes: raw.commands.map((c) => ({ prefix: c.prefix, confirm: c.confirm })),
    globalFlags: raw.globalFlags,
  };
}

export type CliConfigLoadResult = { ok: true; config: CliConfig } | { ok: false; reason: string };

/**
 * Loads and validates `<configDir>/<binary>.json`, checking that the
 * file's own declared `binary` matches (catches a maintainer copying
 * one CLI's config into a new file without updating its contents), then
 * runs the version check (`checkCliVersion`) if `minVersion` is present.
 */
export async function loadCliConfig(
  binary: string,
  opts: { configDir: string; runCliFn: typeof runCli },
): Promise<CliConfigLoadResult> {
  const fileResult = await loadCliConfigFile(`${opts.configDir}/${binary}.json`);
  if (!fileResult.ok) {
    return fileResult;
  }

  if (fileResult.raw.binary !== binary) {
    return {
      ok: false,
      reason: `config file for "${binary}" declares binary "${fileResult.raw.binary}" instead — refusing to load`,
    };
  }

  if (fileResult.raw.minVersion) {
    const versionResult = await checkCliVersion(binary, fileResult.raw.minVersion, opts.runCliFn);
    if (!versionResult.ok) {
      return { ok: false, reason: versionResult.reason };
    }
  }

  return { ok: true, config: toCliConfig(fileResult.raw) };
}

/**
 * Loads a `CliConfig` for every name in `enabledNames`, logging a clear
 * reason (via the injected `log`, defaulting to `console.error`) for
 * every one that fails — those simply don't appear in the returned map,
 * same default-deny shape as a missing entry in a hardcoded registry.
 */
export async function loadActiveCliConfigs(
  enabledNames: string[],
  opts: { configDir: string; runCliFn: typeof runCli; log?: (msg: string) => void },
): Promise<Record<string, CliConfig>> {
  const log = opts.log ?? ((msg: string) => console.error(msg));
  const result: Record<string, CliConfig> = {};

  for (const name of enabledNames) {
    const loaded = await loadCliConfig(name, opts);
    if (loaded.ok) {
      result[name] = loaded.config;
    } else {
      log(`CLI "${name}" not activated: ${loaded.reason}`);
    }
  }

  return result;
}
