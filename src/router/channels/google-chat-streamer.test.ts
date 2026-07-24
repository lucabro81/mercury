import { describe, it, expect } from "bun:test";
import { createChatStreamer, STUCK_NOTE } from "./google-chat-streamer.ts";
import { NO_REPLY } from "./google-chat-events.ts";
import type { CliResult } from "../../tools/cli-executor.ts";

const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: {} });

/** Records every send call, in the order the underlying CLI call
 * actually starts, and hands back a distinct message name per send. */
function fakeSenders() {
  const sendCalls: string[] = [];
  let counter = 0;
  const sendMessageFn = async (_space: string, text: string): Promise<{ name: string }> => {
    counter++;
    const name = `spaces/X/messages/${counter}`;
    sendCalls.push(text);
    return { name };
  };
  return { sendMessageFn, sendCalls };
}

describe("createChatStreamer", () => {
  it("sends the STUCK_NOTE once after stuckNoteDelayMs of silence, and never fires again afterward", async () => {
    const { sendMessageFn, sendCalls } = fakeSenders();
    const streamer = createChatStreamer(
      "spaces/X",
      { sendMessageFn, runCliFn, onMessageSent: () => {} },
      { stuckNoteDelayMs: 20 },
    );

    await new Promise((r) => setTimeout(r, 35));
    const countAtStuck = sendCalls.length;
    await new Promise((r) => setTimeout(r, 40)); // would-be further ticks at 40, 60...

    expect(countAtStuck).toBe(1);
    expect(sendCalls[0]).toBe(STUCK_NOTE);
    expect(sendCalls).toHaveLength(countAtStuck); // no further sends after the timer stopped
    streamer.stopHeartbeat();
  });

  it("stops the stuck-note timer immediately once the first real flush happens", async () => {
    const { sendMessageFn, sendCalls } = fakeSenders();
    const streamer = createChatStreamer(
      "spaces/X",
      { sendMessageFn, runCliFn, onMessageSent: () => {} },
      { stuckNoteDelayMs: 20 },
    );

    streamer.onTextChunk("Ecco la risposta vera. ");
    await new Promise((r) => setTimeout(r, 40)); // well past stuckNoteDelayMs

    expect(sendCalls).toEqual(["Ecco la risposta vera."]); // no STUCK_NOTE, ever
  });

  // The stuck note is never edited/deleted, even once the real answer
  // arrives afterward — it stays in the space as-is. A user reading the
  // conversation without tailing server logs should still be able to see
  // it happened and that Mercury did eventually recover, rather than
  // that history quietly disappearing.
  it("leaves a prior STUCK_NOTE untouched (never edited away) once the real answer arrives", async () => {
    const { sendMessageFn, sendCalls } = fakeSenders();
    const streamer = createChatStreamer(
      "spaces/X",
      { sendMessageFn, runCliFn, onMessageSent: () => {} },
      { stuckNoteDelayMs: 20 },
    );

    await new Promise((r) => setTimeout(r, 30));
    expect(sendCalls).toEqual([STUCK_NOTE]);

    streamer.onTextChunk("Eccomi, falso allarme. ");
    await new Promise((r) => setTimeout(r, 10));

    expect(sendCalls).toEqual([STUCK_NOTE, "Eccomi, falso allarme."]);
  });

  it("finalize() flushes a non-punctuated remainder as one final message", async () => {
    const { sendMessageFn, sendCalls } = fakeSenders();
    const streamer = createChatStreamer("spaces/X", { sendMessageFn, runCliFn, onMessageSent: () => {} });
    streamer.onTextChunk("risposta senza punto");
    await streamer.finalize();
    expect(sendCalls).toEqual(["risposta senza punto"]);
  });

  it("finalize() sends nothing when the never-flushed buffer trims to exactly NO_REPLY", async () => {
    const { sendMessageFn, sendCalls } = fakeSenders();
    const streamer = createChatStreamer("spaces/X", { sendMessageFn, runCliFn, onMessageSent: () => {} });
    streamer.onTextChunk(NO_REPLY);
    await streamer.finalize();
    expect(sendCalls).toEqual([]);
  });

  it("finalize() is a no-op when the buffer is empty", async () => {
    const { sendMessageFn, sendCalls } = fakeSenders();
    const streamer = createChatStreamer("spaces/X", { sendMessageFn, runCliFn, onMessageSent: () => {} });
    await streamer.finalize();
    expect(sendCalls).toEqual([]);
  });

  it("delivers messages in call order even when an earlier send resolves after a later one", async () => {
    const order: string[] = [];
    const sendMessageFn = async (_space: string, text: string): Promise<{ name: string }> => {
      const delay = text === "prima." ? 30 : 0;
      await new Promise((r) => setTimeout(r, delay));
      order.push(text);
      return { name: `spaces/X/messages/${text}` };
    };
    const streamer = createChatStreamer("spaces/X", { sendMessageFn, runCliFn, onMessageSent: () => {} });

    streamer.onTextChunk("prima. seconda. ");
    await streamer.finalize();

    expect(order).toEqual(["prima.", "seconda."]);
  });

  it("onToolStart sends the label as a Chat-italic message and reports its name", async () => {
    const { sendMessageFn, sendCalls } = fakeSenders();
    const names: string[] = [];
    const streamer = createChatStreamer("spaces/X", {
      sendMessageFn,
      runCliFn,
      onMessageSent: (n) => names.push(n),
    });

    streamer.onToolStart("Sto leggendo dati con jira…");
    await streamer.finalize();

    expect(sendCalls).toEqual(["_Sto leggendo dati con jira…_"]);
    expect(names).toHaveLength(1);
  });

  // Reverted from the earlier "one shared, edited-in-place status
  // message" design: send/update cost the same CLI subprocess + network
  // round trip either way, so unifying them never actually reduced the
  // number of slow operations queued ahead of the real answer — it only
  // reduced how many message bubbles were visible in the space. Since
  // the real fix for queue growth was removing the unbounded generic
  // filler heartbeat (a separate turn's worth of work), a full visible
  // history of every tool call is strictly more useful for observing
  // behavior during this research phase, at no extra cost.
  it("sends a brand new message for every tool-start call, in order, instead of editing a shared one", async () => {
    const { sendMessageFn, sendCalls } = fakeSenders();
    const streamer = createChatStreamer("spaces/X", { sendMessageFn, runCliFn, onMessageSent: () => {} });

    streamer.onToolStart("Sto leggendo il wiki…");
    streamer.onToolStart("Sto leggendo dati con jira…");
    streamer.onToolStart("Sto leggendo dati con jira…");
    await streamer.finalize();

    expect(sendCalls).toEqual([
      "_Sto leggendo il wiki…_",
      "_Sto leggendo dati con jira…_",
      "_Sto leggendo dati con jira…_",
    ]);
  });

  it("keeps a tool-start message in call order relative to a real flush right after it", async () => {
    const { sendMessageFn, sendCalls } = fakeSenders();
    const streamer = createChatStreamer("spaces/X", { sendMessageFn, runCliFn, onMessageSent: () => {} });

    streamer.onToolStart("Sto leggendo dati con jira…");
    streamer.onTextChunk("Ecco la risposta. ");
    await streamer.finalize();

    expect(sendCalls).toEqual(["_Sto leggendo dati con jira…_", "Ecco la risposta."]);
  });

  // Regression: tool activity is real proof Mercury isn't stuck, but
  // before this fix onToolStart never affected the heartbeat timer at
  // all — a turn with several slow-but-active tool calls could still hit
  // the stuck-note threshold and post the "might be stuck" note even
  // while tools were actively running back to back.
  it("postpones the stuck-note timer while tools keep starting, so frequent activity never triggers it", async () => {
    const { sendMessageFn, sendCalls } = fakeSenders();
    const streamer = createChatStreamer(
      "spaces/X",
      { sendMessageFn, runCliFn, onMessageSent: () => {} },
      { stuckNoteDelayMs: 20 },
    );

    // A tool "starts" every 10ms — faster than the 20ms stuck-note delay
    // — well past what would normally elapse without this reset.
    const toolInterval = setInterval(() => streamer.onToolStart("Sto lavorando…"), 10);
    await new Promise((r) => setTimeout(r, 90));
    clearInterval(toolInterval);
    streamer.stopHeartbeat();

    expect(sendCalls.some((t) => t === STUCK_NOTE)).toBe(false);
  });

  it("stopHeartbeat() is safe to call twice, and safe to call after finalize()", async () => {
    const { sendMessageFn } = fakeSenders();
    const streamer = createChatStreamer("spaces/X", { sendMessageFn, runCliFn, onMessageSent: () => {} });
    streamer.stopHeartbeat();
    streamer.stopHeartbeat();
    await streamer.finalize();
    expect(() => streamer.stopHeartbeat()).not.toThrow();
  });
});
