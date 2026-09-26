import { describe, expect, it, mock } from "bun:test";
import { CHANNEL_API_VERSION, type ChannelPlugin, type ChannelRuntimeContext, type Provider } from "@mercury/channel-types";
import { loadChannels } from "./channel-loader.ts";

/** A throwaway provider — the loader never calls its methods, only carries it. */
function fakeProvider(): Provider {
  return {
    start: async () => {},
    notify: async () => ({ sessionKey: "s" }),
  };
}

/** Builds a runtime context with a capturing logger for assertions. */
function runtimeWith(logs: string[]): ChannelRuntimeContext {
  return {
    env: {},
    log: (msg) => logs.push(msg),
    confirm: async () => null,
  };
}

function channel(name: string, build: ChannelPlugin["build"], apiVersion = CHANNEL_API_VERSION): ChannelPlugin {
  return { apiVersion, name, build };
}

describe("loadChannels", () => {
  it("builds and returns an enabled channel, keyed by name", () => {
    const provider = fakeProvider();
    const loaded = loadChannels([channel("google-chat", () => provider)], {
      enabled: ["google-chat"],
      runtime: runtimeWith([]),
    });
    expect(loaded).toEqual([{ name: "google-chat", provider }]);
  });

  it("skips a channel not in enabled, without building it", () => {
    const build = mock(() => fakeProvider());
    const loaded = loadChannels([channel("google-chat", build)], {
      enabled: ["terminal"],
      runtime: runtimeWith([]),
    });
    expect(loaded).toEqual([]);
    expect(build).not.toHaveBeenCalled();
  });

  it("passes the runtime context to build", () => {
    const runtime = runtimeWith([]);
    const build = mock((ctx: ChannelRuntimeContext) => {
      expect(ctx).toBe(runtime);
      return fakeProvider();
    });
    loadChannels([channel("google-chat", build)], { enabled: ["google-chat"], runtime });
    expect(build).toHaveBeenCalledTimes(1);
  });

  it("treats a build that returns undefined as present-but-inert (not started, no error)", () => {
    const logs: string[] = [];
    const loaded = loadChannels([channel("google-chat", () => undefined)], {
      enabled: ["google-chat"],
      runtime: runtimeWith(logs),
    });
    expect(loaded).toEqual([]);
  });

  it("refuses an incompatible apiVersion fail-soft, without building it", () => {
    const logs: string[] = [];
    const build = mock(() => fakeProvider());
    const loaded = loadChannels([channel("google-chat", build, CHANNEL_API_VERSION + 1)], {
      enabled: ["google-chat"],
      runtime: runtimeWith(logs),
    });
    expect(loaded).toEqual([]);
    expect(build).not.toHaveBeenCalled();
    expect(logs.some((l) => l.includes("google-chat") && l.includes("apiVersion"))).toBe(true);
  });

  it("isolates a build that throws and keeps the other channels", () => {
    const logs: string[] = [];
    const good = fakeProvider();
    const loaded = loadChannels(
      [
        channel("boom", () => {
          throw new Error("kaboom");
        }),
        channel("google-chat", () => good),
      ],
      { enabled: ["boom", "google-chat"], runtime: runtimeWith(logs) },
    );
    expect(loaded).toEqual([{ name: "google-chat", provider: good }]);
    expect(logs.some((l) => l.includes("boom") && l.includes("kaboom"))).toBe(true);
  });
});
