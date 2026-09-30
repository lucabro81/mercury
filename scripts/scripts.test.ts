/**
 * The release scripts' decisions, tested apart from the registry and git: the
 * order packages are built and published in, what counts as "already
 * published", what a pack may and may not contain, and whether there is
 * anything to release.
 */
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { orderByDependencies, workspaces, type Workspace } from "./workspaces.ts";
import { isPublished, publishCommand } from "./publish.ts";
import { trustCommand } from "./trust-publishers.ts";
import { comparePack } from "./check-pack.ts";
import { pendingChangesets } from "./release.ts";

const ws = (name: string, deps: Record<string, string> = {}, peers: Record<string, string> = {}): Workspace => ({
  dir: `/repo/${name}`,
  pkg: { name, version: "1.0.0", dependencies: deps, peerDependencies: peers },
});

describe("orderByDependencies", () => {
  test("every workspace comes after the ones it depends on, peers included", () => {
    const order = orderByDependencies([
      ws("plugin", {}, { contract: "*", engine: "*" }),
      ws("core", { contract: "*", engine: "*" }),
      ws("engine", { contract: "*" }),
      ws("contract"),
    ]).map((w) => w.pkg.name);
    expect(order).toEqual(["contract", "engine", "plugin", "core"]);
  });

  test("dependencies outside the set are ignored, each workspace appears once", () => {
    const order = orderByDependencies([ws("a", { zod: "^4" }), ws("b", { a: "*" }), ws("a2", { a: "*", b: "*" })]);
    expect(order.map((w) => w.pkg.name)).toEqual(["a", "b", "a2"]);
  });
});

describe("isPublished", () => {
  const reply = (status: number) => (async () => new Response("", { status })) as unknown as typeof fetch;

  test("200 means published, 404 means not", async () => {
    expect(await isPublished("@mercury-fw/core", "0.25.0", "https://r.test", reply(200))).toBe(true);
    expect(await isPublished("@mercury-fw/core", "0.25.0", "https://r.test", reply(404))).toBe(false);
  });

  // Regression: any non-2xx counted as "not published", so an auth error or an
  // outage made the script try to publish a version that already exists.
  test.each([401, 403, 429, 500, 503])("a %p stops everything instead of guessing", async (status) => {
    await expect(isPublished("@mercury-fw/core", "0.25.0", "https://r.test", reply(status))).rejects.toThrow(
      `${status}`,
    );
  });

  test("an unreachable registry is an error that says so", async () => {
    const down = (async () => {
      throw new TypeError("fetch failed");
    }) as unknown as typeof fetch;
    await expect(isPublished("@mercury-fw/core", "0.25.0", "https://r.test", down)).rejects.toThrow(
      "Can't reach https://r.test",
    );
  });

  test("asks for the scoped name encoded", async () => {
    let asked = "";
    const fetchFn = (async (url: string) => {
      asked = url;
      return new Response("", { status: 404 });
    }) as unknown as typeof fetch;
    await isPublished("@mercury-fw/core", "0.25.0", "https://r.test", fetchFn);
    expect(asked).toBe("https://r.test/@mercury-fw%2Fcore/0.25.0");
  });
});

describe("comparePack", () => {
  test("a pack with exactly the expected files has no problems", () => {
    expect(comparePack("p", new Set(["package.json", "index.ts"]), new Set(["package.json", "index.ts"]))).toEqual([]);
  });

  test("a missing file and a leaked one are both reported", () => {
    expect(
      comparePack("p", new Set(["package.json", "index.ts", "jira.json"]), new Set(["package.json", "index.ts", "bin/jira"])),
    ).toEqual(["p: missing from the pack: jira.json", "p: shouldn't be in the pack: bin/jira"]);
  });
});

describe("pendingChangesets", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "changesets-"));
    writeFileSync(join(dir, "config.json"), "{}");
    writeFileSync(join(dir, "README.md"), "# Changesets");
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  test("the README and the config aren't changesets", () => {
    expect(pendingChangesets(dir)).toEqual([]);
  });

  test("every other Markdown file is one", () => {
    writeFileSync(join(dir, "brave-cats-sing.md"), "---\n---\n");
    expect(pendingChangesets(dir)).toEqual(["brave-cats-sing.md"]);
  });
});

// Regression: releases write a CHANGELOG.md into each package, but the `files`
// whitelists left it out, so the pack check stopped the first CI publish.
describe("every public package ships its changelog", () => {
  test.each(workspaces().filter((w) => !w.pkg.private).map((w) => [w.pkg.name, w] as const))("%s", (_name, w) => {
    const files = (w.pkg as { files?: string[] }).files ?? [];
    expect(files).toContain("CHANGELOG.md");
  });
});

describe("publishCommand", () => {
  test("publishes the tarball with npm, which trusted publishing needs", () => {
    expect(publishCommand("/tmp/core.tgz", { registry: "https://registry.npmjs.org", dryRun: false })).toEqual([
      "npm",
      "publish",
      "/tmp/core.tgz",
      "--access",
      "public",
      "--registry=https://registry.npmjs.org",
    ]);
  });

  test("a dist-tag and a dry run are passed through", () => {
    expect(publishCommand("/tmp/core.tgz", { registry: "http://localhost:4873", tag: "next", dryRun: true })).toEqual([
      "npm",
      "publish",
      "/tmp/core.tgz",
      "--access",
      "public",
      "--registry=http://localhost:4873",
      "--tag=next",
      "--dry-run",
    ]);
  });
});

describe("trustCommand", () => {
  test("trusts this repo's publish workflow to publish the package", () => {
    expect(trustCommand("@mercury-fw/core")).toEqual([
      "npm",
      "trust",
      "github",
      "@mercury-fw/core",
      "--file",
      "publish.yml",
      "--repo",
      "lucabro81/mercury-fw",
      "--allow-publish",
      "--yes",
    ]);
  });
});
