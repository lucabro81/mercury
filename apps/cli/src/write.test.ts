/**
 * `writeApp` puts the rendered files on disk. It never writes into a folder
 * that already has something in it, so scaffolding can't overwrite an existing
 * project, and a refusal leaves the disk untouched.
 */
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeApp } from "./write.ts";

let base: string;
beforeEach(() => {
  base = mkdtempSync(join(tmpdir(), "mercury-cli-write-"));
});
afterEach(() => {
  rmSync(base, { recursive: true, force: true });
});

const files = new Map([
  ["package.json", '{ "name": "demo" }\n'],
  ["persona/identity.md", "You are Hermes.\n"],
  ["src/index.ts", "console.log(1);\n"],
]);

describe("writeApp", () => {
  test("creates the folder, with intermediate ones, and writes every file as given", () => {
    const dir = join(base, "nested", "demo");
    writeApp(dir, files);
    for (const [path, content] of files) {
      expect(readFileSync(join(dir, path), "utf-8")).toBe(content);
    }
  });

  test("writes into an existing empty folder", () => {
    const dir = join(base, "demo");
    mkdirSync(dir);
    writeApp(dir, files);
    expect(readdirSync(dir).sort()).toEqual(["package.json", "persona", "src"]);
  });

  test("refuses a folder that already has something in it, and writes nothing", () => {
    const dir = join(base, "demo");
    mkdirSync(dir);
    writeFileSync(join(dir, "notes.txt"), "mine");
    expect(() => writeApp(dir, files)).toThrow(`${dir} is not empty`);
    expect(readdirSync(dir)).toEqual(["notes.txt"]);
  });

  test("a hidden file counts as content too", () => {
    const dir = join(base, "demo");
    mkdirSync(dir);
    mkdirSync(join(dir, ".git"));
    expect(() => writeApp(dir, files)).toThrow("is not empty");
    expect(existsSync(join(dir, "package.json"))).toBe(false);
  });

  test("refuses a path that is a file", () => {
    const path = join(base, "demo");
    writeFileSync(path, "x");
    expect(() => writeApp(path, files)).toThrow(`${path} is not a folder`);
  });
});
