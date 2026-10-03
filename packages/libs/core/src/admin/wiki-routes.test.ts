/**
 * The admin and HTTP wiki routes' grep, on a temporary vault: the same
 * search as the model's, case ignored, over the whole vault.
 */
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { grepWikiVault } from "./wiki-routes.ts";

let vault: string;
beforeEach(() => {
  vault = mkdtempSync(join(tmpdir(), "mercury-wiki-routes-"));
  mkdirSync(join(vault, "curated", "projects"), { recursive: true });
  writeFileSync(join(vault, "curated", "projects", "names.md"), "# Projects\nMonorepo: MON\n");
});
afterEach(() => {
  rmSync(vault, { recursive: true, force: true });
});

describe("grepWikiVault", () => {
  it("ignores case", async () => {
    expect(await grepWikiVault(vault, "monorepo")).toEqual([{ path: "curated/projects/names.md", line: 2, text: "Monorepo: MON" }]);
  });
});
