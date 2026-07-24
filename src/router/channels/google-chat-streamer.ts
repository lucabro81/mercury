/**
 * Coordinates Google Chat's streaming reply for one turn: buffers the
 * model's streamed text and flushes it as separate messages at sentence
 * boundaries (`google-chat-message-buffer.ts`), and sends a new message
 * every time a tool call starts, showing which tool is running. If too
 * much time passes with no tool activity and no real answer yet, one
 * "might be stuck" note is sent too — it has no real consequence (there
 * is no cancellation mechanism anywhere in this codebase), and it is
 * never edited or deleted afterward even once the real answer arrives:
 * a full, permanent history of every tool call plus the stuck note (if
 * any) directly in the space is more useful for observing behavior
 * during this research phase than a tidied-up trail would be, and
 * costs nothing extra (send and update are both a real CLI subprocess +
 * network round trip, so unifying them into one edited-in-place message
 * was tried and dropped — it never actually reduced how many slow
 * operations were queued, only how many message bubbles were visible).
 *
 * Tool activity is real proof Mercury isn't stuck: `onToolStart`
 * postpones the stuck-note timer (see `scheduleNextTick`), so a turn
 * with several back-to-back tool calls never reaches it just because a
 * fixed delay elapsed.
 *
 * Every outgoing send is funneled through a single promise chain so
 * delivery order always matches call order, even though sends can be
 * triggered from independent async sources (the stuck-note timer,
 * `onToolStart`, `onTextChunk`) — same pattern `google-chat-events.ts`
 * already uses for incoming lines, applied here to outgoing ones.
 */
import { appendAndFlush } from "./google-chat-message-buffer.ts";
import { NO_REPLY } from "./google-chat-events.ts";
import type { sendMessage } from "./google-chat-client.ts";
import type { runCli } from "../../tools/cli-executor.ts";

export const STUCK_NOTE_DELAY_MS = 60_000;
export const STUCK_NOTE =
  "Non ho ancora una risposta pronta: potrebbe essersi inceppato qualcosa, ma potrebbe ripartire da sola. Non serve fare nulla.";

export type ChatStreamer = {
  /** Pass directly as runTurn's deps.onTextChunk. */
  onTextChunk: (chunk: string) => void;
  /** Pass as buildTools' onToolStart — sends `label` as a new Chat message and postpones the stuck-note timer. */
  onToolStart: (label: string) => void;
  /** Stops the stuck-note timer immediately; idempotent, safe to call any time. */
  stopHeartbeat: () => void;
  /** Call once the turn is done: flushes any remainder (suppressing an exact NO_REPLY match), then awaits every in-flight send. */
  finalize: () => Promise<void>;
};

export function createChatStreamer(
  space: string,
  deps: {
    sendMessageFn: typeof sendMessage;
    runCliFn: typeof runCli;
    /** Called once per message actually sent (tool-start, stuck note, or real flush), with its returned name. */
    onMessageSent: (name: string) => void;
    setTimeoutFn?: typeof setTimeout;
    clearTimeoutFn?: typeof clearTimeout;
  },
  opts?: { stuckNoteDelayMs?: number },
): ChatStreamer {
  const setTimeoutFn = deps.setTimeoutFn ?? setTimeout;
  const clearTimeoutFn = deps.clearTimeoutFn ?? clearTimeout;
  const stuckNoteDelayMs = opts?.stuckNoteDelayMs ?? STUCK_NOTE_DELAY_MS;

  let buffer = "";
  let hasFlushedReal = false;
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

  function flushMessages(messages: string[]): void {
    if (!hasFlushedReal) {
      hasFlushedReal = true;
      stopHeartbeat();
    }
    for (const message of messages) {
      sendPlain(message);
    }
  }

  function onTextChunk(chunk: string): void {
    const result = appendAndFlush(buffer, chunk, false);
    buffer = result.remainder;
    if (result.messages.length > 0) flushMessages(result.messages);
  }

  async function finalize(): Promise<void> {
    stopHeartbeat();
    const result = appendAndFlush(buffer, "", true);
    buffer = result.remainder;
    const isSuppressedNoReply =
      !hasFlushedReal && result.messages.length === 1 && result.messages[0] === NO_REPLY;
    if (result.messages.length > 0 && !isSuppressedNoReply) {
      flushMessages(result.messages);
    }
    await chain;
  }

  return { onTextChunk, onToolStart, stopHeartbeat, finalize };
}
