/**
 * postinstall hook for @mercury/plugin-jira: downloads the pinned jira CLI
 * binary for the current platform and drops it in the package's `bin/`. Runs
 * automatically on `bun install` — on the host during development (yielding a
 * native macos-arm64 binary) and inside the Docker build (linux). The Dockerfile
 * then symlinks each plugin's downloaded bin contents onto PATH so `runCommand`
 * can spawn `jira` by name, exactly as it did when the binary came from
 * `scripts/install-clis.sh`.
 *
 * The download uses Bun's own `fetch`, not curl/jq — nothing extra has to be
 * installed to run it, which is what lets the binary provisioning move off the
 * separate `clis` Docker stage without dragging that stage's tooling (and its
 * CVEs) into the final image.
 *
 * The version is pinned in package.json (`mercury.cliBinary`); a failed
 * download throws and fails the install, matching the old script's fail-loud
 * behaviour — a build that can't fetch the binary it asked for should not
 * silently produce an image without it.
 */
import { chmod, mkdir } from "node:fs/promises";
import pkg from "../package.json";
import { readPinnedBinary, resolvePlatform, binaryAssetUrl } from "../cli-binary.ts";

const pin = readPinnedBinary(pkg);
const platform = resolvePlatform(process.platform, process.arch);
const url = binaryAssetUrl(pin, platform);

// Resolve the output path relative to this script, not the process CWD —
// `bun install` runs a workspace package's postinstall from the package root,
// but resolving from `import.meta.dir` is robust regardless.
const binDir = new URL("../bin/", import.meta.url);
const binPath = new URL(`./${pin.crate}`, binDir);

const response = await fetch(url);
if (!response.ok) {
  throw new Error(`failed to download ${pin.crate} CLI from ${url}: HTTP ${response.status} ${response.statusText}`);
}

await mkdir(binDir, { recursive: true });
await Bun.write(binPath, response);
await chmod(binPath, 0o755);

console.log(`[plugin-jira] installed ${pin.crate} ${pin.version} (${platform}) from ${url}`);
