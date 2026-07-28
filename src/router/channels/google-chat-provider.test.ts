import { describe, expect, test } from "bun:test";
import {
  createGoogleChatProvider,
  deriveSessionKey,
  parseChatEvent,
  type GoogleChatProviderDeps,
} from "./google-chat-provider.ts";
import { createConfirmationStore } from "../../tools/confirmation-store.ts";
import { PENDING_CONFIRMATION_NOTE } from "../../session/agent-turn.ts";
import type { HandleTurn, InboundTurn, TurnSink } from "../provider.ts";

const creds = { clientEmail: "bot@test.iam.gserviceaccount.com", privateKey: "fake" };

/** A fake `PubSubSubscription` — lets a test register the provider's real listeners, then trigger a "message"/"error" event directly, without any real gRPC. */
function fakeSubscription() {
  const listeners: Record<string, Array<(...args: any[]) => void>> = {};
  let closed = false;
  return {
    on(event: string, cb: (...args: any[]) => void) {
      (listeners[event] ??= []).push(cb);
    },
    close: async () => {
      closed = true;
    },
    emit(event: string, ...args: any[]) {
      for (const cb of listeners[event] ?? []) cb(...args);
    },
    get isClosed() {
      return closed;
    },
  };
}

/** A fake incoming Pub/Sub message — `ack` records into the given array so tests can assert ack ordering/timing without a real `ackId` concept (the SDK acks per-message, not by id). */
function fakeMessage(data: unknown, acked: string[], ackId = "a1") {
  return {
    data: Buffer.from(JSON.stringify(data)),
    ack: () => acked.push(ackId),
    nack: () => {},
  };
}

function baseDeps(overrides: Partial<GoogleChatProviderDeps> = {}): GoogleChatProviderDeps {
  return {
    credentials: creds,
    subscription: "projects/p/subscriptions/s",
    store: createConfirmationStore(),
    vaultPath: "/vault",
    runCliFn: (async () => ({ ok: true as const, data: {} })) as any,
    writeSuppressionNoteFn: (async () => {}) as any,
    recordSuppressionEventFn: async () => {},
    writeConfirmationNoteFn: (async () => {}) as any,
    adminSpace: "spaces/ADMIN",
    tokenSourceFn: () => ({ getToken: async () => "fake-token" }),
    sendMessageFn: async (_space, _text) => ({ name: "spaces/X/messages/sent" }),
    subscriptionFn: () => fakeSubscription() as any, // default: a subscription no test drives, only used by tests not centered on message dispatch
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

describe("createGoogleChatProvider — StreamingPull", () => {
  test("dispatches a MESSAGE event to handleTurn, with a sink that never defines onTextChunk", async () => {
    let capturedTurn: InboundTurn | undefined;
    let capturedSink: TurnSink | undefined;
    const acked: string[] = [];
    const sub = fakeSubscription();

    const deps = baseDeps({ subscriptionFn: () => sub as any });
    const provider = createGoogleChatProvider(deps);

    const handleTurn: HandleTurn = async (turn, sink) => {
      capturedTurn = turn;
      capturedSink = sink;
      await sink.finalize("risposta");
    };

    await provider.start(handleTurn);
    sub.emit("message", fakeMessage(messageEvent(), acked));
    // handleMessage is async, dispatched fire-and-forget from the "message"
    // listener — give its promise chain a tick to resolve.
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
    expect(acked).toEqual(["a1"]);
  });

  test("omits the [Da: X] marker when the event has no sender displayName", async () => {
    let capturedTurn: InboundTurn | undefined;
    const sub = fakeSubscription();

    const deps = baseDeps({ subscriptionFn: () => sub as any });
    const provider = createGoogleChatProvider(deps);

    await provider.start(async (turn, sink) => {
      capturedTurn = turn;
      await sink.finalize("ok");
    });
    sub.emit("message", fakeMessage({ ...messageEvent(), message: { ...messageEvent().message, sender: { name: "users/42" } } }, []));
    await new Promise((r) => setTimeout(r, 20));

    expect(capturedTurn?.text).toBe("hello");
  });

  test("a bare confirmation token message is intercepted before handleTurn, and never reaches it", async () => {
    const store = createConfirmationStore();
    const token = store.stage("spaces/X:users/42", { kind: "cli", binary: "jira", args: ["issue", "delete", "KAN-1"] });
    let handleTurnCalled = false;
    const sent: string[] = [];
    const sub = fakeSubscription();

    const deps = baseDeps({
      store,
      subscriptionFn: () => sub as any,
      runCliFn: (async () => ({ ok: true as const, data: { deleted: true } })) as any,
      sendMessageFn: async (_space, text) => {
        sent.push(text);
        return { name: "spaces/X/messages/2" };
      },
    });
    const provider = createGoogleChatProvider(deps);

    await provider.start(async () => {
      handleTurnCalled = true;
    });
    sub.emit("message", fakeMessage(messageEvent({ text: token }), []));
    await new Promise((r) => setTimeout(r, 20));

    expect(handleTurnCalled).toBe(false);
    expect(sent).toEqual(['Confermato ed eseguito: {"deleted":true}']);
  });

  test("an event whose messageName was already sent by this provider is skipped (loop prevention)", async () => {
    let handleTurnCalled = false;
    const sub = fakeSubscription();

    const deps = baseDeps({
      subscriptionFn: () => sub as any,
      sendMessageFn: async () => ({ name: "spaces/X/messages/self" }),
    });
    const provider = createGoogleChatProvider(deps);

    // Send a message once so its name enters the loop-prevention set.
    await provider.notifyAdmin("noise"); // uses sendMessageFn, which always returns the same name here
    await provider.start(async () => {
      handleTurnCalled = true;
    });
    sub.emit("message", fakeMessage(messageEvent({ messageName: "spaces/X/messages/self" }), []));
    await new Promise((r) => setTimeout(r, 20));

    expect(handleTurnCalled).toBe(false);
  });

  test("dispatches a CARD_CLICKED event to the onCardClick handler, not to handleTurn", async () => {
    let cardClickArgs: unknown[] = [];
    let handleTurnCalled = false;
    const sub = fakeSubscription();

    const deps = baseDeps({
      subscriptionFn: () => sub as any,
      onCardClick: async (params, space, sender) => {
        cardClickArgs = [params, space, sender];
      },
    });
    const provider = createGoogleChatProvider(deps);

    await provider.start(async () => {
      handleTurnCalled = true;
    });
    sub.emit(
      "message",
      fakeMessage(
        { type: "CARD_CLICKED", space: { name: "spaces/X" }, user: { name: "users/42" }, action: { parameters: [{ key: "token", value: "TOK" }] } },
        [],
      ),
    );
    await new Promise((r) => setTimeout(r, 20));

    expect(handleTurnCalled).toBe(false);
    expect(cardClickArgs).toEqual([{ token: "TOK" }, "spaces/X", "users/42"]);
  });

  // The confirmation button's whole point: a click routes into the exact
  // same execution path a typed `conferma <token>` message does — no
  // separate logic to keep in sync, no new failure mode. Only exercised
  // when the caller doesn't override `onCardClick` (the default behavior).
  test("clicking the confirm button with a valid token executes the staged command", async () => {
    const store = createConfirmationStore();
    const token = store.stage("spaces/X:users/42", { kind: "cli", binary: "jira", args: ["issue", "delete", "KAN-1"] });
    const sent: string[] = [];
    const sub = fakeSubscription();

    const deps = baseDeps({
      store,
      subscriptionFn: () => sub as any,
      runCliFn: (async () => ({ ok: true as const, data: { deleted: true } })) as any,
      sendMessageFn: async (_space, text) => {
        sent.push(text);
        return { name: "spaces/X/messages/2" };
      },
    });
    const provider = createGoogleChatProvider(deps);

    await provider.start(async () => {});
    sub.emit(
      "message",
      fakeMessage(
        { type: "CARD_CLICKED", space: { name: "spaces/X" }, user: { name: "users/42" }, action: { parameters: [{ key: "token", value: token }] } },
        [],
      ),
    );
    await new Promise((r) => setTimeout(r, 20));

    expect(sent).toEqual(['Confermato ed eseguito: {"deleted":true}']);
  });

  test("clicking the confirm button with an unknown/expired token gets a clean error, nothing executes", async () => {
    const sent: string[] = [];
    let runCliCalled = false;
    const sub = fakeSubscription();

    const deps = baseDeps({
      subscriptionFn: () => sub as any,
      runCliFn: (async () => {
        runCliCalled = true;
        return { ok: true as const, data: {} };
      }) as any,
      sendMessageFn: async (_space, text) => {
        sent.push(text);
        return { name: "spaces/X/messages/2" };
      },
    });
    const provider = createGoogleChatProvider(deps);

    await provider.start(async () => {});
    sub.emit(
      "message",
      fakeMessage(
        { type: "CARD_CLICKED", space: { name: "spaces/X" }, user: { name: "users/42" }, action: { parameters: [{ key: "token", value: "ABCD-EFGH" }] } },
        [],
      ),
    );
    await new Promise((r) => setTimeout(r, 20));

    expect(runCliCalled).toBe(false);
    expect(sent).toEqual(["Nessuna conferma in sospeso per questo token — potrebbe essere scaduta, già usata, o mai esistita."]);
  });

  // Regression test for the redelivery/duplicate-processing bug (fixed
  // pre-StreamingPull, still applies): a message must be acked before
  // handleTurn runs, not after it resolves — a real multi-step tool-calling
  // turn routinely takes longer than the subscription's ack deadline
  // (Google's default is 10s), so acking only once processing completes
  // would leave the message open to redelivery — and reprocessing — while
  // still being worked on. Same pattern the open-source Hermes agent's own
  // Google Chat adapter uses: ack in the Pub/Sub callback, before the
  // actual agent processing runs.
  test("acks a message before calling handleTurn, not after it resolves", async () => {
    const order: string[] = [];
    const sub = fakeSubscription();

    const deps = baseDeps({ subscriptionFn: () => sub as any });
    const provider = createGoogleChatProvider(deps);

    await provider.start(async (_turn, sink) => {
      order.push("handleTurn:start");
      await sink.finalize("risposta");
      order.push("handleTurn:end");
    });
    sub.emit("message", {
      data: Buffer.from(JSON.stringify(messageEvent())),
      ack: () => order.push("ack"),
      nack: () => {},
    });
    await new Promise((r) => setTimeout(r, 20));

    expect(order).toEqual(["ack", "handleTurn:start", "handleTurn:end"]);
  });

  // A turn that throws must not leave the message unacked — mirrors
  // Hermes' own tradeoff (ack first, process after): a crash mid-turn loses
  // that one message rather than risking it looping forever via redelivery.
  test("acks a message even when handleTurn throws", async () => {
    const acked: string[] = [];
    const sub = fakeSubscription();

    const deps = baseDeps({ subscriptionFn: () => sub as any });
    const provider = createGoogleChatProvider(deps);

    await provider.start(async () => {
      throw new Error("boom");
    });
    sub.emit("message", fakeMessage(messageEvent(), acked));
    await new Promise((r) => setTimeout(r, 20));

    expect(acked).toEqual(["a1"]);
  });

  // Two messages arriving independently on the stream: each is acked and
  // dispatched on its own as soon as it arrives — no batching, unlike the
  // retired poll loop.
  test("acks two independently-arriving messages independently, not as one bundled call", async () => {
    const acked: string[] = [];
    const sub = fakeSubscription();

    const deps = baseDeps({ subscriptionFn: () => sub as any });
    const provider = createGoogleChatProvider(deps);

    await provider.start(async (_turn, sink) => {
      await sink.finalize("ok");
    });
    sub.emit("message", fakeMessage(messageEvent({ messageName: "spaces/X/messages/1" }), acked, "a1"));
    await new Promise((r) => setTimeout(r, 20));
    sub.emit("message", fakeMessage(messageEvent({ messageName: "spaces/X/messages/2" }), acked, "a2"));
    await new Promise((r) => setTimeout(r, 20));

    expect(acked).toEqual(["a1", "a2"]);
  });

  test("stop() closes the underlying subscription", async () => {
    const sub = fakeSubscription();
    const deps = baseDeps({ subscriptionFn: () => sub as any });
    const provider = createGoogleChatProvider(deps);

    await provider.start(async () => {});
    expect(sub.isClosed).toBe(false);
    await provider.stop();

    expect(sub.isClosed).toBe(true);
  });

  // Since cli-tool.ts stopped dictating "reply `conferma <token>`" to the
  // model (channel-specific now), Google Chat's own confirmation UX is a
  // card with a button — not text the user has to type. The button's
  // parameters carry the token, so a click can be routed straight into
  // the same execution path as a typed token, without the user ever
  // seeing or handling the token themselves.
  test("a confirm-required step sends a card with the staged command and a token-carrying button, instead of plain text", async () => {
    const sentCards: Array<{ space: string; card: unknown }> = [];
    const sub = fakeSubscription();

    const deps = baseDeps({
      subscriptionFn: () => sub as any,
      sendCardFn: async (space, card) => {
        sentCards.push({ space, card });
        return { name: "spaces/X/messages/card1" };
      },
    });
    const provider = createGoogleChatProvider(deps);

    await provider.start(async (_turn, sink) => {
      sink.onStep?.({
        toolCalls: [{ toolCallId: "1", toolName: "runCommand", input: { command: "jira issue delete KAN-1 --confirm" } }],
        toolResults: [{ toolCallId: "1", toolName: "runCommand", output: { ok: false, pendingConfirmation: true, token: "TOK1" } }],
        content: [],
      });
      await sink.finalize("Questa azione richiede conferma.");
    });
    sub.emit("message", fakeMessage(messageEvent(), []));
    await new Promise((r) => setTimeout(r, 20));

    expect(sentCards).toHaveLength(1);
    expect(sentCards[0]!.space).toBe("spaces/X");
    expect(JSON.stringify(sentCards[0]!.card)).toContain("jira issue delete KAN-1 --confirm");
    expect(JSON.stringify(sentCards[0]!.card)).toContain("TOK1");
  });

  // agent-turn.ts returns PENDING_CONFIRMATION_NOTE as the turn's "text"
  // when the loop stopped for a pending confirmation (see
  // pendingConfirmationStop) — the card (test above) already says
  // everything a human needs. Sending this note too would be a second,
  // redundant message for the exact thing the card just covered.
  test("does not send PENDING_CONFIRMATION_NOTE as a message — the card already covers it", async () => {
    const sent: string[] = [];
    const sub = fakeSubscription();

    const deps = baseDeps({
      subscriptionFn: () => sub as any,
      sendMessageFn: async (_space, text) => {
        sent.push(text);
        return { name: "spaces/X/messages/1" };
      },
    });
    const provider = createGoogleChatProvider(deps);

    await provider.start(async (_turn, sink) => {
      await sink.finalize(PENDING_CONFIRMATION_NOTE);
    });
    sub.emit("message", fakeMessage(messageEvent(), []));
    await new Promise((r) => setTimeout(r, 20));

    expect(sent).toEqual([]);
  });

  // Regression test: messages arrive on the stream independently of
  // whether a previous message's turn finished — two messages for the SAME
  // session arriving close together used to both call handleTurn
  // concurrently (back when delivery was a fixed-clock poll; the same race
  // is just as reachable with a stream, since nothing about StreamingPull
  // itself serializes handler invocations), both reading/writing the same
  // SessionHistory at once (observed live: confusing, stale-looking
  // replies mixing content from two different turns). A session must
  // finish its current turn before starting another one.
  test("serializes two messages for the same session arriving close together", async () => {
    const started: string[] = [];
    let resolveFirst!: () => void;
    const firstGate = new Promise<void>((r) => {
      resolveFirst = r;
    });
    const sub = fakeSubscription();

    const deps = baseDeps({ subscriptionFn: () => sub as any });
    const provider = createGoogleChatProvider(deps);

    await provider.start(async (turn, sink) => {
      started.push(turn.text.split("\n").pop()!);
      if (turn.text.includes("first")) await firstGate;
      await sink.finalize("ok");
    });

    sub.emit("message", fakeMessage(messageEvent({ messageName: "spaces/X/messages/1", text: "first" }), [], "a1")); // starts "first", blocks on firstGate
    await new Promise((r) => setTimeout(r, 10));
    sub.emit("message", fakeMessage(messageEvent({ messageName: "spaces/X/messages/2", text: "second" }), [], "a2")); // arrives while "first" is still in flight, same session
    await new Promise((r) => setTimeout(r, 10));

    expect(started).toEqual(["first"]); // "second" must be queued, not started yet

    resolveFirst();
    await new Promise((r) => setTimeout(r, 10));

    expect(started).toEqual(["first", "second"]);
  });

  // The per-session lock must not become a global one — a slow turn for
  // one user/space must never hold up a different session's turn.
  test("does not block a different session's turn while one session is busy", async () => {
    const started: string[] = [];
    let resolveFirst!: () => void;
    const firstGate = new Promise<void>((r) => {
      resolveFirst = r;
    });
    const sub = fakeSubscription();

    const deps = baseDeps({ subscriptionFn: () => sub as any });
    const provider = createGoogleChatProvider(deps);

    await provider.start(async (turn, sink) => {
      started.push(turn.text.split("\n").pop()!);
      if (turn.text.includes("first")) await firstGate;
      await sink.finalize("ok");
    });

    sub.emit("message", fakeMessage(messageEvent({ messageName: "spaces/X/messages/1", text: "first", sender: "users/1" }), [], "a1"));
    await new Promise((r) => setTimeout(r, 10));
    sub.emit("message", fakeMessage(messageEvent({ messageName: "spaces/X/messages/2", text: "second", sender: "users/2" }), [], "a2"));
    await new Promise((r) => setTimeout(r, 10));

    expect(started).toEqual(["first", "second"]);

    resolveFirst();
  });

  // A burst of more than two messages for the same busy session must all
  // queue and drain in the order they arrived, not just the first one.
  test("drains more than one queued message for the same session, in order", async () => {
    const started: string[] = [];
    let resolveFirst!: () => void;
    const firstGate = new Promise<void>((r) => {
      resolveFirst = r;
    });
    const sub = fakeSubscription();

    const deps = baseDeps({ subscriptionFn: () => sub as any });
    const provider = createGoogleChatProvider(deps);

    await provider.start(async (turn, sink) => {
      started.push(turn.text.split("\n").pop()!);
      if (turn.text.includes("first")) await firstGate;
      await sink.finalize("ok");
    });

    sub.emit("message", fakeMessage(messageEvent({ messageName: "spaces/X/messages/1", text: "first" }), [], "a1"));
    await new Promise((r) => setTimeout(r, 10));
    sub.emit("message", fakeMessage(messageEvent({ messageName: "spaces/X/messages/2", text: "second" }), [], "a2"));
    await new Promise((r) => setTimeout(r, 10));
    sub.emit("message", fakeMessage(messageEvent({ messageName: "spaces/X/messages/3", text: "third" }), [], "a3"));
    await new Promise((r) => setTimeout(r, 10));

    expect(started).toEqual(["first"]);

    resolveFirst();
    await new Promise((r) => setTimeout(r, 10));

    expect(started).toEqual(["first", "second", "third"]);
  });
});

describe("createSink — tool-call cards", () => {
  /** Dispatches one MESSAGE event and captures the sink handleTurn receives, without finalizing the turn (so tests can drive onToolStart/onToolFinish on it directly, exactly as turn-runner.ts would mid-turn). */
  async function captureSink(overrides: Partial<GoogleChatProviderDeps> = {}): Promise<TurnSink> {
    let capturedSink: TurnSink | undefined;
    const sub = fakeSubscription();
    const provider = createGoogleChatProvider(baseDeps({ subscriptionFn: () => sub as any, ...overrides }));

    await provider.start(async (_turn, sink) => {
      capturedSink = sink;
    });
    sub.emit("message", fakeMessage(messageEvent(), []));
    await new Promise((r) => setTimeout(r, 20));

    return capturedSink!;
  }

  test("onToolStart with a toolCallId sends a loading card via sendCardFn, not sendMessageFn", async () => {
    const sentCards: Array<{ space: string; card: any }> = [];
    const sentMessages: string[] = [];
    const sink = await captureSink({
      sendCardFn: async (space, card) => {
        sentCards.push({ space, card });
        return { name: "spaces/X/messages/card1" };
      },
      sendMessageFn: async (_space, text) => {
        sentMessages.push(text);
        return { name: "spaces/X/messages/plain1" };
      },
    });

    sink.onToolStart("Sto leggendo dati con jira…", "`jira issue search --jql X`", "tc-1");
    await new Promise((r) => setTimeout(r, 10));

    expect(sentMessages).toEqual([]);
    expect(sentCards).toHaveLength(1);
    expect(sentCards[0]!.space).toBe("spaces/X");
    const section = sentCards[0]!.card.sections[0];
    expect(section.header).toBe("Sto leggendo dati con jira…");
    expect(section.collapsible).toBe(true);
    expect(section.uncollapsibleWidgetsCount).toBe(0);
    expect(JSON.stringify(section.widgets)).toContain("jira issue search --jql X");
    expect(JSON.stringify(section.widgets)).toContain("In corso…");
  });

  test("onToolStart with no toolCallId still sends plain text via sendMessageFn (capture-ping path unchanged)", async () => {
    const sentCards: unknown[] = [];
    const sentMessages: string[] = [];
    const sink = await captureSink({
      sendCardFn: async (_space, card) => {
        sentCards.push(card);
        return { name: "spaces/X/messages/card1" };
      },
      sendMessageFn: async (_space, text) => {
        sentMessages.push(text);
        return { name: "spaces/X/messages/plain1" };
      },
    });

    sink.onToolStart("Mi sto segnando un'informazione importante…");
    await new Promise((r) => setTimeout(r, 10));

    expect(sentMessages).toEqual(["_Mi sto segnando un'informazione importante…_"]);
    expect(sentCards).toEqual([]);
  });

  test("onToolFinish patches the exact message name onToolStart created, with the outcome's status line", async () => {
    const patched: Array<{ name: string; card: any }> = [];
    const sink = await captureSink({
      sendCardFn: async () => ({ name: "spaces/X/messages/card1" }),
      updateCardFn: async (name, card) => {
        patched.push({ name, card });
        return { name };
      },
    });

    sink.onToolStart("Sto leggendo dati con jira…", "`jira issue search --jql X`", "tc-1");
    await new Promise((r) => setTimeout(r, 10));
    sink.onToolFinish?.("tc-1", "success");
    await new Promise((r) => setTimeout(r, 10));

    expect(patched).toHaveLength(1);
    expect(patched[0]!.name).toBe("spaces/X/messages/card1");
    const section = patched[0]!.card.sections[0];
    // The title itself must also reflect completion, not just the collapsed
    // body — a card whose header still reads "Sto leggendo..." forever
    // (present progressive) looked stuck-in-progress even once patched.
    expect(section.header).toBe("Sto leggendo dati con jira… Fatto.");
    expect(JSON.stringify(section.widgets)).toContain("Fatto.");
  });

  test.each([
    ["failed", "Non riuscito."],
    ["pending", "In attesa di conferma."],
  ] as const)("onToolFinish for '%s' renders the corresponding status line in both the title and the body", async (outcome, statusText) => {
    const patched: Array<{ card: any }> = [];
    const sink = await captureSink({
      sendCardFn: async () => ({ name: "spaces/X/messages/card1" }),
      updateCardFn: async (name, card) => {
        patched.push({ card });
        return { name };
      },
    });

    sink.onToolStart("Sto scrivendo dati con jira…", "`jira issue delete KAN-1`", "tc-1");
    await new Promise((r) => setTimeout(r, 10));
    sink.onToolFinish?.("tc-1", outcome);
    await new Promise((r) => setTimeout(r, 10));

    expect(patched[0]!.card.sections[0].header).toBe(`Sto scrivendo dati con jira… ${statusText}`);
    expect(JSON.stringify(patched[0]!.card.sections[0].widgets)).toContain(statusText);
  });

  test("onToolFinish for an unknown toolCallId doesn't call updateCardFn", async () => {
    let updateCardCalled = false;
    const sink = await captureSink({
      sendCardFn: async () => ({ name: "spaces/X/messages/card1" }),
      updateCardFn: async (name, card) => {
        updateCardCalled = true;
        return { name };
      },
    });

    sink.onToolFinish?.("unknown-tc", "success");
    await new Promise((r) => setTimeout(r, 10));

    expect(updateCardCalled).toBe(false);
  });

  test("two sequential tool calls in the same turn each get their own card (independent message names)", async () => {
    const sent: Array<{ card: any }> = [];
    const patched: Array<{ name: string; card: any }> = [];
    let cardCount = 0;
    const sink = await captureSink({
      sendCardFn: async (_space, card) => {
        cardCount++;
        sent.push({ card });
        return { name: `spaces/X/messages/card${cardCount}` };
      },
      updateCardFn: async (name, card) => {
        patched.push({ name, card });
        return { name };
      },
    });

    sink.onToolStart("Sto leggendo dati con jira…", "`jira issue search --jql X`", "tc-1");
    await new Promise((r) => setTimeout(r, 10));
    sink.onToolFinish?.("tc-1", "success");
    await new Promise((r) => setTimeout(r, 10));
    sink.onToolStart("Sto scrivendo sul wiki…", '`{"path":"x"}`', "tc-2");
    await new Promise((r) => setTimeout(r, 10));
    sink.onToolFinish?.("tc-2", "success");
    await new Promise((r) => setTimeout(r, 10));

    expect(sent).toHaveLength(2);
    expect(patched).toHaveLength(2);
    expect(patched[0]!.name).toBe("spaces/X/messages/card1");
    expect(patched[1]!.name).toBe("spaces/X/messages/card2");
    expect(patched[0]!.name).not.toBe(patched[1]!.name);
  });
});

describe("createSink — reasoning card", () => {
  async function captureReasoningSink(overrides: Partial<GoogleChatProviderDeps> = {}): Promise<TurnSink> {
    let capturedSink: TurnSink | undefined;
    const sub = fakeSubscription();
    const provider = createGoogleChatProvider(
      baseDeps({ subscriptionFn: () => sub as any, reasoningPatchIntervalMs: 5, ...overrides }),
    );

    await provider.start(async (_turn, sink) => {
      capturedSink = sink;
    });
    sub.emit("message", fakeMessage(messageEvent(), []));
    await new Promise((r) => setTimeout(r, 20));

    return capturedSink!;
  }

  test("no card is sent when onReasoningChunk never fires", async () => {
    const sentCards: unknown[] = [];
    const sink = await captureReasoningSink({
      sendCardFn: async (_space, card) => {
        sentCards.push(card);
        return { name: "spaces/X/messages/r1" };
      },
    });

    sink.onReasoningEnd?.("block-1", false);
    await new Promise((r) => setTimeout(r, 20));

    expect(sentCards).toEqual([]);
  });

  test("the first onReasoningChunk sends a card immediately with loading status, titled 'Sto pensando…', always expanded (not collapsible)", async () => {
    const sentCards: Array<{ space: string; card: any }> = [];
    const sink = await captureReasoningSink({
      sendCardFn: async (space, card) => {
        sentCards.push({ space, card });
        return { name: "spaces/X/messages/r1" };
      },
    });

    sink.onReasoningChunk?.("primo pezzo", "block-1");
    await new Promise((r) => setTimeout(r, 20));

    expect(sentCards).toHaveLength(1);
    const section = sentCards[0]!.card.sections[0];
    expect(section.header).toBe("Sto pensando…");
    expect(section.collapsible).toBe(false);
    expect(JSON.stringify(section.widgets)).toContain("primo pezzo");
    expect(JSON.stringify(section.widgets)).toContain("In corso…");
  });

  test("a burst of chunks within one throttle window results in exactly one further patch, not one per chunk", async () => {
    const patched: Array<{ card: any }> = [];
    const sink = await captureReasoningSink({
      sendCardFn: async () => ({ name: "spaces/X/messages/r1" }),
      updateCardFn: async (name, card) => {
        patched.push({ card });
        return { name };
      },
    });

    sink.onReasoningChunk?.("uno ", "block-1"); // sent immediately, not a patch
    sink.onReasoningChunk?.("due ", "block-1");
    sink.onReasoningChunk?.("tre ", "block-1");
    sink.onReasoningChunk?.("quattro", "block-1");
    await new Promise((r) => setTimeout(r, 30)); // past the 5ms injected throttle interval

    expect(patched).toHaveLength(1);
    expect(JSON.stringify(patched[0]!.card.sections[0].widgets)).toContain("uno due tre quattro");
  });

  test("onReasoningEnd always sends a final patch covering everything accumulated, with success status", async () => {
    const patched: Array<{ card: any }> = [];
    const sink = await captureReasoningSink({
      sendCardFn: async () => ({ name: "spaces/X/messages/r1" }),
      updateCardFn: async (name, card) => {
        patched.push({ card });
        return { name };
      },
      // interval longer than the test's own waits, so only onReasoningEnd's
      // own (unthrottled) final patch can possibly fire
      reasoningPatchIntervalMs: 10_000,
    });

    sink.onReasoningChunk?.("ragionamento completo", "block-1");
    sink.onReasoningEnd?.("block-1", false);
    await new Promise((r) => setTimeout(r, 20));

    expect(patched).toHaveLength(1);
    const section = patched[0]!.card.sections[0];
    expect(section.header).toBe("Sto pensando… Fatto.");
    expect(JSON.stringify(section.widgets)).toContain("ragionamento completo");
  });

  test("onReasoningEnd(id, true) patches that card to the failed status", async () => {
    const patched: Array<{ card: any }> = [];
    const sink = await captureReasoningSink({
      sendCardFn: async () => ({ name: "spaces/X/messages/r1" }),
      updateCardFn: async (name, card) => {
        patched.push({ card });
        return { name };
      },
      reasoningPatchIntervalMs: 10_000,
    });

    sink.onReasoningChunk?.("qualcosa", "block-1");
    sink.onReasoningEnd?.("block-1", true);
    await new Promise((r) => setTimeout(r, 20));

    expect(patched).toHaveLength(1);
    expect(patched[0]!.card.sections[0].header).toBe("Sto pensando… Non riuscito.");
  });

  test("onReasoningEnd cancels a still-pending scheduled patch, so it never fires a stray extra update", async () => {
    const patched: Array<{ card: any }> = [];
    const sink = await captureReasoningSink({
      sendCardFn: async () => ({ name: "spaces/X/messages/r1" }),
      updateCardFn: async (name, card) => {
        patched.push({ card });
        return { name };
      },
      reasoningPatchIntervalMs: 30, // long enough that onReasoningEnd below fires first
    });

    sink.onReasoningChunk?.("uno", "block-1"); // immediate send
    sink.onReasoningChunk?.("due", "block-1"); // schedules a throttled patch 30ms out
    sink.onReasoningEnd?.("block-1", false); // should cancel it and send its own final patch instead
    await new Promise((r) => setTimeout(r, 60)); // well past the 30ms window

    expect(patched).toHaveLength(1);
  });

  test("tail-truncation shows the buffer's actual end, prefixed with '…', not its start", async () => {
    const patched: Array<{ card: any }> = [];
    const sink = await captureReasoningSink({
      sendCardFn: async () => ({ name: "spaces/X/messages/r1" }),
      updateCardFn: async (name, card) => {
        patched.push({ card });
        return { name };
      },
    });

    const longText = "a".repeat(3990) + "TAIL-MARKER";
    sink.onReasoningChunk?.(longText, "block-1");
    sink.onReasoningEnd?.("block-1", false);
    await new Promise((r) => setTimeout(r, 20));

    const body = JSON.stringify(patched[0]!.card.sections[0].widgets);
    expect(body).toContain("TAIL-MARKER");
    expect(body).toContain("…");
    expect(body).not.toContain("a".repeat(4000)); // the untruncated head is gone
  });

  // The user's reported scenario: reasoning, a tool call, then reasoning
  // again — two SDK ids, not a continuation of the first card. Each must
  // get its own independent card.
  test("a second reasoning block (different id) after a tool call gets its own independent card", async () => {
    const sent: Array<{ card: any }> = [];
    const patched: Array<{ name: string; card: any }> = [];
    let cardCount = 0;
    const sink = await captureReasoningSink({
      sendCardFn: async (_space, card) => {
        cardCount++;
        sent.push({ card });
        return { name: `spaces/X/messages/r${cardCount}` };
      },
      updateCardFn: async (name, card) => {
        patched.push({ name, card });
        return { name };
      },
      reasoningPatchIntervalMs: 10_000,
    });

    sink.onReasoningChunk?.("primo pensiero", "block-1");
    sink.onReasoningEnd?.("block-1", false);
    sink.onToolStart("Sto leggendo dati con jira…", "jira issue search", "tc-1");
    sink.onToolFinish?.("tc-1", "success");
    sink.onReasoningChunk?.("secondo pensiero", "block-2");
    sink.onReasoningEnd?.("block-2", false);
    await new Promise((r) => setTimeout(r, 20));

    const reasoningSends = sent.filter((s) => (s.card.sections[0].header as string).startsWith("Sto pensando…"));
    expect(reasoningSends).toHaveLength(2); // two independent cards, not one reused
    expect(patched[0]!.name).not.toBe(patched[2]!.name); // block-1's and block-2's patches hit different messages
    expect(JSON.stringify(reasoningSends[0]!.card.sections[0].widgets)).toContain("primo pensiero");
    expect(JSON.stringify(reasoningSends[1]!.card.sections[0].widgets)).toContain("secondo pensiero");
  });

  test("reasoning calls interleaved with tool-call cards stay correctly ordered on the shared chain", async () => {
    const events: string[] = [];
    let cardCount = 0;
    const sink = await captureReasoningSink({
      sendCardFn: async (_space, card) => {
        cardCount++;
        const label = card.sections[0]!.header as string;
        events.push(`send:${label}`);
        return { name: `spaces/X/messages/c${cardCount}` };
      },
      updateCardFn: async (name, card) => {
        const label = card.sections[0]!.header as string;
        events.push(`patch:${label}`);
        return { name };
      },
      reasoningPatchIntervalMs: 10_000,
    });

    sink.onReasoningChunk?.("pensando", "block-1");
    sink.onToolStart("Sto leggendo dati con jira…", "jira issue search", "tc-1");
    sink.onReasoningEnd?.("block-1", false);
    sink.onToolFinish?.("tc-1", "success");
    await new Promise((r) => setTimeout(r, 20));

    expect(events).toEqual([
      "send:Sto pensando…",
      "send:Sto leggendo dati con jira…",
      "patch:Sto pensando… Fatto.",
      "patch:Sto leggendo dati con jira… Fatto.",
    ]);
  });
});
