/**
 * The version of each package a new app depends on, read from the package
 * itself as the CLI resolves it. While the CLI runs from this repo that's the
 * workspace's version; once the packages are published the registry takes over.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

/** Maps each of `packages` to its version. Throws naming a package it can't
 * resolve or whose manifest it can't find. */
export function packageVersions(packages: string[]): Record<string, string> {
  const versions: Record<string, string> = {};
  for (const pkg of packages) {
    versions[pkg] = versionOf(pkg);
  }
  return versions;
}

/** Walks up from the package's resolved entry file to its own manifest. */
function versionOf(pkg: string): string {
  let entry: string;
  try {
    entry = Bun.resolveSync(pkg, import.meta.dir);
  } catch {
    throw new Error(`Can't find the package ${pkg}`);
  }
  for (let dir = dirname(entry); dir !== dirname(dir); dir = dirname(dir)) {
    const manifest = join(dir, "package.json");
    if (existsSync(manifest)) {
      const parsed = JSON.parse(readFileSync(manifest, "utf-8")) as { name?: string; version?: string };
      if (parsed.name === pkg && parsed.version) {
        return parsed.version;
      }
    }
  }
  throw new Error(`Can't find the manifest of ${pkg}`);
}
