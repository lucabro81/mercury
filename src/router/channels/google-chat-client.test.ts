import { describe, it, expect } from "bun:test";
import { ensureSpaceSubscription, sendMessage, getUser } from "./google-chat-client.ts";
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

describe("getUser", () => {
  it("calls google-chat users get with the exact args", async () => {
    let receivedBinary: string | undefined;
    let receivedArgs: string[] | undefined;
    const runCliFn = async (binary: string, args: string[]): Promise<CliResult> => {
      receivedBinary = binary;
      receivedArgs = args;
      return {
        ok: true,
        data: {
          etag: "abc",
          names: [{ displayName: "Luca Brognara", metadata: { primary: true } }],
          resourceName: "people/100203105076128909015",
        },
      };
    };

    const result = await getUser("users/100203105076128909015", runCliFn);

    expect(receivedBinary).toBe("google-chat");
    expect(receivedArgs).toEqual(["users", "get", "--user", "users/100203105076128909015"]);
    expect(result).toEqual({ displayName: "Luca Brognara" });
  });

  // Real `people.get` output confirmed live: `names` is an array (a person
  // can have entries from more than one source) — the primary one is the
  // one marked `metadata.primary: true`, not necessarily names[0].
  it("picks the name entry marked metadata.primary when there's more than one", async () => {
    const runCliFn = async (): Promise<CliResult> => ({
      ok: true,
      data: {
        names: [
          { displayName: "Not This One", metadata: { primary: false } },
          { displayName: "Luca Brognara", metadata: { primary: true } },
        ],
      },
    });

    const result = await getUser("users/1", runCliFn);
    expect(result).toEqual({ displayName: "Luca Brognara" });
  });

  // Falls back to the first entry if, for whatever reason, none is marked
  // primary — better a plausible name than none.
  it("falls back to the first names entry when none is marked primary", async () => {
    const runCliFn = async (): Promise<CliResult> => ({
      ok: true,
      data: { names: [{ displayName: "Fallback Name" }] },
    });

    const result = await getUser("users/1", runCliFn);
    expect(result).toEqual({ displayName: "Fallback Name" });
  });

  it("throws explicitly when names is missing or empty", async () => {
    const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: { names: [] } });
    await expect(getUser("users/1", runCliFn)).rejects.toThrow(/names/);
  });

  it("throws explicitly when runCliFn returns an error result", async () => {
    const runCliFn = async (): Promise<CliResult> => ({
      ok: false,
      error: "google-chat exited with code 1: boom",
    });

    await expect(getUser("users/1", runCliFn)).rejects.toThrow(/boom/);
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
