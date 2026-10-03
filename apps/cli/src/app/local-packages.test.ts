/**
 * `mfw local-packages`: an app installs the `@mercury-fw/*` packages from local
 * tarballs (`bun pm pack`) instead of the registry, through `overrides` in its
 * `package.json`, so transitive dependencies resolve to the tarballs too.
 */
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { LOCAL_PACKS_DIR, packageNameOf, withLocalOverrides, withoutLocalOverrides } from "./local-packages.ts";

describe("withLocalOverrides", () => {
  test("points every packed package at its tarball in .packs/", () => {
    const pkg = { name: "demo", dependencies: { "@mercury-fw/core": "^0.30.0" } };
    expect(
      withLocalOverrides(pkg, [
        { name: "@mercury-fw/core", file: "mercury-fw-core-0.30.0.tgz" },
        { name: "@mercury-fw/plugin-types", file: "mercury-fw-plugin-types-0.30.0.tgz" },
      ]),
    ).toEqual({
      name: "demo",
      dependencies: { "@mercury-fw/core": "^0.30.0" },
      overrides: {
        "@mercury-fw/core": "file:./.packs/mercury-fw-core-0.30.0.tgz",
        "@mercury-fw/plugin-types": "file:./.packs/mercury-fw-plugin-types-0.30.0.tgz",
      },
    });
  });

  test("replaces the local overrides of an earlier run, keeps the user's own", () => {
    const pkg = {
      overrides: {
        "@mercury-fw/core": "file:./.packs/mercury-fw-core-0.29.0.tgz",
        "@mercury-fw/kit": "file:./.packs/mercury-fw-kit-0.29.0.tgz",
        "some-lib": "1.2.3",
      },
    };
    expect(withLocalOverrides(pkg, [{ name: "@mercury-fw/core", file: "mercury-fw-core-0.30.0.tgz" }])).toEqual({
      overrides: { "some-lib": "1.2.3", "@mercury-fw/core": "file:./.packs/mercury-fw-core-0.30.0.tgz" },
    });
  });

  test("leaves the input alone", () => {
    const pkg = { overrides: { "some-lib": "1.2.3" } };
    withLocalOverrides(pkg, [{ name: "@mercury-fw/core", file: "x.tgz" }]);
    expect(pkg).toEqual({ overrides: { "some-lib": "1.2.3" } });
  });
});

describe("withoutLocalOverrides", () => {
  test("drops the local overrides, and overrides itself when nothing else is left", () => {
    expect(withoutLocalOverrides({ name: "demo", overrides: { "@mercury-fw/core": "file:./.packs/c.tgz" } })).toEqual({ name: "demo" });
  });

  test("keeps the user's own overrides", () => {
    expect(
      withoutLocalOverrides({ overrides: { "@mercury-fw/core": "file:./.packs/c.tgz", "some-lib": "1.2.3" } }),
    ).toEqual({ overrides: { "some-lib": "1.2.3" } });
  });

  test("a package without overrides stays as it is", () => {
    expect(withoutLocalOverrides({ name: "demo" })).toEqual({ name: "demo" });
  });
});

describe("packageNameOf", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "mfw-local-packages-"));
  });
  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  /** A tarball shaped like `bun pm pack`'s: `package/package.json` inside. */
  async function tarball(manifest: string): Promise<string> {
    mkdirSync(join(dir, "package"));
    writeFileSync(join(dir, "package", "package.json"), manifest);
    const file = join(dir, "p.tgz");
    const proc = Bun.spawn(["tar", "czf", file, "-C", dir, "package"]);
    expect(await proc.exited).toBe(0);
    return file;
  }

  test("reads the name from the tarball's package.json, not from its file name", async () => {
    expect(await packageNameOf(await tarball('{ "name": "@mercury-fw/plugin-jira", "version": "0.4.0" }'))).toBe("@mercury-fw/plugin-jira");
  });

  test("a file that isn't a package tarball is an error naming it", async () => {
    const file = join(dir, "broken.tgz");
    writeFileSync(file, "not a tarball");
    await expect(packageNameOf(file)).rejects.toThrow("broken.tgz");
  });
});

test("the tarballs' folder inside the app", () => {
  expect(LOCAL_PACKS_DIR).toBe(".packs");
});
