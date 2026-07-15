import { describe, it, expect } from "bun:test";
import { ensureSpaceSubscription, sendMessage } from "./google-chat-client.ts";
import type { CliResult } from "../../tools/cli-executor.ts";

describe("ensureSpaceSubscription", () => {
  it("calls google-chat subscription create with the exact args", async () => {
    let receivedBinary: string | undefined;
    let receivedArgs: string[] | undefined;
    const runCliFn = async (binary: string, args: string[]): Promise<CliResult> => {
      receivedBinary = binary;
      receivedArgs = args;
      return { ok: true, data: { name: "subscriptions/abc123" } };
    };

    const result = await ensureSpaceSubscription(
      "spaces/AAQA-_d58OQ",
      "projects/p/topics/t",
      "projects/p/subscriptions/s",
      runCliFn,
    );

    expect(receivedBinary).toBe("google-chat");
    expect(receivedArgs).toEqual([
      "subscription",
      "create",
      "--space",
      "spaces/AAQA-_d58OQ",
      "--topic",
      "projects/p/topics/t",
      "--pubsub-subscription",
      "projects/p/subscriptions/s",
      "--message-filter",
      'hasPrefix(attributes.ce-subject, "//chat.googleapis.com/spaces/AAQA-_d58OQ")',
    ]);
    expect(result).toEqual({ name: "subscriptions/abc123" });
  });

  it("strips a leading spaces/ prefix when building --message-filter, but leaves a bare id as-is", async () => {
    let receivedArgs: string[] | undefined;
    const runCliFn = async (_binary: string, args: string[]): Promise<CliResult> => {
      receivedArgs = args;
      return { ok: true, data: { name: "subscriptions/abc123" } };
    };

    await ensureSpaceSubscription("bareSpaceId", "topic-1", "sub-1", runCliFn);

    expect(receivedArgs).toContain("--message-filter");
    expect(receivedArgs?.at(-1)).toBe(
      'hasPrefix(attributes.ce-subject, "//chat.googleapis.com/spaces/bareSpaceId")',
    );
  });

  it("throws explicitly when runCliFn returns an error result", async () => {
    const runCliFn = async (): Promise<CliResult> => ({
      ok: false,
      error: "google-chat exited with code 1: boom",
    });

    await expect(
      ensureSpaceSubscription("space-1", "topic-1", "sub-1", runCliFn),
    ).rejects.toThrow(/boom/);
  });
});

describe("sendMessage", () => {
  it("calls google-chat messages send with the exact args", async () => {
    let receivedBinary: string | undefined;
    let receivedArgs: string[] | undefined;
    const runCliFn = async (binary: string, args: string[]): Promise<CliResult> => {
      receivedBinary = binary;
      receivedArgs = args;
      return { ok: true, data: { name: "spaces/X/messages/Y" } };
    };

    const result = await sendMessage("spaces/X", "hello there", runCliFn);

    expect(receivedBinary).toBe("google-chat");
    expect(receivedArgs).toEqual([
      "messages",
      "send",
      "--space",
      "spaces/X",
      "--text",
      "hello there",
    ]);
    expect(result).toEqual({ name: "spaces/X/messages/Y" });
  });

  it("throws explicitly when runCliFn returns an error result", async () => {
    const runCliFn = async (): Promise<CliResult> => ({
      ok: false,
      error: "google-chat exited with code 1: boom",
    });

    await expect(sendMessage("spaces/X", "hi", runCliFn)).rejects.toThrow(/boom/);
  });
});
