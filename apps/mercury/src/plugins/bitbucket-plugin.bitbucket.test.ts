import { describe, it, expect } from "bun:test";
import { PLUGIN_API_VERSION, type SessionToolContext } from "@mercury/plugin-types";
import { bitbucketPlugin } from "@mercury/plugin-bitbucket";

/**
 * Bitbucket is the second plugin and the validation that the `Plugin` contract
 * isn't Jira-shaped: it's the minimal CLI-based case — it owns its tool via the
 * engine, with no post-processors, no guard, and no prompt fragment of its own.
 * This test pins that minimality: a `build()` that contributes exactly the
 * `bitbucketCommand` tool and its status describer, nothing else.
 */
const sctx: SessionToolContext = {
  sessionKey: "s",
  stageConfirmation: async () => "tok",
  stashDisplay: () => "d1",
};

describe("bitbucketPlugin", () => {
  it("declares the compatible apiVersion and the bitbucket name", () => {
    expect(bitbucketPlugin.apiVersion).toBe(PLUGIN_API_VERSION);
    expect(bitbucketPlugin.name).toBe("bitbucket");
  });

  it("contributes only its own tool — no prompt fragment, no surfaces, no post-processors, no guard", () => {
    expect(bitbucketPlugin.systemPromptFragment).toBeUndefined();
    expect(bitbucketPlugin.surfaces).toBeUndefined();
    const c = bitbucketPlugin.build!({ model: {} as never, env: {}, log: () => {} });
    expect(c.postProcessors ?? {}).toEqual({});
    expect(c.postTurnGuards ?? []).toEqual([]);
  });

  it("builds a bitbucketCommand tool and a status describer for it", () => {
    const c = bitbucketPlugin.build!({ model: {} as never, env: {}, log: () => {} });
    const tools = c.sessionTools!(sctx, {});
    expect(Object.keys(tools)).toEqual(["bitbucketCommand"]);
    expect(Object.keys(c.toolStatusDescribers ?? {})).toEqual(["bitbucketCommand"]);
    expect(c.toolStatusDescribers!.bitbucketCommand!({ command: "bitbucket pr list" })).toBe("esecuzione bitbucket pr list");
  });
});
