/**
 * The versions a new app's dependency ranges are written against. The
 * framework moves in lockstep, so its packages take the CLI's own version; a
 * plugin or channel is versioned on its own, so its version is the registry's
 * `latest`, asked for only the ones chosen.
 */
import { describe, expect, test } from "bun:test";
import { appVersions, cliVersion, DEFAULT_REGISTRY, FRAMEWORK_PACKAGES, registryFrom } from "./versions.ts";
import pkg from "../package.json";

/** A fake registry answering `latest` from `versions`, recording what was asked. */
function fakeRegistry(versions: Record<string, string>) {
  const asked: string[] = [];
  const fetchFn = async (input: string | URL | Request): Promise<Response> => {
    const url = String(input);
    asked.push(url);
    const name = decodeURIComponent(url.replace("https://registry.test/", "").replace(/\/latest$/, ""));
    const version = versions[name];
    return version === undefined ? new Response("not found", { status: 404 }) : Response.json({ name, version });
  };
  return { asked, fetchFn: fetchFn as typeof fetch };
}

describe("cliVersion", () => {
  test("is the CLI's own manifest version", () => {
    expect(cliVersion()).toBe(pkg.version);
  });
});

describe("appVersions", () => {
  test("framework packages take the CLI's version, the chosen plugins and channels the registry's latest", async () => {
    const { asked, fetchFn } = fakeRegistry({
      "@mercury-fw/plugin-jira": "0.3.2",
      "@mercury-fw/channel-http": "0.1.4",
    });
    const versions = await appVersions(["@mercury-fw/plugin-jira", "@mercury-fw/channel-http"], {
      registry: "https://registry.test",
      fetchFn,
    });
    expect(versions).toEqual({
      "@mercury-fw/core": pkg.version,
      "@mercury-fw/formatter": pkg.version,
      "@mercury-fw/plugin-jira": "0.3.2",
      "@mercury-fw/channel-http": "0.1.4",
    });
    expect(asked.sort()).toEqual([
      "https://registry.test/@mercury-fw%2Fchannel-http/latest",
      "https://registry.test/@mercury-fw%2Fplugin-jira/latest",
    ]);
  });

  test("nothing chosen: no request, framework only", async () => {
    const { asked, fetchFn } = fakeRegistry({});
    expect(await appVersions([], { registry: "https://registry.test", fetchFn })).toEqual(
      Object.fromEntries(FRAMEWORK_PACKAGES.map((p) => [p, pkg.version])),
    );
    expect(asked).toEqual([]);
  });

  test("a trailing slash on the registry is fine", async () => {
    const { asked, fetchFn } = fakeRegistry({ "@mercury-fw/plugin-jira": "1.0.0" });
    await appVersions(["@mercury-fw/plugin-jira"], { registry: "https://registry.test/", fetchFn });
    expect(asked).toEqual(["https://registry.test/@mercury-fw%2Fplugin-jira/latest"]);
  });

  test("a package the registry doesn't have is an error naming it and the registry", async () => {
    const { fetchFn } = fakeRegistry({});
    await expect(
      appVersions(["@mercury-fw/plugin-jira"], { registry: "https://registry.test", fetchFn }),
    ).rejects.toThrow("@mercury-fw/plugin-jira is not on https://registry.test");
  });

  // Regression: a 200 without a usable version wrote "^undefined" into the app.
  test("an answer without a version is an error naming the package", async () => {
    const fetchFn = (async () => Response.json({ name: "x" })) as unknown as typeof fetch;
    await expect(
      appVersions(["@mercury-fw/plugin-jira"], { registry: "https://registry.test", fetchFn }),
    ).rejects.toThrow("@mercury-fw/plugin-jira");
    const notJson = (async () => new Response("<html>")) as unknown as typeof fetch;
    await expect(
      appVersions(["@mercury-fw/plugin-jira"], { registry: "https://registry.test", fetchFn: notJson }),
    ).rejects.toThrow("@mercury-fw/plugin-jira");
  });

  // Regression: an empty MFW_REGISTRY was taken as a registry and every lookup
  // failed; empty means the default.
  test("registryFrom: empty or unset is the default registry", () => {
    expect(registryFrom(undefined)).toBe(DEFAULT_REGISTRY);
    expect(registryFrom("")).toBe(DEFAULT_REGISTRY);
    expect(registryFrom("  ")).toBe(DEFAULT_REGISTRY);
    expect(registryFrom("http://localhost:4873")).toBe("http://localhost:4873");
  });

  test("an unreachable registry is an error that says so", async () => {
    const fetchFn = (async () => {
      throw new TypeError("fetch failed");
    }) as unknown as typeof fetch;
    await expect(
      appVersions(["@mercury-fw/plugin-jira"], { registry: "https://registry.test", fetchFn }),
    ).rejects.toThrow("Can't reach https://registry.test");
  });
});
