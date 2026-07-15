import { describe, it, expect } from "bun:test";
import {
  parseMessageEventLine,
  deriveSubscriptionName,
  startGoogleChatSpaceChannel,
  startGoogleChatChannelManager,
} from "./google-chat-events.ts";
import type { runCli, spawnLines } from "../../tools/cli-executor.ts";
import type { ensureSpaceSubscription, sendMessage } from "./google-chat-client.ts";

const runCliFn: typeof runCli = async () => ({ ok: true, data: {} });

/**
 * Builds a `listen` NDJSON line matching the real CloudEvents-over-Pub/Sub
 * envelope confirmed live (a real message sent in a real space) —
 * `attributes["ce-type"]` carries the event type, the payload is under
 * `data.message`. Replaces the flat `{ eventType, message }` shape this
 * file assumed before any real run existed to check it against.
 */
function fakeMessageCreatedEventLine(opts: { space: string; name: string; text: string }): string {
  return JSON.stringify({
    attributes: { "ce-type": "google.workspace.chat.message.v1.created" },
    data: { message: { name: opts.name, text: opts.text, space: { name: opts.space } } },
  });
}

describe("parseMessageEventLine", () => {
  it("parses a real message-created event line", () => {
    const line = fakeMessageCreatedEventLine({
      space: "spaces/X",
      name: "spaces/X/messages/Y",
      text: "hello there",
    });
    expect(parseMessageEventLine(line)).toEqual({
      text: "hello there",
      messageName: "spaces/X/messages/Y",
      space: "spaces/X",
    });
  });

  it("returns null for a non-JSON line", () => {
    expect(parseMessageEventLine("not json at all")).toBeNull();
  });

  // Real shapes observed live: subscription lifecycle events (renewal
  // reminders, expiry) arrive on the same stream as message events,
  // sharing one Pub/Sub topic across every space's subscription — see
  // ce-type below, confirmed against a real listen run.
  it("returns null for a non-message-created event type (subscription lifecycle events)", () => {
    const expired = JSON.stringify({
      attributes: { "ce-type": "google.workspace.events.subscription.v1.expired" },
      data: { subscription: { name: "subscriptions/abc" } },
    });
    const reminder = JSON.stringify({
      attributes: { "ce-type": "google.workspace.events.subscription.v1.expirationReminder" },
      data: { subscription: { name: "subscriptions/abc" } },
    });
    expect(parseMessageEventLine(expired)).toBeNull();
    expect(parseMessageEventLine(reminder)).toBeNull();
  });

  it("returns null when message.space is missing", () => {
    const line = JSON.stringify({
      attributes: { "ce-type": "google.workspace.chat.message.v1.created" },
      data: { message: { name: "spaces/X/messages/Y", text: "hi" } },
    });
    expect(parseMessageEventLine(line)).toBeNull();
  });
});

describe("deriveSubscriptionName", () => {
  it("derives a per-space pull subscription name under the topic's project", () => {
    expect(
      deriveSubscriptionName("projects/my-proj/topics/mercury-chat", "spaces/AAQA-_d58OQ"),
    ).toBe("projects/my-proj/subscriptions/mercury-chat-AAQA--d58OQ");
  });

  it("works with a bare space id (no spaces/ prefix)", () => {
    expect(deriveSubscriptionName("projects/my-proj/topics/t", "AAQA-_d58OQ")).toBe(
      "projects/my-proj/subscriptions/mercury-chat-AAQA--d58OQ",
    );
  });
});

describe("startGoogleChatSpaceChannel", () => {
  it("calls ensureSpaceSubscriptionFn before spawnLinesFn, with the right args", async () => {
    const callOrder: string[] = [];
    const ensureSpaceSubscriptionFn: typeof ensureSpaceSubscription = async (
      space,
      topic,
      pubsubSubscription,
    ) => {
      callOrder.push("ensureSpaceSubscriptionFn");
      expect(space).toBe("spaces/X");
      expect(topic).toBe("projects/p/topics/t");
      expect(pubsubSubscription).toBe("projects/p/subscriptions/s");
      return { name: "subscriptions/abc" };
    };
    const spawnLinesFn: typeof spawnLines = (binary, args) => {
      callOrder.push("spawnLinesFn");
      expect(binary).toBe("google-chat");
      expect(args).toEqual([
        "listen",
        "--pubsub-subscription",
        "projects/p/subscriptions/s",
        "--workspace-events-subscription",
        "subscriptions/abc",
      ]);
      return { exited: Promise.resolve() };
    };
    const sendMessageFn: typeof sendMessage = async () => ({ name: "n" });

    await startGoogleChatSpaceChannel(
      "spaces/X",
      async () => "ok",
      { spawnLinesFn, sendMessageFn, ensureSpaceSubscriptionFn, runCliFn },
      { topic: "projects/p/topics/t", pubsubSubscription: "projects/p/subscriptions/s" },
    );

    expect(callOrder).toEqual(["ensureSpaceSubscriptionFn", "spawnLinesFn"]);
  });

  it("calls handleInput with the event's text and space, then sends the reply", async () => {
    const ensureSpaceSubscriptionFn: typeof ensureSpaceSubscription = async () => ({
      name: "subscriptions/abc",
    });
    let capturedOnLine: ((line: string) => void) | undefined;
    let resolveExited: (() => void) | undefined;
    const spawnLinesFn: typeof spawnLines = (_binary, _args, onLine) => {
      capturedOnLine = onLine;
      // A real process can't "exit" before flushing output it already sent —
      // exited only resolves once the test says the process is done.
      return { exited: new Promise<void>((resolve) => { resolveExited = resolve; }) };
    };
    let sentSpace: string | undefined;
    let sentText: string | undefined;
    const sendMessageFn: typeof sendMessage = async (space, text) => {
      sentSpace = space;
      sentText = text;
      return { name: "spaces/X/messages/reply-1" };
    };

    let receivedInput: string | undefined;
    let receivedSpace: string | undefined;
    const handleInput = async (input: string, space: string) => {
      receivedInput = input;
      receivedSpace = space;
      return "the reply";
    };

    const channelPromise = startGoogleChatSpaceChannel(
      "spaces/X",
      handleInput,
      { spawnLinesFn, sendMessageFn, ensureSpaceSubscriptionFn, runCliFn },
      { topic: "projects/p/topics/t", pubsubSubscription: "projects/p/subscriptions/s" },
    );

    // ensureSpaceSubscriptionFn's await yields a microtask before spawnLinesFn (and
    // thus capturedOnLine) actually runs — wait for that to settle first.
    await new Promise((r) => setTimeout(r, 0));

    capturedOnLine?.(
      fakeMessageCreatedEventLine({
        space: "spaces/X",
        name: "spaces/X/messages/incoming-1",
        text: "hi mercury",
      }),
    );
    resolveExited?.();

    await channelPromise;

    expect(receivedInput).toBe("hi mercury");
    expect(receivedSpace).toBe("spaces/X");
    expect(sentSpace).toBe("spaces/X");
    expect(sentText).toBe("the reply");
  });

  it("ignores an event whose messageName was already sent by Mercury itself (loop prevention)", async () => {
    const ensureSpaceSubscriptionFn: typeof ensureSpaceSubscription = async () => ({
      name: "subscriptions/abc",
    });
    let capturedOnLine: ((line: string) => void) | undefined;
    let resolveExited: (() => void) | undefined;
    const spawnLinesFn: typeof spawnLines = (_binary, _args, onLine) => {
      capturedOnLine = onLine;
      return { exited: new Promise<void>((resolve) => { resolveExited = resolve; }) };
    };
    const sendMessageFn: typeof sendMessage = async () => ({
      name: "spaces/X/messages/self-sent-1",
    });

    let handleInputCalls = 0;
    const handleInput = async () => {
      handleInputCalls++;
      return "reply";
    };

    const channelPromise = startGoogleChatSpaceChannel(
      "spaces/X",
      handleInput,
      { spawnLinesFn, sendMessageFn, ensureSpaceSubscriptionFn, runCliFn },
      { topic: "projects/p/topics/t", pubsubSubscription: "projects/p/subscriptions/s" },
    );

    // ensureSpaceSubscriptionFn's await yields a microtask before spawnLinesFn (and
    // thus capturedOnLine) actually runs — wait for that to settle first.
    await new Promise((r) => setTimeout(r, 0));

    // first incoming message triggers a reply, which Mercury "sends" as self-sent-1
    capturedOnLine?.(
      fakeMessageCreatedEventLine({
        space: "spaces/X",
        name: "spaces/X/messages/incoming-1",
        text: "hi",
      }),
    );
    await new Promise((r) => setTimeout(r, 0));

    // that same self-sent message now shows up as an incoming event (Mercury is a space member)
    capturedOnLine?.(
      fakeMessageCreatedEventLine({
        space: "spaces/X",
        name: "spaces/X/messages/self-sent-1",
        text: "reply",
      }),
    );
    await new Promise((r) => setTimeout(r, 0));
    resolveExited?.();

    await channelPromise;

    expect(handleInputCalls).toBe(1);
  });
});

describe("startGoogleChatChannelManager", () => {
  function noopChannelDeps() {
    const spawnLinesFn: typeof spawnLines = (_binary, _args, _onLine, opts) => ({
      exited: new Promise<void>((resolve) => {
        opts?.signal?.addEventListener("abort", () => resolve(), { once: true });
      }),
    });
    const sendMessageFn: typeof sendMessage = async () => ({ name: "n" });
    return { spawnLinesFn, sendMessageFn };
  }

  // No periodic discovery: Mercury joins exactly the spaces given in
  // opts.spaces once at startup, nothing more.
  it("joins every space in opts.spaces once at startup", async () => {
    const ensureCalls: string[] = [];
    const ensureSpaceSubscriptionFn: typeof ensureSpaceSubscription = async (space) => {
      ensureCalls.push(space);
      return { name: `subscriptions/${space}` };
    };
    const { spawnLinesFn, sendMessageFn } = noopChannelDeps();

    const manager = startGoogleChatChannelManager(
      async () => "ok",
      { spawnLinesFn, sendMessageFn, ensureSpaceSubscriptionFn, runCliFn },
      { topic: "projects/p/topics/t", spaces: ["spaces/A", "spaces/B"] },
    );

    await new Promise((r) => setTimeout(r, 20));
    expect(ensureCalls).toEqual(["spaces/A", "spaces/B"]);

    await manager.stop();
  });

  it("starts no channel when opts.spaces is empty", async () => {
    const ensureCalls: string[] = [];
    const ensureSpaceSubscriptionFn: typeof ensureSpaceSubscription = async (space) => {
      ensureCalls.push(space);
      return { name: `subscriptions/${space}` };
    };
    const { spawnLinesFn, sendMessageFn } = noopChannelDeps();

    const manager = startGoogleChatChannelManager(
      async () => "ok",
      { spawnLinesFn, sendMessageFn, ensureSpaceSubscriptionFn, runCliFn },
      { topic: "projects/p/topics/t", spaces: [] },
    );

    await new Promise((r) => setTimeout(r, 20));
    expect(ensureCalls).toEqual([]);

    await manager.stop();
  });

  it("ensureChannel starts a channel immediately and idempotently", async () => {
    const ensureCalls: string[] = [];
    const ensureSpaceSubscriptionFn: typeof ensureSpaceSubscription = async (space) => {
      ensureCalls.push(space);
      return { name: `subscriptions/${space}` };
    };
    const { spawnLinesFn, sendMessageFn } = noopChannelDeps();

    const manager = startGoogleChatChannelManager(
      async () => "ok",
      { spawnLinesFn, sendMessageFn, ensureSpaceSubscriptionFn, runCliFn },
      { topic: "projects/p/topics/t", spaces: [] },
    );

    // called twice on purpose — this is what the test is actually checking:
    // the second call must be a no-op (idempotent), not a second channel
    await manager.ensureChannel("spaces/C");
    await manager.ensureChannel("spaces/C");

    expect(ensureCalls).toEqual(["spaces/C"]);

    await manager.stop();
  });

  // Regression: ensureChannel fires startGoogleChatSpaceChannel without
  // awaiting it, so a failure there (e.g. subscription creation
  // rejected, the listen subprocess failing to spawn) was caught and
  // silently dropped — joinSpace would report success (the call was
  // made) while the channel had actually died with zero visibility.
  // Observed live: joinSpace said "ok" but no message ever triggered a
  // response, with nothing in the logs explaining why.
  it("logs when a channel started via ensureChannel fails, instead of staying silent", async () => {
    const ensureSpaceSubscriptionFn: typeof ensureSpaceSubscription = async () => {
      throw new Error("permission denied creating subscription");
    };
    const { spawnLinesFn, sendMessageFn } = noopChannelDeps();

    const originalConsoleError = console.error;
    const loggedMessages: string[] = [];
    console.error = (msg: unknown) => {
      loggedMessages.push(String(msg));
    };

    try {
      const manager = startGoogleChatChannelManager(
        async () => "ok",
        { spawnLinesFn, sendMessageFn, ensureSpaceSubscriptionFn, runCliFn },
        { topic: "projects/p/topics/t", spaces: [] },
      );

      await manager.ensureChannel("spaces/C");
      await new Promise((r) => setTimeout(r, 20));

      expect(loggedMessages.some((m) => m.includes("spaces/C"))).toBe(true);
      expect(loggedMessages.some((m) => m.includes("permission denied"))).toBe(true);

      await manager.stop();
    } finally {
      console.error = originalConsoleError;
    }
  });

  it("stop aborts every active channel", async () => {
    let capturedSignal: AbortSignal | undefined;
    const ensureSpaceSubscriptionFn: typeof ensureSpaceSubscription = async (space) => ({
      name: `subscriptions/${space}`,
    });
    const spawnLinesFn: typeof spawnLines = (_binary, _args, _onLine, opts) => {
      capturedSignal = opts?.signal;
      return {
        exited: new Promise<void>((resolve) => {
          opts?.signal?.addEventListener("abort", () => resolve(), { once: true });
        }),
      };
    };
    const sendMessageFn: typeof sendMessage = async () => ({ name: "n" });

    const manager = startGoogleChatChannelManager(
      async () => "ok",
      { spawnLinesFn, sendMessageFn, ensureSpaceSubscriptionFn, runCliFn },
      { topic: "projects/p/topics/t", spaces: ["spaces/A"] },
    );

    await new Promise((r) => setTimeout(r, 10));
    expect(capturedSignal?.aborted).toBe(false);

    await manager.stop();
    expect(capturedSignal?.aborted).toBe(true);
  });
});
