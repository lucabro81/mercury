import { describe, it, expect } from "bun:test";
import { httpChannel } from "./index.ts";
import { CHANNEL_API_VERSION, type ChannelRuntimeContext, type ChannelHostReads } from "@mercury/channel-types";

const reads: ChannelHostReads = {
  manifest: () => ({}),
  pendingConfirmations: () => [],
  conversation: async () => ({}),
  conversations: async () => ({}),
  wikiList: async () => [],
  wikiRead: async () => "",
  wikiGrep: async () => [],
  memoryScroll: async () => ({}),
  toolLog: () => [],
  health: async () => ({}),
};

const fullCtx = (over: Partial<ChannelRuntimeContext> = {}): ChannelRuntimeContext => ({
  env: {},
  log: () => {},
  confirm: async () => null,
  resolveConfirmation: async () => ({ status: "not-a-token" }),
  reads,
  ...over,
});

describe("httpChannel", () => {
  it("declares the http name at the current api version", () => {
    expect(httpChannel.name).toBe("http");
    expect(httpChannel.apiVersion).toBe(CHANNEL_API_VERSION);
  });

  it("builds a provider when confirm, resolveConfirmation and reads are all present", () => {
    const provider = httpChannel.build(fullCtx());
    expect(typeof provider?.start).toBe("function");
    expect(typeof provider?.notify).toBe("function");
    expect(typeof provider?.stop).toBe("function");
  });

  it("throws (loader isolates it) when resolveConfirmation is missing", () => {
    expect(() => httpChannel.build(fullCtx({ resolveConfirmation: undefined }))).toThrow(/resolveConfirmation/);
  });

  it("throws (loader isolates it) when reads is missing", () => {
    expect(() => httpChannel.build(fullCtx({ reads: undefined }))).toThrow(/reads/);
  });
});
