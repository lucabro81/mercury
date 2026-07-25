import { describe, it, expect } from "bun:test";
import { splitForSendLimit, MAX_CHAT_MESSAGE_CHARS } from "./google-chat-message-buffer.ts";

describe("splitForSendLimit", () => {
  it("returns a single message, trimmed, when the text is well under the cap", () => {
    expect(splitForSendLimit("Ciao, come va?")).toEqual(["Ciao, come va?"]);
    expect(splitForSendLimit("  con spazi attorno  ")).toEqual(["con spazi attorno"]);
  });

  it("returns an empty array for empty or whitespace-only input", () => {
    expect(splitForSendLimit("")).toEqual([]);
    expect(splitForSendLimit("   ")).toEqual([]);
  });

  it("force-splits at the last whitespace at-or-before the cap when the text exceeds it, never splitting a word", () => {
    const word = "parola";
    // Whitespace-separated tokens, long enough to exceed the cap several
    // times over, so a safe cut point always exists.
    const chunk = Array.from({ length: 15_000 }, (_, i) => `${word}${i}`).join(" ");
    const result = splitForSendLimit(chunk);

    expect(result.length).toBeGreaterThan(1);
    for (const message of result) {
      expect(message.length).toBeLessThanOrEqual(MAX_CHAT_MESSAGE_CHARS);
      for (const token of message.split(" ")) {
        expect(token).toMatch(/^parola\d+$/);
      }
    }
    // Nothing lost: rejoining every piece, space-separated, reproduces the original.
    expect(result.join(" ")).toBe(chunk);
  });

  it("does not split a single token longer than the cap when there is no whitespace anywhere", () => {
    const hugeToken = "x".repeat(MAX_CHAT_MESSAGE_CHARS + 50);
    expect(splitForSendLimit(hugeToken)).toEqual([hugeToken]);
  });

  it("strips whitespace at each cut boundary, leaving no message starting or ending with a space", () => {
    const chunk = "a".repeat(MAX_CHAT_MESSAGE_CHARS - 1) + " resto-senza-spazi-successivi";
    const result = splitForSendLimit(chunk);
    for (const message of result) {
      expect(message.startsWith(" ")).toBe(false);
      expect(message.endsWith(" ")).toBe(false);
    }
  });
});
