/**
 * Google Chat channel: keeps one `google-chat listen` process running
 * per configured space, and turns each incoming message event into a
 * `runTurn` call, replying via `sendMessage`.
 *
 * Which spaces Mercury participates in is a fixed, explicit list
 * (`opts.spaces` on `startGoogleChatChannelManager`, joined once at
 * startup) plus whatever `ensureChannel` is asked to join afterwards —
 * see `src/tools/google-chat-join.ts`, which lets a user ask Mercury,
 * mid-conversation, to start listening to an additional space right
 * away. Deliberately not membership-based auto-discovery: every message
 * in a space Mercury is listening to gets a reply (no way yet to tell
 * "addressed to Mercury" from "any message here"), so auto-joining every
 * space Mercury happens to be a member of would mean auto-replying in
 * all of them too.
 *
 * Used by: `src/index.ts` (wiring), which starts the manager once and
 * passes `manager.ensureChannel` into `createJoinSpaceTool`.
 */
import type { runCli, spawnLines } from "../../tools/cli-executor.ts";
import { ensureSpaceSubscription, sendMessage } from "./google-chat-client.ts";

/** A parsed incoming message event, ready to hand to `handleInput`. */
export type ChatMessageEvent = { text: string; messageName: string; space: string; sender: string };

/**
 * Sentinel a model can return to mean "this message isn't addressed to
 * me" in a shared, multi-person space — `processLine` checks for this
 * exact value (trimmed) and skips `sendMessageFn` entirely when it
 * matches, so nothing gets posted back into the space. An interim,
 * explicitly non-deterministic mitigation for the "replies to every
 * message" gap tracked in DECISIONS.md D-33/S-08 (which needs Mercury's
 * own identity + real mention detection) — not a replacement for it.
 */
export const NO_REPLY = "NO_REPLY";

/**
 * Raw shape of one `google-chat listen` NDJSON line — the envelope
 * (`attributes["ce-type"]` + `data`) and `data.message.{name,text,
 * space.name}` are confirmed against a real `listen` run with a real
 * message in a real space. `data.message.sender.name` is assumed
 * `users/<id>` (same shape family as `space.name`'s `spaces/<id>`) but
 * **not yet confirmed against a real run** — verify live before trusting
 * it in production. Every field is optional here on purpose: this
 * describes what a well-formed event looks like, not a guarantee about
 * what actually arrived — `parseMessageEventLine` still checks each
 * field's real type before using it. Other event types share this same
 * stream (e.g. subscription lifecycle renewal/expiry, confirmed live
 * too) with a completely different `data` shape (`{ subscription: {
 * name } }`) — irrelevant here since anything but a message-created
 * `ce-type` returns `null` before `data` is even read.
 */
type GoogleChatListenLine = {
  attributes?: { "ce-type"?: string };
  data?: { message?: GoogleChatRawMessage };
};

type GoogleChatRawMessage = {
  name?: string;
  text?: string;
  space?: { name?: string };
  sender?: { name?: string };
};

/**
 * Parses one line of `google-chat listen`'s NDJSON output into a
 * `ChatMessageEvent`, or `null` if the line isn't a message-created
 * event worth acting on (a different event type, invalid JSON, or a
 * required field that isn't actually the type `GoogleChatListenLine`
 * expects — the type only describes the well-formed shape, it doesn't
 * make the runtime checks below optional).
 *
 * Cross-space isolation is handled upstream by the `--message-filter`
 * passed to `ensureSpaceSubscription` (see `google-chat-client.ts`), not
 * by comparing `space` here — confirmed live that a per-space
 * `hasPrefix` filter on the Pub/Sub subscription keeps other spaces'
 * events from ever being delivered to this channel in the first place.
 */
export function parseMessageEventLine(line: string): ChatMessageEvent | null {
  let parsed: GoogleChatListenLine;
  try {
    parsed = JSON.parse(line);
  } catch {
    return null;
  }

  if (parsed?.attributes?.["ce-type"] !== "google.workspace.chat.message.v1.created") {
    return null;
  }

  const message = parsed.data?.message;
  const { name, text, space, sender } = message ?? {};
  if (typeof name !== "string" || typeof text !== "string") {
    return null;
  }
  if (typeof space?.name !== "string") {
    return null;
  }
  if (typeof sender?.name !== "string") {
    return null;
  }

  return { text, messageName: name, space: space.name, sender: sender.name };
}

/**
 * Composite session key for a Google Chat conversation: `space` alone
 * mixes every sender in a shared space under one `SessionHistory` (and
 * one Layer 3/Qdrant identity, D-15) — a real gap once Mercury
 * participates in spaces with more than one real person, not just DMs.
 * `${space}:${sender}` keeps each person's conversation with Mercury
 * isolated, even within the same shared space.
 */
export function deriveSessionKey(space: string, sender: string): string {
  return `${space}:${sender}`;
}

/**
 * Derives a deterministic, per-space Pub/Sub pull subscription name
 * under the same GCP project as `topic`, so the manager never needs a
 * human to provision one per space — `subscription create` creates it
 * automatically if missing.
 */
export function deriveSubscriptionName(topic: string, space: string): string {
  const match = /^projects\/([^/]+)\/topics\//.exec(topic);
  if (!match) {
    throw new Error(`unexpected topic format: ${topic}`);
  }
  const project = match[1];
  const bareSpace = space.replace(/^spaces\//, "");
  const sanitized = bareSpace.replace(/[^A-Za-z0-9-]/g, "-");
  return `projects/${project}/subscriptions/mercury-chat-${sanitized}`;
}

/**
 * Runs one space's channel: registers the subscription, starts
 * `listen`, and turns each incoming message event into a `handleInput`
 * call followed by a reply. Resolves once the underlying `listen`
 * process exits (normally, or because `opts.signal` was aborted) and
 * every event seen up to that point has finished processing.
 *
 * Loop prevention: Mercury is a member of the space it's listening to,
 * so its own replies show up as incoming events too. A `Set` of this
 * call's own sent message names is checked before invoking
 * `handleInput`, so Mercury never replies to itself.
 *
 * Events are processed one at a time, in arrival order — `onLine` is
 * synchronous (per `spawnLines`'s contract) but the work it triggers is
 * async, so each line is chained onto a promise instead of run
 * concurrently with the others.
 */
export async function startGoogleChatSpaceChannel(
  space: string,
  handleInput: (input: string, space: string, sender: string) => Promise<string>,
  deps: {
    spawnLinesFn: typeof spawnLines;
    sendMessageFn: typeof sendMessage;
    ensureSpaceSubscriptionFn: typeof ensureSpaceSubscription;
    runCliFn: typeof runCli;
  },
  opts: { topic: string; pubsubSubscription: string; signal?: AbortSignal },
): Promise<void> {
  const sentMessageNames = new Set<string>();

  const { name: workspaceEventsSubscription } = await deps.ensureSpaceSubscriptionFn(
    space,
    opts.topic,
    opts.pubsubSubscription,
    deps.runCliFn,
  );

  async function processLine(line: string): Promise<void> {
    // The exact NDJSON shape `listen` prints was never verified against
    // a real run before this — server-side only, so a real event that
    // parseMessageEventLine fails to recognize is visible instead of
    // silently doing nothing.
    console.error(`[chat:${space}] raw event: ${line}`);
    const event = parseMessageEventLine(line);
    if (!event || sentMessageNames.has(event.messageName)) {
      return;
    }
    const reply = await handleInput(event.text, space, event.sender);
    // NO_REPLY (D-34 prerequisite): the model judged this message isn't
    // addressed to it in a shared space — post nothing, not even a blank
    // or apologetic message. Exact match on the trimmed reply, so a
    // model that doesn't comply exactly just falls through to sending a
    // normal reply (fails open, not silently swallowing a real answer).
    if (reply.trim() === NO_REPLY) {
      return;
    }
    const sent = await deps.sendMessageFn(space, reply, deps.runCliFn);
    sentMessageNames.add(sent.name);
  }

  let chain: Promise<void> = Promise.resolve();
  const { exited } = deps.spawnLinesFn(
    "google-chat",
    [
      "listen",
      "--pubsub-subscription",
      opts.pubsubSubscription,
      "--workspace-events-subscription",
      workspaceEventsSubscription,
    ],
    (line) => {
      chain = chain.then(() => processLine(line));
    },
    { signal: opts.signal },
  );

  await exited;
  await chain;
}

/** What `startGoogleChatChannelManager` returns. */
export type ChannelManager = {
  /** Starts a channel for `space` right now if one isn't already running; a no-op otherwise. */
  ensureChannel(space: string): Promise<void>;
  /** Stops every currently running channel. */
  stop(): Promise<void>;
};

/**
 * Starts the manager: joins every space in `opts.spaces` once, at
 * startup, and nothing more — no periodic re-discovery. `ensureChannel`
 * (and so `joinSpace`, see `src/tools/google-chat-join.ts`) still works
 * afterwards for attaching to an additional space at runtime, without a
 * restart.
 *
 * This is a deliberately narrow, contingent scope: Mercury only ever
 * participates in spaces explicitly configured up front (`opts.spaces`)
 * or explicitly requested mid-conversation (`joinSpace`) — never in a
 * space just because it happens to be a member of it. `processLine`
 * (see `startGoogleChatSpaceChannel`) replies to every message in a
 * space it's listening to, with no way yet to tell "addressed to
 * Mercury" from "any message in this space" — auto-joining every space
 * Mercury is a member of would mean auto-replying in all of them too.
 */
export function startGoogleChatChannelManager(
  handleInput: (input: string, space: string, sender: string) => Promise<string>,
  deps: {
    spawnLinesFn: typeof spawnLines;
    sendMessageFn: typeof sendMessage;
    ensureSpaceSubscriptionFn: typeof ensureSpaceSubscription;
    runCliFn: typeof runCli;
  },
  opts: {
    topic: string;
    spaces: string[];
    signal?: AbortSignal;
  },
): ChannelManager {
  const activeChannels = new Map<string, AbortController>();
  const managerController = new AbortController();
  opts.signal?.addEventListener("abort", () => managerController.abort(), { once: true });

  async function ensureChannel(space: string): Promise<void> {
    if (activeChannels.has(space)) {
      return;
    }
    const controller = new AbortController();
    activeChannels.set(space, controller);
    const pubsubSubscription = deriveSubscriptionName(opts.topic, space);

    startGoogleChatSpaceChannel(
      space,
      handleInput,
      {
        spawnLinesFn: deps.spawnLinesFn,
        sendMessageFn: deps.sendMessageFn,
        ensureSpaceSubscriptionFn: deps.ensureSpaceSubscriptionFn,
        runCliFn: deps.runCliFn,
      },
      { topic: opts.topic, pubsubSubscription, signal: controller.signal },
    )
      .catch((err) => {
        // The channel exited unexpectedly — drop it so a future tick (or
        // another ensureChannel/joinSpace call) can restart it. Logged,
        // not swallowed: this is fired-and-forgotten by ensureChannel
        // (never awaited), so a failure here is otherwise invisible —
        // joinSpace would report success (the call was made) while the
        // channel had actually died with nothing explaining why.
        console.error(`[google-chat] channel for ${space} failed: ${String(err)}`);
      })
      .finally(() => {
        if (activeChannels.get(space) === controller) {
          activeChannels.delete(space);
        }
      });
  }

  function stopChannel(space: string): void {
    activeChannels.get(space)?.abort();
    activeChannels.delete(space);
  }

  // Fire-and-forget: joins every configured space once, at startup. Each
  // failure is handled (and logged) inside ensureChannel itself, so one
  // bad space here can't take the others down with it.
  (async () => {
    for (const space of opts.spaces) {
      await ensureChannel(space);
    }
  })();

  return {
    ensureChannel,
    stop: async () => {
      managerController.abort();
      for (const space of [...activeChannels.keys()]) {
        stopChannel(space);
      }
    },
  };
}
