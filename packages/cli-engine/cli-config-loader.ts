/**
 * Validates a maintainer-authored CLI allowlist into the internal `CliConfig`
 * that `cli-tool.ts` consumes. A plugin owns its allowlist as data and hands
 * the already-parsed object over (via `loadCliConfigFromObject` or the
 * synchronous `parseCliConfig`); the safety barrier is a strict Zod schema and,
 * when `minVersion` is declared, a `--version` check. Every failure mode is
 * fail-closed: a schema violation or an unmet `minVersion` returns
 * `{ ok: false, reason }`, never a thrown exception or a partially-applied
 * config. The maintainer who declares a plugin is already fully trusted with
 * the machine, so the config is data to validate, not a policy to second-guess
 * beyond schema/version checks.
 */
import { CliConfigFileSchema, type CliConfigFile } from "./cli-config-schema.ts";
import { checkCliVersion } from "./cli-version-check.ts";
import type { runCli } from "./cli-executor.ts";
import type { CliConfig } from "./cli-tool.ts";

/** Maps the external file shape into the internal runtime `CliConfig`
 * shape `src/tools/cli-tool.ts` consumes. */
export function toCliConfig(raw: CliConfigFile): CliConfig {
  return {
    allowedPrefixes: raw.commands.map((c) => ({ prefix: c.prefix, confirm: c.confirm, mutating: c.mutating, postProcess: c.postProcess })),
    globalFlags: raw.globalFlags,
  };
}

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
