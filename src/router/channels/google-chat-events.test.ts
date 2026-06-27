import { describe, it, expect } from "bun:test";
import {
  parseMessageEventLine,
  deriveSubscriptionName,
  startGoogleChatSpaceChannel,
  startGoogleChatChannelManager,
} from "./google-chat-events.ts";
import type { runCli, spawnLines } from "../../tools/cli-executor.ts";
import type { ensureSpaceSubscription, sendMessage, listSpaces } from "./google-chat-client.ts";

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

  // Every Workspace Events subscription publishes to the same shared
  // Pub/Sub topic (confirmed live) — Pub/Sub itself doesn't filter by
  // who registered the subscription, so a channel listening for
  // spaces/X's events also receives every other space's events on the
  // same topic. Without this check, Mercury would answer in spaces/X
  // using content read from a space it isn't even supposed to be
  // listening to.
  it("ignores an event for a different space than the one this channel is listening to", async () => {
    const ensureSpaceSubscriptionFn: typeof ensureSpaceSubscription = async () => ({
      name: "subscriptions/abc",
    });
    let capturedOnLine: ((line: string) => void) | undefined;
    let resolveExited: (() => void) | undefined;
    const spawnLinesFn: typeof spawnLines = (_binary, _args, onLine) => {
      capturedOnLine = onLine;
      return { exited: new Promise<void>((resolve) => { resolveExited = resolve; }) };
    };
    const sendMessageFn: typeof sendMessage = async () => ({ name: "spaces/X/messages/reply-1" });

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

    await new Promise((r) => setTimeout(r, 0));

    capturedOnLine?.(
      fakeMessageCreatedEventLine({
        space: "spaces/some-other-space",
        name: "spaces/some-other-space/messages/incoming-1",
        text: "not for this channel",
      }),
    );
    await new Promise((r) => setTimeout(r, 0));
    resolveExited?.();

    await channelPromise;

    expect(handleInputCalls).toBe(0);
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

  it("starts a channel for a newly discovered space after a discovery tick", async () => {
    const ensureCalls: string[] = [];
    const ensureSpaceSubscriptionFn: typeof ensureSpaceSubscription = async (space) => {
      ensureCalls.push(space);
      return { name: `subscriptions/${space}` };
    };
    const listSpacesFn: typeof listSpaces = async () => ["spaces/A"];
    const { spawnLinesFn, sendMessageFn } = noopChannelDeps();

    const manager = startGoogleChatChannelManager(
      async () => "ok",
      { spawnLinesFn, sendMessageFn, ensureSpaceSubscriptionFn, listSpacesFn, runCliFn },
      { topic: "projects/p/topics/t", discoveryIntervalMs: 10_000 },
    );

    await new Promise((r) => setTimeout(r, 20));
    expect(ensureCalls).toEqual(["spaces/A"]);

    await manager.stop();
  });

  it("only starts the channel for a newly added space on the next tick, not the already-running one", async () => {
    const ensureCalls: string[] = [];
    let discovered = ["spaces/A"];
    const ensureSpaceSubscriptionFn: typeof ensureSpaceSubscription = async (space) => {
      ensureCalls.push(space);
      return { name: `subscriptions/${space}` };
    };
    const listSpacesFn: typeof listSpaces = async () => discovered;
    const { spawnLinesFn, sendMessageFn } = noopChannelDeps();

    const manager = startGoogleChatChannelManager(
      async () => "ok",
      { spawnLinesFn, sendMessageFn, ensureSpaceSubscriptionFn, listSpacesFn, runCliFn },
      { topic: "projects/p/topics/t", discoveryIntervalMs: 20 },
    );

    await new Promise((r) => setTimeout(r, 10));
    discovered = ["spaces/A", "spaces/B"];
    await new Promise((r) => setTimeout(r, 40));

    expect(ensureCalls).toEqual(["spaces/A", "spaces/B"]);

    await manager.stop();
  });

  it("stops a channel for a space that disappears from discovery", async () => {
    let discovered = ["spaces/A"];
    const ensureSpaceSubscriptionFn: typeof ensureSpaceSubscription = async (space) => ({
      name: `subscriptions/${space}`,
    });
    const listSpacesFn: typeof listSpaces = async () => discovered;

    let capturedSignal: AbortSignal | undefined;
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
      { spawnLinesFn, sendMessageFn, ensureSpaceSubscriptionFn, listSpacesFn, runCliFn },
      { topic: "projects/p/topics/t", discoveryIntervalMs: 20 },
    );

    await new Promise((r) => setTimeout(r, 10));
    expect(capturedSignal?.aborted).toBe(false);

    discovered = [];
    await new Promise((r) => setTimeout(r, 40));

    expect(capturedSignal?.aborted).toBe(true);

    await manager.stop();
  });

  it("ensureChannel starts a channel immediately, idempotently, without waiting for a discovery tick", async () => {
    const ensureCalls: string[] = [];
    const ensureSpaceSubscriptionFn: typeof ensureSpaceSubscription = async (space) => {
      ensureCalls.push(space);
      return { name: `subscriptions/${space}` };
    };
    // Mercury is actually a member of spaces/C (joinSpace's documented assumption) —
    // discovery would otherwise immediately tear the manually-started channel back
    // down on its first tick, since it wouldn't see spaces/C in the discovered set.
    const listSpacesFn: typeof listSpaces = async () => ["spaces/C"];
    const { spawnLinesFn, sendMessageFn } = noopChannelDeps();

    const manager = startGoogleChatChannelManager(
      async () => "ok",
      { spawnLinesFn, sendMessageFn, ensureSpaceSubscriptionFn, listSpacesFn, runCliFn },
      { topic: "projects/p/topics/t", discoveryIntervalMs: 10_000 },
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
    const listSpacesFn: typeof listSpaces = async () => [];
    const { spawnLinesFn, sendMessageFn } = noopChannelDeps();

    const originalConsoleError = console.error;
    const loggedMessages: string[] = [];
    console.error = (msg: unknown) => {
      loggedMessages.push(String(msg));
    };

    try {
      const manager = startGoogleChatChannelManager(
        async () => "ok",
        { spawnLinesFn, sendMessageFn, ensureSpaceSubscriptionFn, listSpacesFn, runCliFn },
        { topic: "projects/p/topics/t", discoveryIntervalMs: 10_000, discoveryEnabled: false },
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

  it("stop aborts active channels and halts the discovery loop", async () => {
    let listSpacesCalls = 0;
    const ensureSpaceSubscriptionFn: typeof ensureSpaceSubscription = async (space) => ({
      name: `subscriptions/${space}`,
    });
    const listSpacesFn: typeof listSpaces = async () => {
      listSpacesCalls++;
      return ["spaces/A"];
    };
    const { spawnLinesFn, sendMessageFn } = noopChannelDeps();

    const manager = startGoogleChatChannelManager(
      async () => "ok",
      { spawnLinesFn, sendMessageFn, ensureSpaceSubscriptionFn, listSpacesFn, runCliFn },
      { topic: "projects/p/topics/t", discoveryIntervalMs: 15 },
    );

    await new Promise((r) => setTimeout(r, 10));
    await manager.stop();
    const callsAtStop = listSpacesCalls;

    await new Promise((r) => setTimeout(r, 60));
    expect(listSpacesCalls).toBe(callsAtStop);
  });

  // Regression: a tick that throws (e.g. listSpacesFn failing on expired
  // credentials) was an unhandled rejection inside the discovery loop's
  // un-awaited IIFE — which crashed the entire Mercury process, not just
  // the Google Chat channel, since both run in the same process.
  // Observed live: discovery hit expired Google Chat credentials, and
  // took the terminal REPL down with it.
  it("keeps polling on the next tick after a tick throws, instead of crashing", async () => {
    const ensureCalls: string[] = [];
    let listSpacesCalls = 0;
    const ensureSpaceSubscriptionFn: typeof ensureSpaceSubscription = async (space) => {
      ensureCalls.push(space);
      return { name: `subscriptions/${space}` };
    };
    const listSpacesFn: typeof listSpaces = async () => {
      listSpacesCalls++;
      if (listSpacesCalls === 1) {
        throw new Error("credentials expired");
      }
      return ["spaces/A"];
    };
    const { spawnLinesFn, sendMessageFn } = noopChannelDeps();

    const manager = startGoogleChatChannelManager(
      async () => "ok",
      { spawnLinesFn, sendMessageFn, ensureSpaceSubscriptionFn, listSpacesFn, runCliFn },
      { topic: "projects/p/topics/t", discoveryIntervalMs: 15 },
    );

    await new Promise((r) => setTimeout(r, 40));

    expect(listSpacesCalls).toBeGreaterThan(1);
    expect(ensureCalls).toEqual(["spaces/A"]);

    await manager.stop();
  });

  // For controlled manual testing (and any account with many unrelated
  // spaces — periodic discovery unconditionally tries to start a channel
  // for every space the identity is a member of, which doesn't scale to
  // a busy real account and isn't always what's wanted). ensureChannel
  // must keep working for the explicit, one-space-at-a-time joinSpace
  // path even with the periodic loop off.
  it("never calls listSpacesFn when discoveryEnabled is false, but ensureChannel still works", async () => {
    let listSpacesCalls = 0;
    const ensureCalls: string[] = [];
    const ensureSpaceSubscriptionFn: typeof ensureSpaceSubscription = async (space) => {
      ensureCalls.push(space);
      return { name: `subscriptions/${space}` };
    };
    const listSpacesFn: typeof listSpaces = async () => {
      listSpacesCalls++;
      return ["spaces/should-never-be-discovered"];
    };
    const { spawnLinesFn, sendMessageFn } = noopChannelDeps();

    const manager = startGoogleChatChannelManager(
      async () => "ok",
      { spawnLinesFn, sendMessageFn, ensureSpaceSubscriptionFn, listSpacesFn, runCliFn },
      { topic: "projects/p/topics/t", discoveryIntervalMs: 10, discoveryEnabled: false },
    );

    await new Promise((r) => setTimeout(r, 30));
    expect(listSpacesCalls).toBe(0);

    await manager.ensureChannel("spaces/chosen-for-testing");
    expect(ensureCalls).toEqual(["spaces/chosen-for-testing"]);

    await manager.stop();
  });
});
