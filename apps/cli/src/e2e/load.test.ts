/**
 * Finding and loading e2e test files: the app's own `e2e/*.e2e.ts` when no
 * file is named, and a test file's default export checked to be a test.
 */
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { findTests, loadTest } from "./load.ts";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "mfw-e2e-load-"));
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("findTests", () => {
  test("named files, resolved from the current folder, in the order given", () => {
    expect(findTests(["b.e2e.ts", "/abs/a.e2e.ts"], { appDir: dir, cwd: "/here" })).toEqual(["/here/b.e2e.ts", "/abs/a.e2e.ts"]);
  });

  test("none named: the app's e2e/*.e2e.ts, sorted, nothing else", () => {
    mkdirSync(join(dir, "e2e", "results"), { recursive: true });
    for (const f of ["z.e2e.ts", "a.e2e.ts", "helpers.ts", "notes.md"]) writeFileSync(join(dir, "e2e", f), "");
    expect(findTests([], { appDir: dir, cwd: "/here" })).toEqual([join(dir, "e2e", "a.e2e.ts"), join(dir, "e2e", "z.e2e.ts")]);
  });

  test("none named and none in e2e/: an error saying where it looked", () => {
    expect(() => findTests([], { appDir: dir, cwd: dir })).toThrow(`No tests: none named, and no *.e2e.ts in ${join(dir, "e2e")}`);
  });
});

describe("loadTest", () => {
  test("the default export, when it's a test", async () => {
    const file = join(dir, "ok.e2e.ts");
    writeFileSync(file, 'export default { plugins: ["jira"], cases: [{ name: "c", turns: ["q"], check: () => {} }] };\n');
    const loaded = await loadTest(file);
    expect(loaded.plugins).toEqual(["jira"]);
    expect(loaded.cases.map((c) => c.name)).toEqual(["c"]);
  });

  test("a file without a test as its default export: an error naming it", async () => {
    const file = join(dir, "bad.e2e.ts");
    writeFileSync(file, "export const x = 1;\n");
    await expect(loadTest(file)).rejects.toThrow(`${file} doesn't export a test as default (export default e2e({ … }))`);
  });

  test("a case without name, turns or check: an error naming the file and the case", async () => {
    const file = join(dir, "half.e2e.ts");
    writeFileSync(file, 'export default { cases: [{ name: "c", turns: [] , check: () => {} }, { name: "d", check: () => {} }] };\n');
    await expect(loadTest(file)).rejects.toThrow(`${file}: case 1 ("c") has no turns`);
  });
});
