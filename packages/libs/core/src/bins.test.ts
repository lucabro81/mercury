/**
 * The maintenance commands `mfw vault` and `mfw memory` run inside the app's
 * container as `bun run mercury-vault` / `bun run mercury-memory`: bins of this
 * package, so they resolve the same in the monorepo and in an app installed
 * from npm. Each must point at a shipped, directly executable file.
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf-8")) as {
  bin?: Record<string, string>;
  files?: string[];
};

describe("core bins", () => {
  test.each([
    ["mercury-vault", "./src/wiki/vault-cli.ts"],
  ])("%s → %s, a Bun script", (name, path) => {
    expect(manifest.bin?.[name]).toBe(path);
    expect(readFileSync(join(root, path), "utf-8").startsWith("#!/usr/bin/env bun\n")).toBe(true);
  });
});
