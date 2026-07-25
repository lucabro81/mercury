/**
 * Coordinates Google Chat's messages for one turn: sends a new message
 * every time a tool call starts, showing which tool is running, and — once
 * the turn is done — the final answer as one message (split only if it
 * would exceed Google Chat's own message-size limit, see
 * `google-chat-message-buffer.ts`). If too much time passes with no tool
 * activity and no real answer yet, one "might be stuck" note is sent too —
 * it has no real consequence (there is no cancellation mechanism anywhere
 * in this codebase), and it is never edited or deleted afterward even once
 * the real answer arrives: a full, permanent history of every tool call
 * plus the stuck note (if any) directly in the space is more useful for
 * observing behavior during this research phase than a tidied-up trail
 * would be.
 *
 * No longer consumes streamed text chunk-by-chunk (dropped along with the
 * old sentence-boundary splitting it used to do — reviewed after live use
 * and judged to not actually improve readability, only tool-call status
 * messages were found genuinely useful): the Google Chat channel now
 * drives `runTurn` on its plain, non-streaming path and hands the whole
 * final text to `finalize` in one call.
 *
 * Tool activity is real proof Mercury isn't stuck: `onToolStart` postpones
 * the stuck-note timer (see `scheduleNextTick`), so a turn with several
 * back-to-back tool calls never reaches it just because a fixed delay
 * elapsed.
 *
 * Every outgoing send is funneled through a single promise chain so
 * delivery order always matches call order, even though sends can be
 * triggered from independent async sources (the stuck-note timer,
 * `onToolStart`, `finalize`) — same pattern `google-chat-events.ts` already
 * uses for incoming lines, applied here to outgoing ones.
 */
import { splitForSendLimit } from "./google-chat-message-buffer.ts";
import { NO_REPLY } from "./google-chat-events.ts";
import type { sendMessage } from "./google-chat-client.ts";
import type { runCli } from "../../tools/cli-executor.ts";

export const STUCK_NOTE_DELAY_MS = 60_000;
export const STUCK_NOTE =
  "Non ho ancora una risposta pronta: potrebbe essersi inceppato qualcosa, ma potrebbe ripartire da sola. Non serve fare nulla.";

export type ChatStreamer = {
  /** Pass as buildTools' onToolStart — sends `label` as a new Chat message and postpones the stuck-note timer. */
  onToolStart: (label: string) => void;
  /** Stops the stuck-note timer immediately; idempotent, safe to call any time. */
  stopHeartbeat: () => void;
  /**
   * Call once the turn is done, with the model's complete final text:
   * stops the stuck-note timer, sends the text as one or more messages
   * (suppressing an exact `NO_REPLY` match, sending nothing), then awaits
   * every in-flight send.
   */
  finalize: (finalText: string) => Promise<void>;
};

export function createChatStreamer(
  space: string,
  deps: {
    sendMessageFn: typeof sendMessage;
    runCliFn: typeof runCli;
    /** Called once per message actually sent (tool-start, stuck note, or the final answer), with its returned name. */
    onMessageSent: (name: string) => void;
    setTimeoutFn?: typeof setTimeout;
    clearTimeoutFn?: typeof clearTimeout;
  },
  opts?: { stuckNoteDelayMs?: number },
): ChatStreamer {
  const setTimeoutFn = deps.setTimeoutFn ?? setTimeout;
  const clearTimeoutFn = deps.clearTimeoutFn ?? clearTimeout;
  const stuckNoteDelayMs = opts?.stuckNoteDelayMs ?? STUCK_NOTE_DELAY_MS;

  let chain: Promise<void> = Promise.resolve();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;

  function enqueue(fn: () => Promise<void>): void {
    chain = chain.then(async () => {
      try {
        await fn();
      } catch (err) {
        console.error(`[chat:${space}] streaming send failed: ${String(err)}`);
      }
    });
  }

  /** Sends `text` as a brand new message and reports its name. */
  function sendPlain(text: string): void {
    enqueue(async () => {
      const sent = await deps.sendMessageFn(space, text, deps.runCliFn);
      deps.onMessageSent(sent.name);
    });
  }

  function stopHeartbeat(): void {
    if (stopped) return;
    stopped = true;
    if (timer !== undefined) clearTimeoutFn(timer);
  }

  function scheduleNextTick(): void {
    if (stopped) return;
    if (timer !== undefined) clearTimeoutFn(timer);
    timer = setTimeoutFn(tick, stuckNoteDelayMs);
  }

  /** Fires only once `stuckNoteDelayMs` has elapsed with no tool activity and no real flush — stops the timer for good. */
  function tick(): void {
    stopHeartbeat();
    sendPlain(STUCK_NOTE);
  }

  scheduleNextTick();

  /**
   * Tool activity is proof Mercury isn't stuck: postpones the stuck-note
   * timer, so frequent tool calls never trigger it purely because
   * wall-clock time passed. Sends `label` as its own new message.
   */
  function onToolStart(label: string): void {
    scheduleNextTick();
    sendPlain(`_${label}_`);
  }

  async function finalize(finalText: string): Promise<void> {
    stopHeartbeat();
    const trimmed = finalText.trim();
    if (trimmed.length > 0 && trimmed !== NO_REPLY) {
      for (const message of splitForSendLimit(trimmed)) {
        sendPlain(message);
      }
    }
    await chain;
  }

  return { onToolStart, stopHeartbeat, finalize };
}
