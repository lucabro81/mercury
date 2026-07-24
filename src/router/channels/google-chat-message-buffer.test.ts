import { describe, it, expect } from "bun:test";
import { appendAndFlush, MAX_CHAT_MESSAGE_CHARS } from "./google-chat-message-buffer.ts";

describe("appendAndFlush", () => {
  it("flushes one message when the chunk contains exactly one full sentence", () => {
    const result = appendAndFlush("", "Ciao, come va? ", false);
    expect(result).toEqual({ messages: ["Ciao, come va?"], remainder: "" });
  });

  it("flushes two messages in order when the chunk contains two full sentences", () => {
    const result = appendAndFlush("", "Prima frase. Seconda frase. ", false);
    expect(result).toEqual({ messages: ["Prima frase.", "Seconda frase."], remainder: "" });
  });

  it("treats ! and ? as sentence terminators, same as .", () => {
    const result = appendAndFlush("", "Wow! Davvero? Ok. ", false);
    expect(result.messages).toEqual(["Wow!", "Davvero?", "Ok."]);
  });

  it("returns zero messages and the full text as remainder when there's no boundary yet", () => {
    const result = appendAndFlush("", "sto ancora scrivendo senza punteggiatura", false);
    expect(result).toEqual({ messages: [], remainder: "sto ancora scrivendo senza punteggiatura" });
  });

  it("flushes a sentence whose boundary arrives split across two separate calls", () => {
    const first = appendAndFlush("", "Frase spezzata in due chiamate", false);
    expect(first).toEqual({ messages: [], remainder: "Frase spezzata in due chiamate" });

    const second = appendAndFlush(first.remainder, ". Prosegue dopo. ", false);
    expect(second).toEqual({
      messages: ["Frase spezzata in due chiamate.", "Prosegue dopo."],
      remainder: "",
    });
  });

  it("force-flushes at the last whitespace at-or-before the cap when no sentence boundary is hit, never splitting a word", () => {
    const word = "parola";
    // Build text with no punctuation at all, long enough to exceed the cap
    // several times over, made of whitespace-separated words so a safe cut
    // point always exists.
    const chunk = Array.from({ length: 200 }, (_, i) => `${word}${i}`).join(" ");
    const result = appendAndFlush("", chunk, false);

    expect(result.messages.length).toBeGreaterThan(0);
    for (const message of result.messages) {
      expect(message.length).toBeLessThanOrEqual(MAX_CHAT_MESSAGE_CHARS);
      // No message may start or end with a fragment of a word split by the
      // cut — every message must be made of whole "parolaN" tokens only.
      for (const token of message.split(" ")) {
        expect(token).toMatch(/^parola\d+$/);
      }
    }
    // Nothing lost: rejoining every flushed message plus the remainder,
    // space-separated, reproduces the original chunk.
    expect([...result.messages, result.remainder].join(" ")).toBe(chunk);
  });

  it("does not split a single token longer than the cap when there is no whitespace anywhere", () => {
    const hugeToken = "x".repeat(MAX_CHAT_MESSAGE_CHARS + 50);
    const result = appendAndFlush("", hugeToken, false);
    expect(result).toEqual({ messages: [], remainder: hugeToken });
  });

  it("flushes a non-punctuated remainder as the last message when isFinal is true", () => {
    const result = appendAndFlush("", "risposta senza punto finale", true);
    expect(result).toEqual({ messages: ["risposta senza punto finale"], remainder: "" });
  });

  it("produces no trailing empty message when isFinal is true and the remainder is empty", () => {
    const result = appendAndFlush("", "Frase completa. ", true);
    expect(result).toEqual({ messages: ["Frase completa."], remainder: "" });
  });

  it("produces no trailing empty message when isFinal is true and the remainder is only whitespace", () => {
    const result = appendAndFlush("", "Frase completa.   ", true);
    expect(result).toEqual({ messages: ["Frase completa."], remainder: "" });
  });

  it("strips leading whitespace from both the flushed piece and the new remainder after a forced cut", () => {
    const chunk = "a".repeat(MAX_CHAT_MESSAGE_CHARS - 1) + " resto-senza-spazi-successivi";
    const result = appendAndFlush("", chunk, false);
    expect(result.messages[0]?.startsWith(" ")).toBe(false);
    expect(result.messages[0]?.endsWith(" ")).toBe(false);
    expect(result.remainder.startsWith(" ")).toBe(false);
  });
});
