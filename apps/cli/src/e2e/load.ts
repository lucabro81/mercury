/**
 * Which e2e test files `mfw e2e` runs, and loading one: Bun imports the
 * TypeScript file as it is, and its default export is checked to look like
 * a test before anything starts.
 */
import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { E2eTest } from "./define.ts";

/** The files to run: `named` resolved from `cwd`, or, when none is named,
 * the app's `e2e/*.e2e.ts` in name order. */
export function findTests(named: string[], { appDir, cwd }: { appDir: string; cwd: string }): string[] {
  if (named.length > 0) return named.map((f) => resolve(cwd, f));
  const folder = join(appDir, "e2e");
  const found = existsSync(folder) ? readdirSync(folder).filter((f) => f.endsWith(".e2e.ts")).sort() : [];
  if (found.length === 0) throw new Error(`No tests: none named, and no *.e2e.ts in ${folder}`);
  return found.map((f) => join(folder, f));
}

/** The test `file` exports as default; throws naming the file when it isn't one. */
export async function loadTest(file: string): Promise<E2eTest> {
  const loaded = ((await import(pathToFileURL(file).href)) as { default?: unknown }).default as Partial<E2eTest> | undefined;
  if (loaded === undefined || loaded === null || !Array.isArray(loaded.cases)) {
    throw new Error(`${file} doesn't export a test as default (export default e2e({ … }))`);
  }
  for (const [i, c] of loaded.cases.entries()) {
    const which = `${file}: case ${i + 1} ("${c?.name ?? "?"}")`;
    if (typeof c?.name !== "string") throw new Error(`${which} has no name`);
    if (!Array.isArray(c.turns) || c.turns.length === 0) throw new Error(`${which} has no turns`);
    if (typeof c.check !== "function") throw new Error(`${which} has no check`);
  }
  return loaded as E2eTest;
}
