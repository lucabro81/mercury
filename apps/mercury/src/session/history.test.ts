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

  // The primer seeds a brand-new session with facts from the user's last
  // closed session (see context-primer.ts) — kept as state independent from
  // `summary` on purpose, so it's never at risk of being paraphrased or
  // dropped by the LLM summarizer (see history_primer design note).
  describe("primer", () => {
    it("seeds getMessages() with the primer as the leading message before any turn happens", () => {
      const history = createSessionHistory(fakeSummarizer(), undefined, "user is a data scientist");
      expect(history.getMessages()).toEqual([
        { role: "assistant", content: "Context from your last session: user is a data scientist" },
      ]);
    });

    it("orders the primer before the summary message once a real compression produces one", async () => {
      const history = createSessionHistory(fakeSummarizer(), undefined, "prior session facts");
      await history.addUserMessage("x".repeat(MAX_HISTORY_CHARS + 1));

      const messages = history.getMessages();
      expect(messages[0]).toEqual({
        role: "assistant",
        content: "Context from your last session: prior session facts",
      });
      expect(messages[1]?.content).toContain("a summary");
    });

    it("omitting the primer behaves exactly as before this change — no leading primer message", () => {
      const history = createSessionHistory(fakeSummarizer());
      expect(history.getMessages()).toEqual([]);
    });

    it("an empty-string primer behaves like an omitted one", () => {
      const history = createSessionHistory(fakeSummarizer(), undefined, "");
      expect(history.getMessages()).toEqual([]);
    });

    it("survives a real compression event unchanged — it is never part of the batch sent to summarize()", async () => {
      const calls: Message[][] = [];
      const big = "x".repeat(MAX_HISTORY_CHARS + 1);
      const history = createSessionHistory(fakeSummarizer({ calls }), undefined, "prior session facts");

      await history.addUserMessage(big);

      expect(calls).toEqual([[{ role: "user", content: big }]]);
      expect(history.getMessages()[0]).toEqual({
        role: "assistant",
        content: "Context from your last session: prior session facts",
      });
    });

    it("getCharCount includes the primer's length once it's present", () => {
      const history = createSessionHistory(fakeSummarizer(), undefined, "hello");
      expect(history.getCharCount()).toBe("Context from your last session: hello".length);
    });
  });

  // Used by turn-runner.ts to persist a corrected assistant turn (see
  // issue-list correction) after it was already recorded — without this,
  // the duplicated-list version the feature exists to eliminate would
  // permanently survive in the model's own future context.
  describe("replaceLastAssistantMessage", () => {
    it("overwrites the last message's content when it's an assistant message", async () => {
      const history = createSessionHistory(fakeSummarizer());
      await history.addUserMessage("hi");
      await history.addAssistantMessage("raw duplicated list");

      history.replaceLastAssistantMessage("corrected text");

      expect(history.getMessages()).toEqual([
        { role: "user", content: "hi" },
        { role: "assistant", content: "corrected text" },
      ]);
    });

    it("no-ops when there are no messages yet", () => {
      const history = createSessionHistory(fakeSummarizer());
      history.replaceLastAssistantMessage("corrected text");
      expect(history.getMessages()).toEqual([]);
    });

    it("no-ops when the last message is a user message", async () => {
      const history = createSessionHistory(fakeSummarizer());
      await history.addAssistantMessage("hello");
      await history.addUserMessage("what about MER-1?");

      history.replaceLastAssistantMessage("corrected text");

      expect(history.getMessages()).toEqual([
        { role: "assistant", content: "hello" },
        { role: "user", content: "what about MER-1?" },
      ]);
    });

    it("does not call summarize, even when the replacement alone would exceed MAX_HISTORY_CHARS", async () => {
      const calls: Message[][] = [];
      const history = createSessionHistory(fakeSummarizer({ calls }));
      await history.addAssistantMessage("short");

      history.replaceLastAssistantMessage("x".repeat(MAX_HISTORY_CHARS + 1));

      expect(calls.length).toBe(0);
      expect(history.getMessages()).toEqual([
        { role: "assistant", content: "x".repeat(MAX_HISTORY_CHARS + 1) },
      ]);
    });
  });
});
