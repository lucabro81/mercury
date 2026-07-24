import { describe, it, expect } from "bun:test";
import { ensureSpaceSubscription, sendMessage, updateMessage, getUser, getOrCreateDmSpace } from "./google-chat-client.ts";
import type { CliResult } from "../../tools/cli-executor.ts";

/**
 * Fake `runCliFn` for `ensureSpaceSubscription`'s two-step flow (`list`
 * then, only if nothing active was found, `create`) — records every call
 * so tests can assert both the returned result and which subcommands
 * actually ran, not just the last one.
 */
function fakeGoogleChatCli(opts: {
  listResult?: CliResult;
  createResult?: CliResult;
}): { runCliFn: (binary: string, args: string[]) => Promise<CliResult>; calls: string[][] } {
  const calls: string[][] = [];
  const runCliFn = async (_binary: string, args: string[]): Promise<CliResult> => {
    calls.push(args);
    if (args[1] === "list") {
      return opts.listResult ?? { ok: true, data: { subscriptions: [] } };
    }
    return opts.createResult ?? { ok: true, data: { name: "subscriptions/from-create" } };
  };
  return { runCliFn, calls };
}

describe("ensureSpaceSubscription", () => {
  it("checks via subscription list first, with the exact args", async () => {
    const { runCliFn, calls } = fakeGoogleChatCli({});

    await ensureSpaceSubscription("spaces/AAQA-_d58OQ", "projects/p/topics/t", "projects/p/subscriptions/s", runCliFn);

    expect(calls[0]).toEqual([
      "subscription",
      "list",
      "--event-type",
      "google.workspace.chat.message.v1.created",
      "--space",
      "spaces/AAQA-_d58OQ",
      "--select-all",
    ]);
  });

  it("reuses an existing ACTIVE subscription found via list, without ever calling create", async () => {
    const { runCliFn, calls } = fakeGoogleChatCli({
      listResult: { ok: true, data: { subscriptions: [{ name: "subscriptions/existing-1", state: "ACTIVE" }] } },
    });

    const result = await ensureSpaceSubscription("space-1", "topic-1", "sub-1", runCliFn);

    expect(result).toEqual({ name: "subscriptions/existing-1" });
    expect(calls).toHaveLength(1);
    expect(calls.some((args) => args[1] === "create")).toBe(false);
  });

  // A space with zero subscription history ever (e.g. just added to
  // GOOGLE_CHAT_SPACES) returns a bare {} from `subscription list
  // --select-all` — no "subscriptions" key at all, not even an empty
  // array. Confirmed live against a real never-subscribed space; this
  // shape crashed the naive `subscriptions.find(...)` with "undefined is
  // not an object" instead of falling through to create.
  it("falls through to create when list returns {} with no subscriptions key at all", async () => {
    const { runCliFn, calls } = fakeGoogleChatCli({
      listResult: { ok: true, data: {} },
      createResult: { ok: true, data: { name: "subscriptions/fresh-space-1" } },
    });

    const result = await ensureSpaceSubscription("space-1", "topic-1", "sub-1", runCliFn);

    expect(result).toEqual({ name: "subscriptions/fresh-space-1" });
    expect(calls.some((args) => args[1] === "create")).toBe(true);
  });

  it("falls through to subscription create when list finds no subscriptions", async () => {
    const { runCliFn, calls } = fakeGoogleChatCli({
      listResult: { ok: true, data: { subscriptions: [] } },
      createResult: { ok: true, data: { name: "subscriptions/abc123" } },
    });

    const result = await ensureSpaceSubscription(
      "spaces/AAQA-_d58OQ",
      "projects/p/topics/t",
      "projects/p/subscriptions/s",
      runCliFn,
    );

    expect(calls[1]).toEqual([
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

  it("falls through to create when list finds only a non-ACTIVE subscription", async () => {
    const { runCliFn, calls } = fakeGoogleChatCli({
      listResult: { ok: true, data: { subscriptions: [{ name: "subscriptions/expired-1", state: "EXPIRED" }] } },
      createResult: { ok: true, data: { name: "subscriptions/fresh-1" } },
    });

    const result = await ensureSpaceSubscription("space-1", "topic-1", "sub-1", runCliFn);

    expect(calls.some((args) => args[1] === "create")).toBe(true);
    expect(result).toEqual({ name: "subscriptions/fresh-1" });
  });

  it("strips a leading spaces/ prefix when building --message-filter, but leaves a bare id as-is", async () => {
    const { runCliFn, calls } = fakeGoogleChatCli({});

    await ensureSpaceSubscription("bareSpaceId", "topic-1", "sub-1", runCliFn);

    const createArgs = calls.find((args) => args[1] === "create");
    expect(createArgs).toContain("--message-filter");
    expect(createArgs?.at(-1)).toBe(
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
    expect(result).toEqual({ displayName: "Luca Brognara", email: null });
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
    expect(result).toEqual({ displayName: "Luca Brognara", email: null });
  });

  // Falls back to the first entry if, for whatever reason, none is marked
  // primary — better a plausible name than none.
  it("falls back to the first names entry when none is marked primary", async () => {
    const runCliFn = async (): Promise<CliResult> => ({
      ok: true,
      data: { names: [{ displayName: "Fallback Name" }] },
    });

    const result = await getUser("users/1", runCliFn);
    expect(result).toEqual({ displayName: "Fallback Name", email: null });
  });

  // emailAddresses added to `google-chat users get`'s output at 0.8.0 —
  // same {value, metadata: {primary}} shape as `names`, same
  // primary-first-fallback resolution logic.
  it("picks the email marked metadata.primary when there's more than one", async () => {
    const runCliFn = async (): Promise<CliResult> => ({
      ok: true,
      data: {
        names: [{ displayName: "Luca Brognara", metadata: { primary: true } }],
        emailAddresses: [
          { value: "not-this-one@comperio.local", metadata: { primary: false } },
          { value: "luca@comperio.local", metadata: { primary: true } },
        ],
      },
    });

    const result = await getUser("users/1", runCliFn);
    expect(result).toEqual({ displayName: "Luca Brognara", email: "luca@comperio.local" });
  });

  it("falls back to the first emailAddresses entry when none is marked primary", async () => {
    const runCliFn = async (): Promise<CliResult> => ({
      ok: true,
      data: {
        names: [{ displayName: "Luca Brognara", metadata: { primary: true } }],
        emailAddresses: [{ value: "luca@comperio.local" }],
      },
    });

    const result = await getUser("users/1", runCliFn);
    expect(result).toEqual({ displayName: "Luca Brognara", email: "luca@comperio.local" });
  });

  it("returns a null email when emailAddresses is missing or empty", async () => {
    const runCliFn = async (): Promise<CliResult> => ({
      ok: true,
      data: { names: [{ displayName: "Luca Brognara", metadata: { primary: true } }], emailAddresses: [] },
    });

    const result = await getUser("users/1", runCliFn);
    expect(result).toEqual({ displayName: "Luca Brognara", email: null });
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

describe("updateMessage", () => {
  it("calls google-chat messages update with the exact args", async () => {
    let receivedBinary: string | undefined;
    let receivedArgs: string[] | undefined;
    const runCliFn = async (binary: string, args: string[]): Promise<CliResult> => {
      receivedBinary = binary;
      receivedArgs = args;
      return { ok: true, data: { name: "spaces/X/messages/Y" } };
    };

    const result = await updateMessage("spaces/X/messages/Y", "corrected text", runCliFn);

    expect(receivedBinary).toBe("google-chat");
    expect(receivedArgs).toEqual([
      "messages",
      "update",
      "--name",
      "spaces/X/messages/Y",
      "--text",
      "corrected text",
    ]);
    expect(result).toEqual({ name: "spaces/X/messages/Y" });
  });

  it("throws explicitly when runCliFn returns an error result", async () => {
    const runCliFn = async (): Promise<CliResult> => ({
      ok: false,
      error: "google-chat exited with code 1: boom",
    });

    await expect(updateMessage("spaces/X/messages/Y", "hi", runCliFn)).rejects.toThrow(/boom/);
  });
});

// `spaces create --user <id>` (google-chat 0.10.0) is idempotent —
// returns the existing DM if the impersonated identity already has one
// with that user, creates it otherwise. Confirmed against the real CLI.
describe("getOrCreateDmSpace", () => {
  it("calls google-chat spaces create with the exact args", async () => {
    let receivedBinary: string | undefined;
    let receivedArgs: string[] | undefined;
    const runCliFn = async (binary: string, args: string[]): Promise<CliResult> => {
      receivedBinary = binary;
      receivedArgs = args;
      return { ok: true, data: { name: "spaces/DM123", spaceType: "DIRECT_MESSAGE" } };
    };

    const result = await getOrCreateDmSpace("users/42", runCliFn);

    expect(receivedBinary).toBe("google-chat");
    expect(receivedArgs).toEqual(["spaces", "create", "--user", "users/42", "--select-all"]);
    expect(result).toEqual({ name: "spaces/DM123" });
  });

  it("throws explicitly when runCliFn returns an error result", async () => {
    const runCliFn = async (): Promise<CliResult> => ({
      ok: false,
      error: "google-chat exited with code 1: boom",
    });

    await expect(getOrCreateDmSpace("users/42", runCliFn)).rejects.toThrow(/boom/);
  });
});
