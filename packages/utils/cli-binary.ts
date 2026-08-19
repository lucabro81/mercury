/**
 * Shared helper for provisioning a plugin's pinned CLI binary. Every plugin
 * that owns a CLI binary downloads it the same way — the only thing that
 * differs is the pin (repo/crate/version), which each plugin declares as data
 * in its own package.json (`mercury.cliBinary`). This module is that common
 * mechanism, factored out when the second plugin (Bitbucket) would otherwise
 * have duplicated it verbatim.
 *
 * The pure parts (platform resolution, URL construction, reading the pin) are
 * unit-tested; `downloadPinnedBinary` composes them with Bun's `fetch` and a
 * file write and is the body of each plugin's postinstall script.
 *
 * The binary version is pinned as data rather than resolved to "latest" at
 * install time: two builds weeks apart must bake the identical binary, so the
 * pin is bumped deliberately. That reproducibility is why binary provisioning
 * moved off the build-time `install-clis.sh` "latest per crate" resolution and
 * onto the versioned plugin packages.
 */
import { chmod, mkdir } from "node:fs/promises";
import { z } from "zod";

/** The three platform triples the CLI monorepo publishes an asset for — there
 * is deliberately no macos-x86_64 (Intel Mac) build. */
export type Platform = "linux-x86_64" | "linux-arm64" | "macos-arm64";

/** The pinned binary coordinates, read from a package.json's `mercury.cliBinary`. */
export type PinnedBinary = { repo: string; crate: string; version: string };

const pinnedBinarySchema = z
  .object({
    repo: z.string().min(1),
    crate: z.string().min(1),
    version: z.string().min(1),
  })
  .strict();

/**
 * Maps a Node `process.platform` / `process.arch` pair to the published asset
 * platform triple, throwing for any combination with no asset (an Intel Mac,
 * an unknown OS or architecture) rather than building a URL that 404s.
 */
export function resolvePlatform(platform: string, arch: string): Platform {
  const os = platform === "linux" ? "linux" : platform === "darwin" ? "macos" : undefined;
  const cpu = arch === "x64" ? "x86_64" : arch === "arm64" ? "arm64" : undefined;
  if (!os || !cpu) {
    throw new Error(`unsupported platform for CLI binary: ${platform}/${arch}`);
  }
  const triple = `${os}-${cpu}`;
  // macos-x86_64 resolves above but has no published asset — reject it here so
  // the failure is a clear "unsupported", not a download 404.
  if (triple !== "linux-x86_64" && triple !== "linux-arm64" && triple !== "macos-arm64") {
    throw new Error(`no published CLI asset for platform ${triple}`);
  }
  return triple;
}

/**
 * Builds the GitHub release download URL for a pinned binary and a resolved
 * platform. Releases are tagged per crate as `<crate>-v<version>` and each
 * carries one asset per platform named `<crate>-<platform>`.
 */
export function binaryAssetUrl(pin: PinnedBinary, platform: Platform): string {
  return `https://github.com/${pin.repo}/releases/download/${pin.crate}-v${pin.version}/${pin.crate}-${platform}`;
}

/**
 * Reads and validates the `mercury.cliBinary` pin out of a package.json-shaped
 * object, throwing a clear error when it's missing or malformed — a typo in the
 * pin must fail the install loudly, not silently fetch the wrong thing.
 */
export function readPinnedBinary(pkg: unknown): PinnedBinary {
  const cliBinary = (pkg as { mercury?: { cliBinary?: unknown } })?.mercury?.cliBinary;
  const parsed = pinnedBinarySchema.safeParse(cliBinary);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`invalid or missing mercury.cliBinary pin in package.json: ${issues}`);
  }
  return parsed.data;
}

/**
 * Downloads a plugin's pinned CLI binary into its `bin/` directory. Called from
 * a plugin's postinstall as `downloadPinnedBinary(pkg, import.meta.url)`, where
 * `pkg` is the plugin's own imported package.json and the script lives in the
 * plugin's `scripts/` — so `../bin/` resolves to the plugin's `bin/`. Uses
 * Bun's `fetch` (no curl/jq). Throws on a failed download, failing the install
 * loudly rather than producing an image without the binary it asked for.
 */
export async function downloadPinnedBinary(pkg: unknown, scriptUrl: string | URL): Promise<void> {
  const pin = readPinnedBinary(pkg);
  const platform = resolvePlatform(process.platform, process.arch);
  const url = binaryAssetUrl(pin, platform);

  const binDir = new URL("../bin/", scriptUrl);
  const binPath = new URL(`./${pin.crate}`, binDir);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`failed to download ${pin.crate} CLI from ${url}: HTTP ${response.status} ${response.statusText}`);
  }

  await mkdir(binDir, { recursive: true });
  await Bun.write(binPath, response);
  await chmod(binPath, 0o755);

  console.log(`[${pin.crate}] installed ${pin.crate} ${pin.version} (${platform}) from ${url}`);
}
