/**
 * The pure, side-effect-free half of the Jira plugin's binary provisioning:
 * how a Node platform/arch pair maps to one of the CLI's published release
 * assets, how the release download URL is built, and how the version pin is
 * read out of the plugin's own package.json. The postinstall script
 * (`scripts/install-jira-cli.ts`) composes these with Bun's `fetch` and a file
 * write to actually fetch the binary at install time; keeping the logic here
 * lets it be unit-tested without touching the network or the filesystem.
 *
 * The binary version is pinned as data in package.json (`mercury.cliBinary`)
 * rather than resolved to "latest" at install time: two builds weeks apart must
 * bake the identical binary, so the pin is bumped deliberately, not drifted
 * into. This is what makes the image reproducible — the reason the download
 * moved off the build-time `install-clis.sh` "latest per crate" resolution and
 * onto the versioned plugin package.
 */
import { z } from "zod";

/** The three platform triples the CLI monorepo publishes an asset for — there
 * is deliberately no macos-x86_64 (Intel Mac) build. */
export type Platform = "linux-x86_64" | "linux-arm64" | "macos-arm64";

/** The pinned binary coordinates, read from package.json's `mercury.cliBinary`. */
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
    throw new Error(`unsupported platform for jira CLI: ${platform}/${arch}`);
  }
  const triple = `${os}-${cpu}`;
  // macos-x86_64 resolves above but has no published asset — reject it here so
  // the failure is a clear "unsupported", not a download 404.
  if (triple !== "linux-x86_64" && triple !== "linux-arm64" && triple !== "macos-arm64") {
    throw new Error(`no published jira CLI asset for platform ${triple}`);
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
