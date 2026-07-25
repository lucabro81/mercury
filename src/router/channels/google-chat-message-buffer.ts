/**
 * Splits a complete final answer into more than one Google Chat message
 * only when it would exceed the API's own message-size limit — a purely
 * technical safety net, not a readability choice (see
 * `google-chat-streamer.ts`, the only caller). Google Chat rejects a
 * message over 32,000 bytes ("the maximum message size... is 32,000
 * bytes... your Chat app must send multiple messages instead" —
 * https://developers.google.com/workspace/chat/create-messages). A local
 * model's answer coming anywhere close to that is effectively never
 * observed in practice, but the cut stays in place as a correctness net
 * regardless.
 */

// Characters, not bytes — a wide margin under the real 32,000-byte limit.
// Multi-byte UTF-8 characters (accents, emoji) mean chars != bytes, but the
// margin is generous enough that only text many times longer than any real
// answer would ever need the exact byte count instead of this estimate.
export const MAX_CHAT_MESSAGE_CHARS = 30_000;

function lastWhitespaceIndex(s: string): number {
  for (let i = s.length - 1; i >= 0; i--) {
    if (/\s/.test(s[i] as string)) return i;
  }
  return -1;
}

/**
 * Splits `text` at the last whitespace at-or-before `MAX_CHAT_MESSAGE_CHARS`,
 * repeated as needed — never splits a single word, even if that means one
 * piece exceeds the cap (a single unbroken token longer than the cap is
 * left intact, the one documented case where the cap can be exceeded).
 * Returns `[]` for empty/whitespace-only input.
 */
export function splitForSendLimit(text: string): string[] {
  const messages: string[] = [];
  let remaining = text.trim();

  while (remaining.length > MAX_CHAT_MESSAGE_CHARS) {
    const window = remaining.slice(0, MAX_CHAT_MESSAGE_CHARS);
    const cutAt = lastWhitespaceIndex(window);
    if (cutAt <= 0) break; // no safe cut point without splitting a word
    const piece = remaining.slice(0, cutAt).trim();
    if (piece.length === 0) break;
    messages.push(piece);
    remaining = remaining.slice(cutAt).trim();
  }

  if (remaining.length > 0) messages.push(remaining);
  return messages;
}
