/**
 * `mfw vault` and `mfw memory` run the core's maintenance CLIs by path inside
 * the app's container (`bun node_modules/@mercury-fw/core/<path>`): moving or
 * renaming either file breaks those commands, and leaving it out of the
 * published package breaks them in every app installed from npm.
 */
import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const files = (JSON.parse(readFileSync(join(root, "package.json"), "utf-8")) as { files: string[] }).files;

describe("the maintenance CLIs mfw runs", () => {
  test.each(["src/wiki/vault-cli.ts", "src/memory/memory-cli.ts"])("%s is where mfw looks, and ships", (path) => {
    expect(existsSync(join(root, path))).toBe(true);
    expect(files).toContain("src");
  });
});
