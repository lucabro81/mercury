/**
 * Loads Mercury's externally-configured, maintainer-authored per-CLI
 * config files (e.g. `cli-configs/jira.json`, bind-mounted at runtime —
 * see `docker-compose.override.yml` — never baked into the image). This
 * is the mechanism that replaced a hardcoded `Record<string, CliConfig>`
 * in `src/index.ts` and a hand-written per-CLI module (`src/tools/jira.ts`,
 * since removed — this is history, not a live pointer): the maintainer
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
    allowedPrefixes: raw.commands.map((c) => ({ prefix: c.prefix, confirm: c.confirm, mutating: c.mutating, postProcess: c.postProcess })),
    globalFlags: raw.globalFlags,
  };
}

export type CliConfigLoadResult = { ok: true; config: CliConfig } | { ok: false; reason: string };

export type CliConfigFromObjectResult =
  | { ok: true; binary: string; config: CliConfig }
  | { ok: false; reason: string };

/**
 * The object-based sibling of `loadCliConfig`: a plugin owns its allowlist as
 * data and hands the already-parsed object over, instead of the core scanning
 * a config directory for it. The safety barrier stays here — the same
 * `.strict()` Zod schema and, when `minVersion` is declared, the same version
 * check — so a plugin's config reaches `runCommand`'s allowlist through the
 * identical validation the file path uses; only the file read drops out. No
 * requested-vs-declared binary match: the plugin declares its own binary and
 * there's no separate name to reconcile it against, so the validated
 * `binary` is returned for the caller to key its map by. Never throws.
 */
export async function loadCliConfigFromObject(
  raw: unknown,
  opts: { runCliFn: typeof runCli },
): Promise<CliConfigFromObjectResult> {
  const validated = CliConfigFileSchema.safeParse(raw);
  if (!validated.success) {
    const issues = validated.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    return { ok: false, reason: `plugin config does not match the expected schema: ${issues}` };
  }

  if (validated.data.minVersion) {
    const versionResult = await checkCliVersion(validated.data.binary, validated.data.minVersion, opts.runCliFn);
    if (!versionResult.ok) {
      return { ok: false, reason: versionResult.reason };
    }
  }

  return { ok: true, binary: validated.data.binary, config: toCliConfig(validated.data) };
}

/**
 * The synchronous, no-spawn sibling of `loadCliConfigFromObject`: schema
 * validation only, skipping the `minVersion` `--version` check. It's what a
 * plugin uses on its own allowlist in `build()` — a plugin ships its pinned CLI
 * binary alongside its allowlist, so the two are co-versioned by construction
 * and the runtime version check earns nothing there (it stays for file-based
 * configs, where a deployer's binary and allowlist can drift — see
 * `loadCliConfig`). Never throws.
 */
export function parseCliConfig(raw: unknown): CliConfigFromObjectResult {
  const validated = CliConfigFileSchema.safeParse(raw);
  if (!validated.success) {
    const issues = validated.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    return { ok: false, reason: `plugin config does not match the expected schema: ${issues}` };
  }
  return { ok: true, binary: validated.data.binary, config: toCliConfig(validated.data) };
}

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
