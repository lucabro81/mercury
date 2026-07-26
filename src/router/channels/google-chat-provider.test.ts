import { describe, expect, test } from "bun:test";
import { createGoogleChatProvider, deriveSessionKey, parseChatEvent, type GoogleChatProviderDeps } from "./google-chat-provider.ts";
import { createConfirmationStore } from "../../tools/confirmation-store.ts";
import type { HandleTurn, InboundTurn, TurnSink } from "../provider.ts";

const creds = { clientEmail: "bot@test.iam.gserviceaccount.com", privateKey: "fake" };

function baseDeps(overrides: Partial<GoogleChatProviderDeps> = {}): GoogleChatProviderDeps {
  return {
    credentials: creds,
    subscription: "projects/p/subscriptions/s",
    store: createConfirmationStore(),
    vaultPath: "/vault",
    runCliFn: (async () => ({ ok: true as const, data: {} })) as any,
    writeSuppressionNoteFn: (async () => {}) as any,
    recordSuppressionEventFn: async () => {},
    adminSpace: "spaces/ADMIN",
    tokenSourceFn: () => ({ getToken: async () => "fake-token" }),
    sendMessageFn: async (_space, _text) => ({ name: "spaces/X/messages/sent" }),
    setIntervalFn: (() => 0) as any, // never actually fire the poll loop unless a test wants it
    clearIntervalFn: (() => {}) as any,
    setTimeoutFn: (() => 0) as any, // never actually fire the stuck-note timer
    clearTimeoutFn: (() => {}) as any,
    log: () => {},
    ...overrides,
  };
}

describe("deriveSessionKey", () => {
  test("composes space and sender", () => {
    expect(deriveSessionKey("spaces/X", "users/42")).toBe("spaces/X:users/42");
  });
});

describe("parseChatEvent", () => {
  test("parses a well-formed MESSAGE event", () => {
    const raw = {
      type: "MESSAGE",
      message: {
        name: "spaces/X/messages/1",
        text: "hello",
        space: { name: "spaces/X" },
        sender: { name: "users/42", displayName: "Luca", email: "luca@example.com" },
        thread: { name: "spaces/X/threads/T1" },
      },
    };
    expect(parseChatEvent(raw)).toEqual({
      kind: "message",
      text: "hello",
      messageName: "spaces/X/messages/1",
      space: "spaces/X",
      sender: "users/42",
      senderDisplayName: "Luca",
    });
  });

  test("returns null for a MESSAGE event missing a required field", () => {
    const raw = { type: "MESSAGE", message: { text: "hi", space: { name: "spaces/X" } } };
    expect(parseChatEvent(raw)).toBeNull();
  });

  test("parses a well-formed CARD_CLICKED event", () => {
    const raw = {
      type: "CARD_CLICKED",
      space: { name: "spaces/X" },
      user: { name: "users/42" },
      action: { parameters: [{ key: "token", value: "ABC123" }] },
    };
    expect(parseChatEvent(raw)).toEqual({
      kind: "card-click",
      space: "spaces/X",
      sender: "users/42",
      parameters: { token: "ABC123" },
    });
  });

  test("returns null for an unrecognized event type", () => {
    expect(parseChatEvent({ type: "ADDED_TO_SPACE" })).toBeNull();
  });

  test("returns null for non-object input", () => {
    expect(parseChatEvent(null)).toBeNull();
    expect(parseChatEvent("garbage")).toBeNull();
  });
});

function messageEvent(overrides: Partial<{ text: string; messageName: string; space: string; sender: string; senderDisplayName: string; thread: string }> = {}) {
  return {
    type: "MESSAGE",
    message: {
      name: overrides.messageName ?? "spaces/X/messages/1",
      text: overrides.text ?? "hello",
      space: { name: overrides.space ?? "spaces/X" },
      sender: { name: overrides.sender ?? "users/42", displayName: overrides.senderDisplayName ?? "Luca" },
      thread: { name: overrides.thread ?? "spaces/X/threads/T1" },
    },
  };
}

describe("createGoogleChatProvider — notify/notifyAdmin", () => {
  test("notify resolves a DM space then sends, returning the space name as sessionKey", async () => {
    const calls: string[] = [];
    const deps = baseDeps({
      getOrCreateDmSpaceFn: async (userId) => {
        calls.push(`dm:${userId}`);
        return { name: "spaces/DM1" };
      },
      sendMessageFn: async (space, text) => {
        calls.push(`send:${space}:${text}`);
        return { name: "spaces/DM1/messages/1" };
      },
    });
    const provider = createGoogleChatProvider(deps);

    const result = await provider.notify("users/42", "ciao");

    expect(result).toEqual({ sessionKey: "spaces/DM1" });
    expect(calls).toEqual(["dm:users/42", "send:spaces/DM1:ciao"]);
  });

  test("notifyAdmin sends directly to the configured admin space", async () => {
    const calls: string[] = [];
    const deps = baseDeps({
      adminSpace: "spaces/ADMIN-X",
      sendMessageFn: async (space, text) => {
        calls.push(`${space}:${text}`);
        return { name: "spaces/ADMIN-X/messages/1" };
      },
    });
    const provider = createGoogleChatProvider(deps);

    await provider.notifyAdmin("qualcosa da controllare");

    expect(calls).toEqual(["spaces/ADMIN-X:qualcosa da controllare"]);
  });
});

describe("createGoogleChatProvider — poll loop", () => {
  test("dispatches a MESSAGE event to handleTurn, with a sink that never defines onTextChunk", async () => {
    let capturedTurn: InboundTurn | undefined;
    let capturedSink: TurnSink | undefined;
    const acked: string[][] = [];
    let intervalCallback: (() => void) | undefined;

    const deps = baseDeps({
      pullEventsFn: async () => [{ ackId: "a1", data: messageEvent() }],
      acknowledgeFn: async (_sub, ackIds) => {
        acked.push(ackIds);
      },
      setIntervalFn: ((cb: () => void) => {
        intervalCallback = cb;
        return 1 as any;
      }) as any,
    });
    const provider = createGoogleChatProvider(deps);

    const handleTurn: HandleTurn = async (turn, sink) => {
      capturedTurn = turn;
      capturedSink = sink;
      await sink.finalize("risposta");
    };

    await provider.start(handleTurn);
    expect(intervalCallback).toBeDefined();
    intervalCallback!();
    // pollOnce is async and fire-and-forgotten by the interval callback —
    // give its promise chain a tick to resolve.
    await new Promise((r) => setTimeout(r, 20));

    expect(capturedTurn).toMatchObject({
      channel: "google-chat",
      multiUser: true,
      text: "[Da: Luca]\nhello",
      sessionKey: "spaces/X:users/42",
      userId: "users/42",
      wikiUserId: encodeURIComponent("users/42"),
    });
    expect(capturedSink!.onTextChunk).toBeUndefined();
    expect(acked).toEqual([["a1"]]);
  });

  test("omits the [Da: X] marker when the event has no sender displayName", async () => {
    let capturedTurn: InboundTurn | undefined;
    let intervalCallback: (() => void) | undefined;

    const deps = baseDeps({
      pullEventsFn: async () => [{ ackId: "a1", data: { ...messageEvent(), message: { ...messageEvent().message, sender: { name: "users/42" } } } }],
      acknowledgeFn: async () => {},
      setIntervalFn: ((cb: () => void) => {
        intervalCallback = cb;
        return 1 as any;
      }) as any,
    });
    const provider = createGoogleChatProvider(deps);

    await provider.start(async (turn, sink) => {
      capturedTurn = turn;
      await sink.finalize("ok");
    });
    intervalCallback!();
    await new Promise((r) => setTimeout(r, 20));

    expect(capturedTurn?.text).toBe("hello");
  });

  test("a conferma <token> message is intercepted before handleTurn, and never reaches it", async () => {
    const store = createConfirmationStore();
    const token = store.stage("spaces/X:users/42", { kind: "cli", binary: "jira", args: ["issue", "delete", "KAN-1"] });
    let handleTurnCalled = false;
    let intervalCallback: (() => void) | undefined;
    const sent: string[] = [];

    const deps = baseDeps({
      store,
      pullEventsFn: async () => [{ ackId: "a1", data: messageEvent({ text: `conferma ${token}` }) }],
      acknowledgeFn: async () => {},
      runCliFn: (async () => ({ ok: true as const, data: { deleted: true } })) as any,
      sendMessageFn: async (_space, text) => {
        sent.push(text);
        return { name: "spaces/X/messages/2" };
      },
      setIntervalFn: ((cb: () => void) => {
        intervalCallback = cb;
        return 1 as any;
      }) as any,
    });
    const provider = createGoogleChatProvider(deps);

    await provider.start(async () => {
      handleTurnCalled = true;
    });
    intervalCallback!();
    await new Promise((r) => setTimeout(r, 20));

    expect(handleTurnCalled).toBe(false);
    expect(sent).toEqual(['Confermato ed eseguito: {"deleted":true}']);
  });

  test("an event whose messageName was already sent by this provider is skipped (loop prevention)", async () => {
    let handleTurnCalled = false;
    let intervalCallback: (() => void) | undefined;

    const deps = baseDeps({
      pullEventsFn: async () => [{ ackId: "a1", data: messageEvent({ messageName: "spaces/X/messages/self" }) }],
      acknowledgeFn: async () => {},
      sendMessageFn: async () => ({ name: "spaces/X/messages/self" }),
      setIntervalFn: ((cb: () => void) => {
        intervalCallback = cb;
        return 1 as any;
      }) as any,
    });
    const provider = createGoogleChatProvider(deps);

    // Send a message once so its name enters the loop-prevention set.
    await provider.notifyAdmin("noise"); // uses sendMessageFn, which always returns the same name here
    await provider.start(async () => {
      handleTurnCalled = true;
    });
    intervalCallback!();
    await new Promise((r) => setTimeout(r, 20));

    expect(handleTurnCalled).toBe(false);
  });

  test("dispatches a CARD_CLICKED event to the onCardClick handler, not to handleTurn", async () => {
    let cardClickArgs: unknown[] = [];
    let handleTurnCalled = false;
    let intervalCallback: (() => void) | undefined;

    const deps = baseDeps({
      pullEventsFn: async () => [
        {
          ackId: "a1",
          data: {
            type: "CARD_CLICKED",
            space: { name: "spaces/X" },
            user: { name: "users/42" },
            action: { parameters: [{ key: "token", value: "TOK" }] },
          },
        },
      ],
      acknowledgeFn: async () => {},
      onCardClick: async (params, space, sender) => {
        cardClickArgs = [params, space, sender];
      },
      setIntervalFn: ((cb: () => void) => {
        intervalCallback = cb;
        return 1 as any;
      }) as any,
    });
    const provider = createGoogleChatProvider(deps);

    await provider.start(async () => {
      handleTurnCalled = true;
    });
    intervalCallback!();
    await new Promise((r) => setTimeout(r, 20));

    expect(handleTurnCalled).toBe(false);
    expect(cardClickArgs).toEqual([{ token: "TOK" }, "spaces/X", "users/42"]);
  });

  // Regression test for the redelivery/duplicate-processing bug: pollOnce
  // used to ack the whole batch only after every event's handleTurn call
  // had resolved, so any turn slower than the subscription's ack deadline
  // (Google's default is 10s; a real multi-step tool-calling turn routinely
  // takes longer) caused Pub/Sub to redeliver the same message while it was
  // still being processed, running a second, duplicate handleTurn for it.
  // The fix (same pattern the open-source Hermes agent's own Google Chat
  // adapter uses: ack in the Pub/Sub callback, before the actual agent
  // processing runs) acks each event immediately after it's pulled and
  // parsed, decoupling "message confirmed" from "turn finished" entirely —
  // no turn duration can ever trigger a redelivery again.
  test("acks a message before calling handleTurn, not after it resolves", async () => {
    const order: string[] = [];
    let intervalCallback: (() => void) | undefined;

    const deps = baseDeps({
      pullEventsFn: async () => [{ ackId: "a1", data: messageEvent() }],
      acknowledgeFn: async (_sub, ackIds) => {
        order.push(`ack:${ackIds.join(",")}`);
      },
      setIntervalFn: ((cb: () => void) => {
        intervalCallback = cb;
        return 1 as any;
      }) as any,
    });
    const provider = createGoogleChatProvider(deps);

    await provider.start(async (_turn, sink) => {
      order.push("handleTurn:start");
      await sink.finalize("risposta");
      order.push("handleTurn:end");
    });
    intervalCallback!();
    await new Promise((r) => setTimeout(r, 20));

    expect(order).toEqual(["ack:a1", "handleTurn:start", "handleTurn:end"]);
  });

  // A turn that throws must not leave the message unacked — mirrors
  // Hermes' own tradeoff (ack first, process after): a crash mid-turn loses
  // that one message rather than risking it looping forever via redelivery.
  test("acks a message even when handleTurn throws", async () => {
    const acked: string[][] = [];
    let intervalCallback: (() => void) | undefined;

    const deps = baseDeps({
      pullEventsFn: async () => [{ ackId: "a1", data: messageEvent() }],
      acknowledgeFn: async (_sub, ackIds) => {
        acked.push(ackIds);
      },
      setIntervalFn: ((cb: () => void) => {
        intervalCallback = cb;
        return 1 as any;
      }) as any,
    });
    const provider = createGoogleChatProvider(deps);

    await provider.start(async () => {
      throw new Error("boom");
    });
    intervalCallback!();
    await new Promise((r) => setTimeout(r, 20));

    expect(acked).toEqual([["a1"]]);
  });

  // Two events in the same pulled batch: each is acked on its own, right
  // after it's parsed — a slow first event no longer holds up the ack of a
  // fast second one (previously both waited for one batched ack at the end
  // of the whole for-loop).
  test("acks two events in the same batch independently, not as one bundled call", async () => {
    const acked: string[][] = [];
    let intervalCallback: (() => void) | undefined;

    const deps = baseDeps({
      pullEventsFn: async () => [
        { ackId: "a1", data: messageEvent({ messageName: "spaces/X/messages/1" }) },
        { ackId: "a2", data: messageEvent({ messageName: "spaces/X/messages/2" }) },
      ],
      acknowledgeFn: async (_sub, ackIds) => {
        acked.push(ackIds);
      },
      setIntervalFn: ((cb: () => void) => {
        intervalCallback = cb;
        return 1 as any;
      }) as any,
    });
    const provider = createGoogleChatProvider(deps);

    await provider.start(async (_turn, sink) => {
      await sink.finalize("ok");
    });
    intervalCallback!();
    await new Promise((r) => setTimeout(r, 20));

    expect(acked).toEqual([["a1"], ["a2"]]);
  });
});
