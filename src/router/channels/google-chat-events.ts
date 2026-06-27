/**
 * Google Chat channel: discovers which spaces Mercury is currently a
 * member of, keeps one `google-chat listen` process running per space,
 * and turns each incoming message event into a `runTurn` call, replying
 * via `sendMessage`.
 *
 * Why discovery instead of a static list of spaces: Mercury is meant to
 * behave like a regular Workspace member, participating wherever it's
 * actually been added — a human-maintained allowlist would fight that.
 * The CLI has no way to push "you were just added to a new space" in
 * real time today (`subscription create` only supports message events
 * scoped to an already-known space, not membership events), and a
 * real-time version of this would need a broader, user-scoped
 * subscription on top of the per-space ones used here — deliberately
 * not built now, the latency of periodic discovery is an acceptable
 * trade-off at the current scale. Instead, `startGoogleChatChannelManager`
 * polls `listSpaces` periodically and
 * reconciles the result against which per-space channels are currently
 * running. `ensureChannel` is the escape hatch for when waiting for the
 * next poll isn't good enough — see `src/tools/google-chat-join.ts`,
 * which lets a user ask Mercury, mid-conversation, to start listening
 * to a specific space right away.
 *
 * Used by: `src/index.ts` (wiring), which starts the manager once and
 * passes `manager.ensureChannel` into `createJoinSpaceTool`.
 */
import type { runCli, spawnLines } from "../../tools/cli-executor.ts";
import {
  ensureSpaceSubscription,
  sendMessage,
  listSpaces,
} from "./google-chat-client.ts";

/** A parsed incoming message event, ready to hand to `handleInput`. */
export type ChatMessageEvent = { text: string; messageName: string };

/**
 * Parses one line of `google-chat listen`'s NDJSON output into a
 * `ChatMessageEvent`, or `null` if the line isn't a message-created
 * event worth acting on (a different event type, or invalid JSON).
 *
 * The exact event envelope shape is provisional — it hasn't been
 * verified against a real `listen` run yet (no live credentials were
 * available while this was written). Confirm and adjust this against
 * real output before relying on it; the surrounding channel/manager
 * logic doesn't depend on the specifics, only on this function's
 * contract.
 */
export function parseMessageEventLine(line: string): ChatMessageEvent | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(line);
  } catch {
    return null;
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("eventType" in parsed) ||
    !("message" in parsed)
  ) {
    return null;
  }

  const { eventType, message } = parsed as { eventType: unknown; message: unknown };
  if (eventType !== "google.workspace.chat.message.v1.created") {
    return null;
  }
  if (
    typeof message !== "object" ||
    message === null ||
    !("name" in message) ||
    !("text" in message)
  ) {
    return null;
  }
  const { name, text } = message as { name: unknown; text: unknown };
  if (typeof name !== "string" || typeof text !== "string") {
    return null;
  }
  return { text, messageName: name };
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
  handleInput: (input: string, space: string) => Promise<string>,
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
    const event = parseMessageEventLine(line);
    if (!event || sentMessageNames.has(event.messageName)) {
      return;
    }
    const reply = await handleInput(event.text, space);
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
  /** Stops the discovery loop and every currently running channel. */
  stop(): Promise<void>;
};

/** Resolves after `ms`, or immediately if `signal` aborts first. */
function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      resolve();
    }, { once: true });
  });
}

/**
 * Starts the manager: an immediate discovery tick, then one every
 * `opts.discoveryIntervalMs`, reconciling which per-space channels are
 * running against `listSpacesFn`'s result — starting channels for newly
 * discovered spaces, stopping channels for spaces Mercury is no longer
 * a member of.
 *
 * @param opts.discoveryEnabled - Defaults to `true`. Set `false` to skip
 *   the periodic loop entirely — `ensureChannel` (and so `joinSpace`,
 *   see `src/tools/google-chat-join.ts`) still works for attaching to one
 *   space at a time on purpose. Useful for controlled manual testing,
 *   and for any real account that's a member of many unrelated spaces —
 *   discovery has no concept of "only these spaces", it tries to start a
 *   channel for every membership found, which doesn't scale to a busy
 *   account and isn't always what's wanted.
 */
export function startGoogleChatChannelManager(
  handleInput: (input: string, space: string) => Promise<string>,
  deps: {
    spawnLinesFn: typeof spawnLines;
    sendMessageFn: typeof sendMessage;
    ensureSpaceSubscriptionFn: typeof ensureSpaceSubscription;
    listSpacesFn: typeof listSpaces;
    runCliFn: typeof runCli;
  },
  opts: {
    topic: string;
    discoveryIntervalMs: number;
    discoveryEnabled?: boolean;
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
      .catch(() => {
        // the channel exited unexpectedly; drop it so a future tick can restart it
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

  async function tick(): Promise<void> {
    const discovered = new Set(await deps.listSpacesFn(deps.runCliFn));
    for (const space of discovered) {
      await ensureChannel(space);
    }
    for (const space of [...activeChannels.keys()]) {
      if (!discovered.has(space)) {
        stopChannel(space);
      }
    }
  }

  if (opts.discoveryEnabled ?? true) {
    (async () => {
      while (!managerController.signal.aborted) {
        try {
          await tick();
        } catch (err) {
          // A failed tick (e.g. expired credentials, a transient API error)
          // must not take down the whole process — this loop runs in the
          // same process as every other channel, including the terminal.
          console.error(`[google-chat] discovery tick failed: ${String(err)}`);
        }
        await sleep(opts.discoveryIntervalMs, managerController.signal);
      }
    })();
  }

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
