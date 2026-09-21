/**
 * Checks an installed CLI binary's version against a maintainer-declared
 * `minVersion` (from an externally-configured CLI config file, see
 * `src/tools/cli-config-loader.ts`). No version-check convention existed
 * anywhere in this codebase before this — confirmed by searching
 * `scripts/install-clis.sh` (only resolves GitHub release *tags* to pick
 * a download asset, never validates an already-installed binary) and the
 * rest of `src/`.
 *
 * Assumes `--version` is the right flag to invoke — the CLIs are
 * Rust/clap-based, and `--version` is clap's near-universal default, but
 * this isn't verified against the real CLI-monorepo binaries from here.
 * If wrong, the failure mode is still safe: `checkCliVersion` fails
 * closed (that CLI just never activates), not silently permissive.
 *
 * Version comparison is hand-rolled rather than a new dependency —
 * comparing well-formed `X.Y.Z` triples numerically isn't the kind of
 * genuinely tricky parsing problem that justified pulling in
 * `shell-quote` for command tokenizing.
 */
import { runCli } from "./cli-executor.ts";

export type ParsedVersion = { major: number; minor: number; patch: number };

const VERSION_PATTERN = /(\d+)\.(\d+)\.(\d+)/;

/** Extracts the first `major.minor.patch` triple found in `text`, or
 * `null` if none is present. */
export function parseVersion(text: string): ParsedVersion | null {
  const match = VERSION_PATTERN.exec(text);
  if (!match) {
    return null;
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

/** Numeric major/minor/patch comparison: -1 if `a` < `b`, 0 if equal, 1
 * if `a` > `b`. */
export function compareVersions(a: ParsedVersion, b: ParsedVersion): -1 | 0 | 1 {
  if (a.major !== b.major) return a.major > b.major ? 1 : -1;
  if (a.minor !== b.minor) return a.minor > b.minor ? 1 : -1;
  if (a.patch !== b.patch) return a.patch > b.patch ? 1 : -1;
  return 0;
}

export type VersionCheckResult = { ok: true } | { ok: false; reason: string };

/**
 * Runs `<binary> --version` (via the injected `runCliFn`) and checks the
 * result against `minVersion`. Never throws — every failure mode
 * (malformed `minVersion`, the CLI invocation failing, unparseable
 * output, a version below the minimum) resolves to `{ ok: false, reason
 * }` instead.
 */
export async function checkCliVersion(
  binary: string,
  minVersion: string,
  runCliFn: typeof runCli,
): Promise<VersionCheckResult> {
  const required = parseVersion(minVersion);
  if (!required) {
    return { ok: false, reason: `configured minVersion "${minVersion}" is not a valid version` };
  }

  const result = await runCliFn(binary, ["--version"]);
  if (!result.ok) {
    return { ok: false, reason: `could not determine ${binary}'s version: ${result.error}` };
  }

  const output = typeof result.data === "string" ? result.data : String(result.data);
  const installed = parseVersion(output);
  if (!installed) {
    return { ok: false, reason: `could not parse a version number out of "${output}"` };
  }

  if (compareVersions(installed, required) < 0) {
    return {
      ok: false,
      reason: `${binary} version ${output.trim()} is below the required minVersion ${minVersion}`,
    };
  }

  return { ok: true };
}
