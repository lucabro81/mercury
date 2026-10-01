/**
 * Consumes the pending changesets into versions and changelogs, then commits
 * and tags the result. Run from the repo root: `bun run release`.
 *
 * - The framework packages move in lockstep (Changesets' `fixed` group), so
 *   they share one version: when it changes, the release is tagged
 *   `v<version>`, the version people refer to.
 * - Plugins and channels are versioned on their own: each package released
 *   gets its own `<name>@<version>` tag (`changeset git-tag`).
 *
 * Publishing is a separate step (`scripts/publish.ts`).
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** The pending changesets in `dir` (the `.changeset` folder): every Markdown
 * file but its README. */
export function pendingChangesets(dir: string): string[] {
  return readdirSync(dir).filter((f) => f.endsWith(".md") && f !== "README.md");
}

if (import.meta.main) {
  const root = join(import.meta.dir, "..");

  /** Runs `cmd` from the repo root, inheriting output; throws when it fails. */
  function run(...cmd: string[]): void {
    const proc = Bun.spawnSync(cmd, { cwd: root, stdout: "inherit", stderr: "inherit" });
    if (proc.exitCode !== 0) {
      throw new Error(`${cmd.join(" ")} failed`);
    }
  }

  /** The framework's version, read from the core (every framework package has it). */
  const frameworkVersion = (): string =>
    (JSON.parse(readFileSync(join(root, "packages/libs/core/package.json"), "utf-8")) as { version: string }).version;

  // Nothing to release is not an error, just nothing to do: stop before
  // touching the lockfile or git.
  if (pendingChangesets(join(root, ".changeset")).length === 0) {
    console.log("No pending changesets: nothing to release.");
    process.exit(0);
  }

  const before = frameworkVersion();
  run("bunx", "changeset", "version");
  // The workspaces' versions are recorded in the lockfile too.
  run("bun", "install");
  const after = frameworkVersion();

  run("git", "add", "-A", ".changeset", "bun.lock", "--", ":(glob)**/package.json", ":(glob)**/CHANGELOG.md");
  const message = after !== before ? `Release v${after}` : "Release plugins";
  run("git", "commit", "-m", message);
  run("bunx", "changeset", "git-tag");
  if (after !== before) {
    run("git", "tag", `v${after}`);
  }
  console.log(`${message}: tagged. Push with: git push && git push --tags`);
}
