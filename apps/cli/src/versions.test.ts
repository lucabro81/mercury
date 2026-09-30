/**
 * The versions a new app's dependency ranges are written against come from the
 * packages themselves, so the manifest follows every release without the CLI
 * knowing any version.
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { packageVersions } from "./versions.ts";
import { CATALOG } from "./catalog.ts";

const versionOf = (relative: string): string =>
  JSON.parse(readFileSync(new URL(`../../../packages/${relative}/package.json`, import.meta.url), "utf-8")).version;

describe("packageVersions", () => {
  test("reads each package's own version", () => {
    expect(packageVersions(["@mercury-fw/core", "@mercury-fw/plugin-jira"])).toEqual({
      "@mercury-fw/core": versionOf("libs/core"),
      "@mercury-fw/plugin-jira": versionOf("tools/plugin-jira"),
    });
  });

  test("covers every package a new app can depend on", () => {
    const all = ["@mercury-fw/core", "@mercury-fw/formatter", ...CATALOG.map((e) => e.package)];
    const versions = packageVersions(all);
    for (const pkg of all) {
      expect(versions[pkg], pkg).toMatch(/^\d+\.\d+\.\d+/);
    }
  });

  test("a package it can't find is an error naming it", () => {
    expect(() => packageVersions(["@mercury-fw/nope"])).toThrow("@mercury-fw/nope");
  });
});
