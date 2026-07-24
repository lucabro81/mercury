/**
 * Pure, I/O-free buffering for splitting a model's streamed answer into
 * separate Google Chat messages at sentence boundaries, instead of one
 * final wall of text (see `google-chat-streamer.ts`, the only caller).
 */

export const MAX_CHAT_MESSAGE_CHARS = 350;
export const SENTENCE_END_RE = /[.!?][ \t\n\r]+/;

export type BufferFlushResult = {
  /** Zero or more messages to send now, in the order they must be sent. */
  messages: string[];
  /** What remains buffered, to be prepended to the next chunk (or flushed at isFinal). */
  remainder: string;
};

function lastWhitespaceIndex(s: string): number {
  for (let i = s.length - 1; i >= 0; i--) {
    if (/\s/.test(s[i] as string)) return i;
  }
  return -1;
}

/**
 * Appends `chunk` to `buffer`, then repeatedly extracts complete sentences
 * (terminal `.`/`!`/`?` followed by real whitespace) until none remain. If
 * what's left still exceeds `MAX_CHAT_MESSAGE_CHARS`, force-flushes at the
 * last whitespace at-or-before the limit — never splits a single word, even
 * if that means one piece exceeds the cap (a single unbroken token longer
 * than the cap is left untouched rather than split). When `isFinal` is
 * true, whatever is left after all of the above is flushed too, trimmed,
 * regardless of trailing punctuation.
 */
export function appendAndFlush(buffer: string, chunk: string, isFinal: boolean): BufferFlushResult {
  let combined = buffer + chunk;
  const messages: string[] = [];

  for (;;) {
    const match = SENTENCE_END_RE.exec(combined);
    if (!match) break;
    const sentence = combined.slice(0, match.index + 1).trim();
    if (sentence.length > 0) messages.push(sentence);
    combined = combined.slice(match.index + match[0].length);
  }

  while (combined.length > MAX_CHAT_MESSAGE_CHARS) {
    const window = combined.slice(0, MAX_CHAT_MESSAGE_CHARS);
    const cutAt = lastWhitespaceIndex(window);
    if (cutAt <= 0) break; // no safe cut point without splitting a word
    const piece = combined.slice(0, cutAt).trim();
    if (piece.length === 0) break;
    messages.push(piece);
    combined = combined.slice(cutAt).replace(/^\s+/, "");
  }

  if (isFinal) {
    const rest = combined.trim();
    if (rest.length > 0) messages.push(rest);
    combined = "";
  }

  return { messages, remainder: combined };
}
