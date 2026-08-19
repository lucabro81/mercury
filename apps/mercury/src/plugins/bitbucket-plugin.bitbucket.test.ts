import { describe, it, expect } from "bun:test";
import { PLUGIN_API_VERSION } from "@mercury/plugin-types";
import { bitbucketPlugin, bitbucketCliConfig } from "@mercury/plugin-bitbucket";

/**
 * Bitbucket is the second plugin and the validation that the `Plugin` contract
 * isn't Jira-shaped: it's the minimal case — an allowlist and a name, with no
 * `build()` (no post-processors, no guards) and no `systemPromptFragment`. This
 * test pins exactly that minimality: if a future change quietly makes `build`
 * or `systemPromptFragment` non-optional on `Plugin`, this plugin — and this
 * test — break, which is the signal that the interface grew a Jira assumption.
 */
describe("bitbucketPlugin", () => {
  it("declares the compatible apiVersion, the bitbucket name, and its raw allowlist", () => {
    expect(bitbucketPlugin.apiVersion).toBe(PLUGIN_API_VERSION);
    expect(bitbucketPlugin.name).toBe("bitbucket");
    expect(bitbucketPlugin.cliConfig).toBe(bitbucketCliConfig);
  });

  it("contributes nothing beyond its allowlist — no build(), no prompt fragment, no surfaces", () => {
    expect(bitbucketPlugin.build).toBeUndefined();
    expect(bitbucketPlugin.systemPromptFragment).toBeUndefined();
    expect(bitbucketPlugin.surfaces).toBeUndefined();
  });
});
