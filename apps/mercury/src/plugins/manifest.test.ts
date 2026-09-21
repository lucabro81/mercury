import { describe, it, expect } from "bun:test";
import { buildPluginManifest } from "./manifest.ts";
import { PLUGIN_API_VERSION, type Plugin } from "@mercury/plugin-types";
import type { CliConfig } from "@mercury/cli-engine";

/**
 * The manifest reports what an instance actually loaded — for the HTTP read
 * surface's introspection. It distinguishes a rich plugin (skills + build) from
 * a minimal one, marks which CLIs activated, and always reports the core's
 * apiVersion so a reader can spot a plugin/core version skew.
 */
const cfg = { allowedPrefixes: [], globalFlags: [] } as CliConfig;

describe("buildPluginManifest", () => {
  it("summarizes each plugin, the active CLIs, and the core apiVersion", () => {
    const jira: Plugin = {
      apiVersion: PLUGIN_API_VERSION,
      name: "jira",
      cliConfig: {},
      skills: [{ name: "jira", description: "how to jira", body: "..." }],
      build: () => ({}),
      describeStatus: () => "x",
    };
    const bitbucket: Plugin = { apiVersion: PLUGIN_API_VERSION, name: "bitbucket", cliConfig: {} };

    const manifest = buildPluginManifest([jira, bitbucket], { jira: cfg, "google-chat": cfg }, jira.skills!);

    expect(manifest.coreApiVersion).toBe(PLUGIN_API_VERSION);
    expect(manifest.activeClis).toEqual(["google-chat", "jira"]);
    expect(manifest.skills).toEqual([{ name: "jira", description: "how to jira" }]);
    expect(manifest.plugins).toEqual([
      { name: "jira", apiVersion: PLUGIN_API_VERSION, active: true, skills: ["jira"], hasBuild: true, customStatus: true },
      // bitbucket declared but not in activeCliConfigs here → active:false, minimal
      { name: "bitbucket", apiVersion: PLUGIN_API_VERSION, active: false, skills: [], hasBuild: false, customStatus: false },
    ]);
  });
});
