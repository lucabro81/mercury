import { describe, it, expect } from "bun:test";
import {
  parseMessageEventLine,
  deriveSubscriptionName,
  deriveSessionKey,
  startGoogleChatSpaceChannel,
  startGoogleChatChannelManager,
  NO_REPLY,
} from "./google-chat-events.ts";
import { createConfirmationStore } from "../../tools/confirmation-store.ts";
import type { runCli, spawnLines } from "../../tools/cli-executor.ts";
import type { ensureSpaceSubscription, sendMessage } from "./google-chat-client.ts";
import type { writeSuppressionNote } from "../../wiki/wiki-note.ts";
import type { EpisodicSummary } from "../../memory/episodic-store.ts";

const runCliFn: typeof runCli = async () => ({ ok: true, data: {} });

// Suppress-notification deps no test in this file exercises directly
// (that's confirm-flow.test.ts's job) — every channel-level test here
// only needs these present to satisfy the type, not to do anything.
const vaultPath = "/vault";
const writeSuppressionNoteFn: typeof writeSuppressionNote = async () => {};
const recordSuppressionEventFn = async (_entry: EpisodicSummary): Promise<void> => {};

const DEFAULT_SENDER = "users/123";

/**
 * Builds a `listen` NDJSON line matching the real CloudEvents-over-Pub/Sub
 * envelope confirmed live (a real message sent in a real space) —
 * `attributes["ce-type"]` carries the event type, the payload is under
 * `data.message`. Replaces the flat `{ eventType, message }` shape this
 * file assumed before any real run existed to check it against.
 *
 * `sender` defaults to `DEFAULT_SENDER` for tests that don't care about
 * the exact value — the real `data.message.sender.name` shape (assumed
 * `users/<id>`, same as `space`'s `spaces/<id>`) still needs live
 * verification against a real `listen` run, same as `space`/`ce-subject`
 * were before this fixture existed.
 */
function fakeMessageCreatedEventLine(opts: {
  space: string;
  name: string;
  text: string;
  sender?: string;
}): string {
  return JSON.stringify({
    attributes: { "ce-type": "google.workspace.chat.message.v1.created" },
    data: {
      message: {
        name: opts.name,
        text: opts.text,
        space: { name: opts.space },
        sender: { name: opts.sender ?? DEFAULT_SENDER },
      },
    },
  });
}

describe("parseMessageEventLine", () => {
  it("parses a real message-created event line", () => {
    const line = fakeMessageCreatedEventLine({
      space: "spaces/X",
      name: "spaces/X/messages/Y",
      text: "hello there",
      sender: "users/42",
    });
    expect(parseMessageEventLine(line)).toEqual({
      text: "hello there",
      messageName: "spaces/X/messages/Y",
      space: "spaces/X",
      sender: "users/42",
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
      data: { message: { name: "spaces/X/messages/Y", text: "hi", sender: { name: "users/1" } } },
    });
    expect(parseMessageEventLine(line)).toBeNull();
  });

  // Prerequisite for per-user session isolation: a message-created event
  // without a sender can't be attributed to any user_id, so it's treated
  // as unrecognized rather than assigning a fallback identity.
  it("returns null when message.sender is missing", () => {
    const line = JSON.stringify({
      attributes: { "ce-type": "google.workspace.chat.message.v1.created" },
      data: { message: { name: "spaces/X/messages/Y", text: "hi", space: { name: "spaces/X" } } },
    });
    expect(parseMessageEventLine(line)).toBeNull();
  });
});

describe("deriveSessionKey", () => {
  it("combines space and sender into a single composite key", () => {
    expect(deriveSessionKey("spaces/X", "users/42")).toBe("spaces/X:users/42");
  });

  it("keeps two different senders in the same space distinct", () => {
    const a = deriveSessionKey("spaces/X", "users/1");
    const b = deriveSessionKey("spaces/X", "users/2");
    expect(a).not.toBe(b);
  });

  it("keeps the same sender in two different spaces distinct", () => {
    const a = deriveSessionKey("spaces/X", "users/1");
    const b = deriveSessionKey("spaces/Y", "users/1");
    expect(a).not.toBe(b);
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
      { spawnLinesFn, sendMessageFn, ensureSpaceSubscriptionFn, runCliFn, store: createConfirmationStore(), vaultPath, writeSuppressionNoteFn, recordSuppressionEventFn },
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
    let receivedSender: string | undefined;
    const handleInput = async (input: string, space: string, sender: string) => {
      receivedInput = input;
      receivedSpace = space;
      receivedSender = sender;
      return "the reply";
    };

    const channelPromise = startGoogleChatSpaceChannel(
      "spaces/X",
      handleInput,
      { spawnLinesFn, sendMessageFn, ensureSpaceSubscriptionFn, runCliFn, store: createConfirmationStore(), vaultPath, writeSuppressionNoteFn, recordSuppressionEventFn },
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
        sender: "users/42",
      }),
    );
    resolveExited?.();

    await channelPromise;

    expect(receivedInput).toBe("hi mercury");
    expect(receivedSpace).toBe("spaces/X");
    expect(receivedSender).toBe("users/42");
    expect(sentSpace).toBe("spaces/X");
    expect(sentText).toBe("the reply");
  });

  // NO_REPLY heuristic (interim mitigation for Mercury replying to every
  // message in a shared space): a reply the model judges isn't addressed
  // to it must never actually be posted — sendMessageFn must not even be
  // called.
  it("does not call sendMessageFn when handleInput returns the NO_REPLY sentinel", async () => {
    const ensureSpaceSubscriptionFn: typeof ensureSpaceSubscription = async () => ({
      name: "subscriptions/abc",
    });
    let capturedOnLine: ((line: string) => void) | undefined;
    let resolveExited: (() => void) | undefined;
    const spawnLinesFn: typeof spawnLines = (_binary, _args, onLine) => {
      capturedOnLine = onLine;
      return { exited: new Promise<void>((resolve) => { resolveExited = resolve; }) };
    };
    let sendMessageFnCalls = 0;
    const sendMessageFn: typeof sendMessage = async () => {
      sendMessageFnCalls++;
      return { name: "spaces/X/messages/reply-1" };
    };
    const handleInput = async () => NO_REPLY;

    const channelPromise = startGoogleChatSpaceChannel(
      "spaces/X",
      handleInput,
      { spawnLinesFn, sendMessageFn, ensureSpaceSubscriptionFn, runCliFn, store: createConfirmationStore(), vaultPath, writeSuppressionNoteFn, recordSuppressionEventFn },
      { topic: "projects/p/topics/t", pubsubSubscription: "projects/p/subscriptions/s" },
    );

    await new Promise((r) => setTimeout(r, 0));

    capturedOnLine?.(
      fakeMessageCreatedEventLine({
        space: "spaces/X",
        name: "spaces/X/messages/incoming-1",
        text: "not for you, mercury",
      }),
    );
    resolveExited?.();

    await channelPromise;

    expect(sendMessageFnCalls).toBe(0);
  });

  // Whitespace around the sentinel (a trailing newline the model added,
  // say) must not accidentally cause a real reply to be sent instead.
  it("treats NO_REPLY with surrounding whitespace the same as an exact match", async () => {
    const ensureSpaceSubscriptionFn: typeof ensureSpaceSubscription = async () => ({
      name: "subscriptions/abc",
    });
    let capturedOnLine: ((line: string) => void) | undefined;
    let resolveExited: (() => void) | undefined;
    const spawnLinesFn: typeof spawnLines = (_binary, _args, onLine) => {
      capturedOnLine = onLine;
      return { exited: new Promise<void>((resolve) => { resolveExited = resolve; }) };
    };
    let sendMessageFnCalls = 0;
    const sendMessageFn: typeof sendMessage = async () => {
      sendMessageFnCalls++;
      return { name: "spaces/X/messages/reply-1" };
    };
    const handleInput = async () => `  ${NO_REPLY}\n`;

    const channelPromise = startGoogleChatSpaceChannel(
      "spaces/X",
      handleInput,
      { spawnLinesFn, sendMessageFn, ensureSpaceSubscriptionFn, runCliFn, store: createConfirmationStore(), vaultPath, writeSuppressionNoteFn, recordSuppressionEventFn },
      { topic: "projects/p/topics/t", pubsubSubscription: "projects/p/subscriptions/s" },
    );

    await new Promise((r) => setTimeout(r, 0));

    capturedOnLine?.(
      fakeMessageCreatedEventLine({
        space: "spaces/X",
        name: "spaces/X/messages/incoming-1",
        text: "not for you, mercury",
      }),
    );
    resolveExited?.();

    await channelPromise;

    expect(sendMessageFnCalls).toBe(0);
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
      { spawnLinesFn, sendMessageFn, ensureSpaceSubscriptionFn, runCliFn, store: createConfirmationStore(), vaultPath, writeSuppressionNoteFn, recordSuppressionEventFn },
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

  // The "confirm" half of the confirm-required flow (cli-tool.ts stages,
  // this intercepts) must never reach the model — same fail-open
  // philosophy as NO_REPLY, but here a MATCH is what short-circuits
  // handleInput, not a miss.
  it("intercepts a matching conferma <token> reply, sending the confirm-flow result without calling handleInput", async () => {
    const ensureSpaceSubscriptionFn: typeof ensureSpaceSubscription = async () => ({
      name: "subscriptions/abc",
    });
    let capturedOnLine: ((line: string) => void) | undefined;
    let resolveExited: (() => void) | undefined;
    const spawnLinesFn: typeof spawnLines = (_binary, _args, onLine) => {
      capturedOnLine = onLine;
      return { exited: new Promise<void>((resolve) => { resolveExited = resolve; }) };
    };
    let sentText: string | undefined;
    const sendMessageFn: typeof sendMessage = async (_space, text) => {
      sentText = text;
      return { name: "spaces/X/messages/reply-1" };
    };
    let handleInputCalls = 0;
    const handleInput = async () => {
      handleInputCalls++;
      return "should not be used";
    };

    const store = createConfirmationStore({ tokenFn: () => "TOK1" });
    store.stage(deriveSessionKey("spaces/X", "users/42"), { kind: "cli", binary: "jira", args: ["issue", "delete", "KAN-1", "--confirm"] });
    const confirmedRunCliFn: typeof runCli = async () => ({ ok: true, data: { deleted: true } });

    const channelPromise = startGoogleChatSpaceChannel(
      "spaces/X",
      handleInput,
      { spawnLinesFn, sendMessageFn, ensureSpaceSubscriptionFn, runCliFn: confirmedRunCliFn, store, vaultPath, writeSuppressionNoteFn, recordSuppressionEventFn },
      { topic: "projects/p/topics/t", pubsubSubscription: "projects/p/subscriptions/s" },
    );

    await new Promise((r) => setTimeout(r, 0));
    capturedOnLine?.(
      fakeMessageCreatedEventLine({
        space: "spaces/X",
        name: "spaces/X/messages/incoming-1",
        text: "conferma TOK1",
        sender: "users/42",
      }),
    );
    resolveExited?.();
    await channelPromise;

    expect(handleInputCalls).toBe(0);
    expect(sentText).toContain("Confermato");
  });

  it("does not intercept a conferma reply for an unknown token, sending a canned message without calling handleInput", async () => {
    const ensureSpaceSubscriptionFn: typeof ensureSpaceSubscription = async () => ({
      name: "subscriptions/abc",
    });
    let capturedOnLine: ((line: string) => void) | undefined;
    let resolveExited: (() => void) | undefined;
    const spawnLinesFn: typeof spawnLines = (_binary, _args, onLine) => {
      capturedOnLine = onLine;
      return { exited: new Promise<void>((resolve) => { resolveExited = resolve; }) };
    };
    let sentText: string | undefined;
    const sendMessageFn: typeof sendMessage = async (_space, text) => {
      sentText = text;
      return { name: "spaces/X/messages/reply-1" };
    };
    let handleInputCalls = 0;
    const handleInput = async () => {
      handleInputCalls++;
      return "should not be used";
    };

    const channelPromise = startGoogleChatSpaceChannel(
      "spaces/X",
      handleInput,
      { spawnLinesFn, sendMessageFn, ensureSpaceSubscriptionFn, runCliFn, store: createConfirmationStore(), vaultPath, writeSuppressionNoteFn, recordSuppressionEventFn },
      { topic: "projects/p/topics/t", pubsubSubscription: "projects/p/subscriptions/s" },
    );

    await new Promise((r) => setTimeout(r, 0));
    capturedOnLine?.(
      fakeMessageCreatedEventLine({
        space: "spaces/X",
        name: "spaces/X/messages/incoming-1",
        text: "conferma NOPE",
        sender: "users/42",
      }),
    );
    resolveExited?.();
    await channelPromise;

    expect(handleInputCalls).toBe(0);
    expect(sentText?.toLowerCase()).toContain("nessuna conferma");
  });

  it("still calls handleInput normally for ordinary text, even with a store present", async () => {
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
      return "a normal reply";
    };

    const channelPromise = startGoogleChatSpaceChannel(
      "spaces/X",
      handleInput,
      { spawnLinesFn, sendMessageFn, ensureSpaceSubscriptionFn, runCliFn, store: createConfirmationStore(), vaultPath, writeSuppressionNoteFn, recordSuppressionEventFn },
      { topic: "projects/p/topics/t", pubsubSubscription: "projects/p/subscriptions/s" },
    );

    await new Promise((r) => setTimeout(r, 0));
    capturedOnLine?.(
      fakeMessageCreatedEventLine({
        space: "spaces/X",
        name: "spaces/X/messages/incoming-1",
        text: "crea un bug su KAN",
        sender: "users/42",
      }),
    );
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
      { spawnLinesFn, sendMessageFn, ensureSpaceSubscriptionFn, runCliFn, store: createConfirmationStore(), vaultPath, writeSuppressionNoteFn, recordSuppressionEventFn },
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
      { spawnLinesFn, sendMessageFn, ensureSpaceSubscriptionFn, runCliFn, store: createConfirmationStore(), vaultPath, writeSuppressionNoteFn, recordSuppressionEventFn },
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
      { spawnLinesFn, sendMessageFn, ensureSpaceSubscriptionFn, runCliFn, store: createConfirmationStore(), vaultPath, writeSuppressionNoteFn, recordSuppressionEventFn },
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
        { spawnLinesFn, sendMessageFn, ensureSpaceSubscriptionFn, runCliFn, store: createConfirmationStore(), vaultPath, writeSuppressionNoteFn, recordSuppressionEventFn },
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
      { spawnLinesFn, sendMessageFn, ensureSpaceSubscriptionFn, runCliFn, store: createConfirmationStore(), vaultPath, writeSuppressionNoteFn, recordSuppressionEventFn },
      { topic: "projects/p/topics/t", spaces: ["spaces/A"] },
    );

    await new Promise((r) => setTimeout(r, 10));
    expect(capturedSignal?.aborted).toBe(false);

    await manager.stop();
    expect(capturedSignal?.aborted).toBe(true);
  });
});
