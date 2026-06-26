import { describe, it, expect } from "bun:test";
import { createJoinSpaceTool } from "./google-chat-join.ts";
import type { ChannelManager } from "../router/channels/google-chat-events.ts";

describe("createJoinSpaceTool", () => {
  it("execute calls ensureChannel with the given space", async () => {
    let receivedSpace: string | undefined;
    const ensureChannel: ChannelManager["ensureChannel"] = async (space) => {
      receivedSpace = space;
    };

    const { joinSpace } = createJoinSpaceTool(ensureChannel);
    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = await joinSpace.execute({ space: "spaces/X" }, {} as never);

    expect(receivedSpace).toBe("spaces/X");
    expect(result).toEqual({ ok: true });
  });

  it("execute returns a readable error instead of throwing when ensureChannel rejects", async () => {
    const ensureChannel: ChannelManager["ensureChannel"] = async () => {
      throw new Error("not a member of that space");
    };

    const { joinSpace } = createJoinSpaceTool(ensureChannel);
    // @ts-expect-error - execute is guaranteed present for this tool definition
    const result = await joinSpace.execute({ space: "spaces/X" }, {} as never);

    expect(result).toEqual({ ok: false, error: "not a member of that space" });
  });
});
