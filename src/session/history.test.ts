import { describe, it, expect } from "bun:test";
import { createSessionHistory, MAX_HISTORY_CHARS } from "./history.ts";
import type { Message } from "./history.ts";

function fakeSummarizer(spy?: { calls: Message[][] }) {
  return async (messages: Message[]): Promise<string> => {
    spy?.calls.push(messages);
    return "a summary";
  };
}

describe("createSessionHistory", () => {
  it("returns an empty array when nothing was added", () => {
    const history = createSessionHistory(fakeSummarizer());
    expect(history.getMessages()).toEqual([]);
  });

  it("returns messages in order after adding a user and an assistant message", async () => {
    const history = createSessionHistory(fakeSummarizer());
    await history.addUserMessage("hi");
    await history.addAssistantMessage("hello");
    expect(history.getMessages()).toEqual([
      { role: "user", content: "hi" },
      { role: "assistant", content: "hello" },
    ]);
  });

  it("never calls summarize while under the threshold", async () => {
    const calls: Message[][] = [];
    const history = createSessionHistory(fakeSummarizer({ calls }));
    await history.addUserMessage("short message");
    await history.addAssistantMessage("another short message");
    expect(calls.length).toBe(0);
  });

  it("calls summarize exactly once when a single message pushes the total over the threshold, including that message in the batch", async () => {
    const calls: Message[][] = [];
    const history = createSessionHistory(fakeSummarizer({ calls }));
    const big = "x".repeat(MAX_HISTORY_CHARS + 1);
    await history.addUserMessage(big);

    expect(calls.length).toBe(1);
    expect(calls[0]).toEqual([{ role: "user", content: big }]);
  });

  it("boundary: exactly MAX_HISTORY_CHARS does not trigger, +1 does", async () => {
    const callsAtBoundary: Message[][] = [];
    const atBoundary = createSessionHistory(fakeSummarizer({ calls: callsAtBoundary }));
    await atBoundary.addUserMessage("x".repeat(MAX_HISTORY_CHARS));
    expect(callsAtBoundary.length).toBe(0);

    const callsOverBoundary: Message[][] = [];
    const overBoundary = createSessionHistory(
      fakeSummarizer({ calls: callsOverBoundary }),
    );
    await overBoundary.addUserMessage("x".repeat(MAX_HISTORY_CHARS + 1));
    expect(callsOverBoundary.length).toBe(1);
  });

  it("keeps the summary alongside new raw messages after a summarization happens", async () => {
    const history = createSessionHistory(fakeSummarizer());
    const big = "x".repeat(MAX_HISTORY_CHARS + 1);
    await history.addUserMessage(big);

    // summarization already happened; raw history should be cleared
    const afterSummary = history.getMessages();
    expect(afterSummary.length).toBe(1);
    expect(afterSummary[0]?.content).toContain("a summary");

    await history.addUserMessage("what's next?");
    const messages = history.getMessages();
    expect(messages.length).toBe(2);
    expect(messages[0]?.content).toContain("a summary");
    expect(messages[1]).toEqual({ role: "user", content: "what's next?" });
  });

  // Lets the terminal show a live "how full is the context" indicator
  // (see src/router/terminal.ts's promptSuffix) — useful for telling
  // apart "the model is confused" from "the context is actually full".
  it("getCharCount reports the total length of what getMessages() would return", async () => {
    const history = createSessionHistory(fakeSummarizer());
    expect(history.getCharCount()).toBe(0);

    await history.addUserMessage("hi"); // 2 chars
    await history.addAssistantMessage("hello"); // 5 chars
    expect(history.getCharCount()).toBe(7);
  });

  it("getCharCount counts the summary message's length after a summarization happens", async () => {
    const history = createSessionHistory(fakeSummarizer());
    const big = "x".repeat(MAX_HISTORY_CHARS + 1);
    await history.addUserMessage(big);

    const messages = history.getMessages();
    const expected = messages.reduce((sum, m) => sum + m.content.length, 0);
    expect(history.getCharCount()).toBe(expected);
  });

  // onBeforeCompress lets an episodic/semantic capture mirror a batch of
  // messages to Qdrant right before Layer 1 discards them from the live
  // context — see idle-session-cron.ts's shared capture function.
  describe("onBeforeCompress", () => {
    it("is called with exactly the batch about to be compressed, before summarize resolves", async () => {
      const seen: Message[][] = [];
      const big = "x".repeat(MAX_HISTORY_CHARS + 1);
      const history = createSessionHistory(fakeSummarizer(), (messages) => {
        seen.push(messages);
      });

      await history.addUserMessage(big);

      expect(seen).toEqual([[{ role: "user", content: big }]]);
    });

    it("is never called while under the threshold", async () => {
      const seen: Message[][] = [];
      const history = createSessionHistory(fakeSummarizer(), (messages) => {
        seen.push(messages);
      });

      await history.addUserMessage("short message");
      expect(seen.length).toBe(0);
    });

    it("is optional — omitting it changes nothing about summarization behavior", async () => {
      const big = "x".repeat(MAX_HISTORY_CHARS + 1);
      const history = createSessionHistory(fakeSummarizer());
      await history.addUserMessage(big);
      expect(history.getMessages()[0]?.content).toContain("a summary");
    });

    it("receives the prior summary re-injected as a leading message, same batch summarize() gets", async () => {
      const seen: Message[][] = [];
      const history = createSessionHistory(fakeSummarizer(), (messages) => {
        seen.push(messages);
      });

      await history.addUserMessage("x".repeat(MAX_HISTORY_CHARS + 1)); // first compression
      await history.addUserMessage("x".repeat(MAX_HISTORY_CHARS + 1)); // second compression, summary now exists

      expect(seen.length).toBe(2);
      expect(seen[1]?.[0]).toEqual({ role: "assistant", content: "Earlier conversation summary: a summary" });
    });
  });
});
