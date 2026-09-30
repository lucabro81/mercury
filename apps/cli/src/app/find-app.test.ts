/**
 * Where the app commands run: the Mercury app containing the current folder,
 * found by walking up to the folder that holds `mercury.config.ts`.
 */
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { findApp } from "./find-app.ts";

let base: string;
beforeEach(() => {
  base = mkdtempSync(join(tmpdir(), "mercury-find-app-"));
});
afterEach(() => {
  rmSync(base, { recursive: true, force: true });
});

/** An app folder at `dir` with `mercury.config.ts` and a manifest named `name`. */
function app(dir: string, name: string): void {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "mercury.config.ts"), "export default {};\n");
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name }));
}

describe("findApp", () => {
  test("the app's own folder", () => {
    app(join(base, "my-agent"), "my-agent");
    expect(findApp(join(base, "my-agent"))).toEqual({ dir: join(base, "my-agent"), name: "my-agent" });
  });

  test("any folder inside it", () => {
    app(join(base, "my-agent"), "my-agent");
    mkdirSync(join(base, "my-agent", "src", "deep"), { recursive: true });
    expect(findApp(join(base, "my-agent", "src", "deep"))).toEqual({ dir: join(base, "my-agent"), name: "my-agent" });
  });

  test("the nearest app wins", () => {
    app(join(base, "outer"), "outer");
    app(join(base, "outer", "inner"), "inner");
    expect(findApp(join(base, "outer", "inner"))?.name).toBe("inner");
  });

  test("outside an app: an error that says what's missing", () => {
    expect(() => findApp(base)).toThrow("Not inside a Mercury app: no mercury.config.ts in");
  });

  test("an app without a package.json name is an error", () => {
    mkdirSync(join(base, "broken"));
    writeFileSync(join(base, "broken", "mercury.config.ts"), "");
    expect(() => findApp(join(base, "broken"))).toThrow(`${join(base, "broken")}/package.json has no name`);
  });
});
