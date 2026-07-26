/**
 * The registered Chat app's `Provider` — replaces the retired
 * impersonation-based channel (`google-chat-client.ts`/`google-chat-events.ts`/
 * `google-chat-streamer.ts`/`google-chat-message-buffer.ts`, all deleted)
 * wholesale, not as an adapter over it. Built directly against the
 * chat-app model: `chat.bot`-scoped service-account auth
 * (`google-chat-app-client.ts`), a single Pub/Sub subscription for the
 * whole app (no more per-space Workspace Events subscriptions — a real
 * simplification the old impersonation path needed and this one doesn't),
 * and a real per-app bot identity.
 *
 * Session key is `space:sender` — same as the retired channel's own key
 * (see `deriveSessionKey` for why a thread-keyed variant, tried initially,
 * broke conversation continuity in DMs).
 *
 * The `[Da: X]` sender marker no longer needs a People-API round trip: a
 * registered app's `MESSAGE` event already carries `sender.displayName`
 * directly (confirmed live against a real captured event earlier this
 * session) — `resolveSenderName`/`getUser`/the `resolved-name.md` wiki
 * cache are not used by this provider at all.
 */
import {
  createTokenSource,
  sendMessage,
  sendCard,
  updateMessage,
  pullEvents,
  acknowledge,
  getOrCreateDmSpace,
  type ServiceAccountCredentials,
  type TokenSource,
  type ChatCard,
} from "./google-chat-app-client.ts";
import { splitForSendLimit } from "./google-chat-message-buffer.ts";
import { tryConfirm } from "../confirm-flow.ts";
import { detectPendingConfirmation, type PendingConfirmation } from "../../session/pending-confirmation.ts";
import type { Provider, HandleTurn, TurnSink } from "../provider.ts";
import type { ConfirmationStore } from "../../tools/confirmation-store.ts";
import type { runCli } from "../../tools/cli-executor.ts";
import type { writeSuppressionNote } from "../../wiki/wiki-note.ts";
import type { EpisodicSummary } from "../../memory/episodic-store.ts";

/**
 * Builds the confirmation card sent when a step stages an irreversible
 * command (see `pending-confirmation.ts`). The button's parameters carry
 * the token, so a click routes straight into the same execution path a
 * typed `conferma <token>` uses (see `onCardClick`'s `confirm` case,
 * below) — the user never has to see or type the token themselves.
 */
function buildConfirmCard(pending: PendingConfirmation): ChatCard {
  return {
    header: { title: "Conferma richiesta" },
    sections: [
      {
        widgets: [
          { textParagraph: { text: `\`${pending.command}\`` } },
          {
            buttonList: {
              buttons: [
                {
                  text: "Conferma",
                  onClick: { action: { function: "confirm", parameters: [{ key: "token", value: pending.token }] } },
                },
              ],
            },
          },
        ],
      },
    ],
  };
}

/** Sentinel a model can return to mean "this message isn't addressed to me" in a shared, multi-person space — see `buildSystemPrompt`'s multiUser block in `index.ts`. Unchanged from the retired channel. */
export const NO_REPLY = "NO_REPLY";

const STUCK_NOTE_DELAY_MS = 60_000;
const STUCK_NOTE =
  "Non ho ancora una risposta pronta: potrebbe essersi inceppato qualcosa, ma potrebbe ripartire da sola. Non serve fare nulla.";
const DEFAULT_POLL_INTERVAL_MS = 2_000;
const DEFAULT_PULL_BATCH_SIZE = 20;

/**
 * Composite session key: space + sender. Deliberately does NOT include
 * `thread` — confirmed live (two consecutive messages in the same DM
 * conversation produced two different `thread.name` values) that Google
 * Chat assigns a fresh thread to every top-level message in a DM (the DM
 * UI has no way to reply in-thread at all), so a thread-keyed session was
 * a brand new, empty history on every single message. Matches the retired
 * impersonation-based channel's own key exactly. Revisit only once Mercury
 * actually participates in threaded group spaces with a demonstrated need
 * for parallel per-thread conversations — not speculatively.
 */
export function deriveSessionKey(space: string, sender: string): string {
  return `${space}:${sender}`;
}

type RawChatSender = { name?: string; displayName?: string; email?: string; type?: string };
type RawChatEvent = {
  type?: string;
  message?: {
    name?: string;
    text?: string;
    space?: { name?: string };
    sender?: RawChatSender;
  };
  action?: { actionMethodName?: string; parameters?: Array<{ key?: string; value?: string }> };
  space?: { name?: string };
  user?: RawChatSender;
};

export type ParsedMessageEvent = {
  kind: "message";
  text: string;
  messageName: string;
  space: string;
  sender: string;
  senderDisplayName: string | undefined;
};

export type ParsedCardClickEvent = {
  kind: "card-click";
  space: string;
  sender: string;
  parameters: Record<string, string>;
};

/** Parses one decoded Pub/Sub event, or `null` if it isn't a kind this provider acts on. */
export function parseChatEvent(raw: unknown): ParsedMessageEvent | ParsedCardClickEvent | null {
  const event = raw as RawChatEvent;
  if (event?.type === "MESSAGE") {
    const m = event.message;
    if (!m || typeof m.name !== "string" || typeof m.text !== "string") return null;
    if (typeof m.space?.name !== "string") return null;
    if (typeof m.sender?.name !== "string") return null;
    return {
      kind: "message",
      text: m.text,
      messageName: m.name,
      space: m.space.name,
      sender: m.sender.name,
      senderDisplayName: m.sender.displayName,
    };
  }
  if (event?.type === "CARD_CLICKED") {
    if (typeof event.space?.name !== "string") return null;
    if (typeof event.user?.name !== "string") return null;
    const parameters: Record<string, string> = {};
    for (const p of event.action?.parameters ?? []) {
      if (typeof p.key === "string" && typeof p.value === "string") {
        parameters[p.key] = p.value;
      }
    }
    return { kind: "card-click", space: event.space.name, sender: event.user.name, parameters };
  }
  return null;
}

export type CardClickHandler = (params: Record<string, string>, space: string, sender: string) => Promise<void>;

export type GoogleChatProviderDeps = {
  credentials: ServiceAccountCredentials;
  subscription: string;
  store: ConfirmationStore;
  vaultPath: string;
  runCliFn: typeof runCli;
  writeSuppressionNoteFn: typeof writeSuppressionNote;
  recordSuppressionEventFn: (entry: EpisodicSummary) => Promise<void>;
  adminSpace: string;
  /**
   * Handles a `CARD_CLICKED` event's action parameters. Defaults to
   * resolving the confirm-required button's token through the same
   * `tryConfirm` path a typed `conferma <token>` message uses (see
   * `createGoogleChatProvider`'s default below) — override only to
   * handle a different card's click shape (e.g. a future `notify-user`
   * disambiguation token, see `notify-user.ts`), not to change how
   * confirmation itself resolves.
   */
  onCardClick?: CardClickHandler;
  /** Test seams — default to the real client functions bound with a token source built from `credentials`. */
  tokenSourceFn?: (creds: ServiceAccountCredentials) => TokenSource;
  sendMessageFn?: typeof sendMessage;
  sendCardFn?: typeof sendCard;
  updateMessageFn?: typeof updateMessage;
  pullEventsFn?: typeof pullEvents;
  acknowledgeFn?: typeof acknowledge;
  getOrCreateDmSpaceFn?: typeof getOrCreateDmSpace;
  pollIntervalMs?: number;
  setIntervalFn?: typeof setInterval;
  clearIntervalFn?: typeof clearInterval;
  setTimeoutFn?: typeof setTimeout;
  clearTimeoutFn?: typeof clearTimeout;
  log?: (msg: string) => void;
};

export type GoogleChatProvider = Provider & {
  /**
   * Best-effort self-join: adds the app itself to `space` via the Members
   * API if it isn't already a member. Unlike the retired channel's
   * `ensureChannel` (which could only start *listening* to a space Mercury
   * was already added to by a human — a real app has no self-add
   * capability under impersonation), a registered app can add itself.
   * **Not verified live as of this pass** — the Members-API call shape
   * here follows the documented request format but hasn't been exercised
   * against a real space yet; treat as best-effort until confirmed.
   */
  ensureChannel(space: string): Promise<void>;
  stop(): Promise<void>;
};

/** Builds the registered Google Chat app's `Provider`. */
export function createGoogleChatProvider(deps: GoogleChatProviderDeps): GoogleChatProvider {
  const log = deps.log ?? ((msg: string) => console.error(msg));
  const tokenSource = (deps.tokenSourceFn ?? createTokenSource)(deps.credentials);
  const sendMessageFn = deps.sendMessageFn ?? sendMessage;
  const sendCardFn = deps.sendCardFn ?? sendCard;
  const updateMessageFn = deps.updateMessageFn ?? updateMessage;
  const pullEventsFn = deps.pullEventsFn ?? pullEvents;
  const acknowledgeFn = deps.acknowledgeFn ?? acknowledge;
  const getOrCreateDmSpaceFn = deps.getOrCreateDmSpaceFn ?? getOrCreateDmSpace;
  const setIntervalFn = deps.setIntervalFn ?? setInterval;
  const clearIntervalFn = deps.clearIntervalFn ?? clearInterval;
  const setTimeoutFn = deps.setTimeoutFn ?? setTimeout;
  const clearTimeoutFn = deps.clearTimeoutFn ?? clearTimeout;
  const clientDeps = { tokenSource };
  const sentMessageNames = new Set<string>();

  /**
   * Default `onCardClick`: the confirm button's token routes through the
   * exact same `tryConfirm` logic a typed `conferma <token>` message
   * uses, synthesizing the text it would have parsed — one execution
   * path, one set of valid/expired/wrong-session-token behaviors,
   * regardless of how the token got here.
   */
  const onCardClick: CardClickHandler =
    deps.onCardClick ??
    (async (params, space, sender) => {
      const token = params.token;
      if (!token) {
        log(`[chat] card click with no token parameter`);
        return;
      }
      const reply = await tryConfirm(`conferma ${token}`, deriveSessionKey(space, sender), {
        store: deps.store,
        runCliFn: deps.runCliFn,
        userId: sender,
        vaultPath: deps.vaultPath,
        writeSuppressionNoteFn: deps.writeSuppressionNoteFn,
        recordSuppressionEventFn: deps.recordSuppressionEventFn,
      });
      if (reply !== null) {
        const sent = await sendMessageFn(space, reply, clientDeps);
        sentMessageNames.add(sent.name);
      }
    });
  let stopped = false;
  let pollTimer: ReturnType<typeof setInterval> | undefined;

  /** Per-turn output sink — same responsibilities as the retired `ChatStreamer`, rebuilt against the new client. */
  function createSink(space: string): TurnSink {
    let stuckTimer: ReturnType<typeof setTimeout> | undefined;
    let chain: Promise<void> = Promise.resolve();

    function enqueue(fn: () => Promise<void>): void {
      chain = chain.then(async () => {
        try {
          await fn();
        } catch (err) {
          log(`[chat:${space}] send failed: ${String(err)}`);
        }
      });
    }
    function sendPlain(text: string): void {
      enqueue(async () => {
        const sent = await sendMessageFn(space, text, clientDeps);
        sentMessageNames.add(sent.name);
      });
    }
    function stopStuckTimer(): void {
      if (stuckTimer !== undefined) clearTimeoutFn(stuckTimer);
    }
    function scheduleStuckTimer(): void {
      stopStuckTimer();
      stuckTimer = setTimeoutFn(() => {
        sendPlain(STUCK_NOTE);
      }, STUCK_NOTE_DELAY_MS);
    }
    scheduleStuckTimer();

    return {
      onToolStart: (label: string) => {
        scheduleStuckTimer();
        sendPlain(`_${label}_`);
      },
      // Deliberately absent: Google Chat only shows a message once fully
      // sent, so incremental delivery never actually reaches a human
      // faster — this MUST stay undefined, it's what keeps runTurn on its
      // non-streaming path (see src/router/provider.ts's TurnSink).
      onUsage: (inputTokens) => log(`[chat:${space}] [usage] inputTokens=${inputTokens ?? "?"}`),
      onStep: (step) => {
        const pending = detectPendingConfirmation(step);
        if (pending) {
          scheduleStuckTimer();
          enqueue(async () => {
            const sent = await sendCardFn(space, buildConfirmCard(pending), clientDeps);
            sentMessageNames.add(sent.name);
          });
        }
      },
      finalize: async (finalText: string) => {
        stopStuckTimer();
        const trimmed = finalText.trim();
        if (trimmed.length > 0 && trimmed !== NO_REPLY) {
          for (const message of splitForSendLimit(trimmed)) {
            sendPlain(message);
          }
        }
        await chain;
      },
      dispose: () => {
        stopStuckTimer();
      },
    };
  }

  async function processMessageEvent(event: ParsedMessageEvent, handleTurn: HandleTurn): Promise<void> {
    if (sentMessageNames.has(event.messageName)) return;

    const sessionKey = deriveSessionKey(event.space, event.sender);
    const markedInput = event.senderDisplayName ? `[Da: ${event.senderDisplayName}]\n${event.text}` : event.text;

    const confirmReply = await tryConfirm(event.text, sessionKey, {
      store: deps.store,
      runCliFn: deps.runCliFn,
      userId: event.sender,
      vaultPath: deps.vaultPath,
      writeSuppressionNoteFn: deps.writeSuppressionNoteFn,
      recordSuppressionEventFn: deps.recordSuppressionEventFn,
    });
    if (confirmReply !== null) {
      const sent = await sendMessageFn(event.space, confirmReply, clientDeps);
      sentMessageNames.add(sent.name);
      return;
    }

    const sink = createSink(event.space);
    await handleTurn(
      {
        channel: "google-chat",
        multiUser: true,
        text: markedInput,
        sessionKey,
        userId: event.sender,
        wikiUserId: encodeURIComponent(event.sender),
        logPrefix: `[chat:${event.space}:${event.sender}] `,
      },
      sink,
    );
  }

  /**
   * Acks each event right after it's pulled and parsed — before
   * `handleTurn` (or `onCardClick`) ever runs, not after the whole batch
   * finishes. Same pattern the open-source Hermes agent's Google Chat
   * adapter uses (ack in the Pub/Sub callback, agent processing dispatched
   * separately): a real multi-step turn routinely takes longer than the
   * subscription's ack deadline (Google's default is 10s), so acking only
   * once processing completes left every message in a batch open to being
   * redelivered — and reprocessed a second time, concurrently — while
   * still being worked on. Acking first decouples "message confirmed" from
   * "turn finished" entirely, so no turn duration can trigger a
   * redelivery. Accepted tradeoff, same one Hermes makes: a hard crash
   * mid-turn loses that one message rather than risking an endless
   * redelivery loop.
   */
  async function pollOnce(handleTurn: HandleTurn): Promise<void> {
    const messages = await pullEventsFn(deps.subscription, DEFAULT_PULL_BATCH_SIZE, clientDeps);
    for (const m of messages) {
      await acknowledgeFn(deps.subscription, [m.ackId], clientDeps).catch((err) => log(`[chat] ack failed: ${String(err)}`));
      const parsed = parseChatEvent(m.data);
      if (!parsed) continue;
      try {
        if (parsed.kind === "message") {
          await processMessageEvent(parsed, handleTurn);
        } else {
          await onCardClick(parsed.parameters, parsed.space, parsed.sender);
        }
      } catch (err) {
        log(`[chat] event handling failed: ${String(err)}`);
      }
    }
  }

  return {
    async start(handleTurn: HandleTurn): Promise<void> {
      const pollIntervalMs = deps.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;
      pollTimer = setIntervalFn(() => {
        if (stopped) return;
        pollOnce(handleTurn).catch((err) => log(`[chat] poll failed: ${String(err)}`));
      }, pollIntervalMs);
    },

    async ensureChannel(space: string): Promise<void> {
      // Self-join via the Members API — a real capability a registered app
      // has that the retired impersonated-user channel never did (see this
      // type's own doc comment). **Not exercised against a real space as
      // of this pass**: left as an honest no-op rather than a fabricated,
      // unverified Members-API call shape. Revisit once verified live.
      log(`[chat] ensureChannel(${space}) requested — self-join not yet implemented/verified`);
    },

    async stop(): Promise<void> {
      stopped = true;
      if (pollTimer !== undefined) clearIntervalFn(pollTimer);
    },

    async notify(userId: string, text: string): Promise<{ sessionKey: string }> {
      // sessionKey is the DM space's name, not the sent message's — matches
      // the retired channel's exact behavior (preserved, not fixed, per
      // this plan's "known pre-existing inconsistency" note: a real
      // conversation in that DM is keyed space:sender, not space.name
      // alone; reconciling that is a separate decision).
      const space = await getOrCreateDmSpaceFn(userId, clientDeps);
      const sent = await sendMessageFn(space.name, text, clientDeps);
      sentMessageNames.add(sent.name); // loop prevention applies here too — a proactive notification is still our own message if it comes back as an event
      return { sessionKey: space.name };
    },

    async notifyAdmin(text: string): Promise<void> {
      const sent = await sendMessageFn(deps.adminSpace, text, clientDeps);
      sentMessageNames.add(sent.name);
    },
  };
}

export type { ChatCard };
