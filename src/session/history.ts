/**
 * Layer 1 conversation memory: a sliding window of raw messages that
 * summarizes itself once it grows too large, instead of growing
 * unbounded across a long conversation.
 *
 * Why it exists: without a bound, a multi-turn conversation eventually
 * overflows the model's context window. This is the only memory layer
 * Mercury has in M1 — Layer 2 (wiki) and Layer 3 (episodic/Qdrant) are
 * later milestones, pure enrichment that the system must work without.
 *
 * Used by: `src/session/agent-turn.ts` (`runTurn`), which appends each
 * turn's user/assistant messages here and reads `getMessages()` to build
 * the prompt for the next generation call. `src/session/summarizer.ts`
 * supplies the `summarize` function injected into `createSessionHistory`.
 */

/** A single turn's worth of conversation content. */
export type Message = { role: "user" | "assistant"; content: string };

/**
 * Character-count threshold (not a real tokenizer count — a `chars/4`
 * estimate is close enough given the wide margin in the model's context
 * budget) above which the raw message history gets summarized and
 * replaced. Exported so tests can construct fixtures that land exactly
 * at, or just past, the boundary.
 */
export const MAX_HISTORY_CHARS = 60_000;

/**
 * Mutable conversation history for a single ongoing conversation
 * (one per channel/space — see `src/index.ts`, never shared across
 * conversations).
 */
export type SessionHistory = {
  /** Appends a user turn, summarizing first if this push crosses the threshold. */
  addUserMessage(content: string): Promise<void>;
  /** Appends an assistant turn, summarizing first if this push crosses the threshold. */
  addAssistantMessage(content: string): Promise<void>;
  /**
   * The messages to feed into the next model call: the current summary
   * (if one exists, as a synthetic leading message) followed by the raw
   * messages accumulated since the last summarization.
   */
  getMessages(): Message[];
  /**
   * Total character length of what `getMessages()` would currently
   * return — a live read on how close this conversation is to
   * `MAX_HISTORY_CHARS` (and so to triggering summarization). Exposed so
   * a channel can show this to a human, e.g. to tell apart "the model
   * lost track of something" from "the context is actually near full".
   */
  getCharCount(): number;
};

/** Wraps a summary string as the synthetic leading message `getMessages()` prepends. */
function summaryMessage(summary: string): Message {
  return { role: "assistant", content: `Earlier conversation summary: ${summary}` };
}

/**
 * Creates an empty `SessionHistory`.
 *
 * @param summarize - Called with the full raw message batch (including
 *   the message that just crossed the threshold, plus any prior summary
 *   re-injected as a leading message) whenever a single append pushes the
 *   total content length over `MAX_HISTORY_CHARS`. Its return value
 *   becomes the new summary, and the raw message array is cleared — the
 *   threshold check runs after every individual append (not once per
 *   turn), so the crossing point is caught precisely regardless of
 *   whether it's the user or assistant message that tips it over.
 */
export function createSessionHistory(
  summarize: (messages: Message[]) => Promise<string>,
): SessionHistory {
  let rawMessages: Message[] = [];
  let summary: string | null = null;

  async function add(message: Message): Promise<void> {
    rawMessages.push(message);

    const total = rawMessages.reduce((sum, m) => sum + m.content.length, 0);
    if (total > MAX_HISTORY_CHARS) {
      const batch = summary ? [summaryMessage(summary), ...rawMessages] : rawMessages;
      summary = await summarize(batch);
      rawMessages = [];
    }
  }

  function getMessages(): Message[] {
    return summary ? [summaryMessage(summary), ...rawMessages] : [...rawMessages];
  }

  return {
    addUserMessage: (content) => add({ role: "user", content }),
    addAssistantMessage: (content) => add({ role: "assistant", content }),
    getMessages,
    getCharCount: () => getMessages().reduce((sum, m) => sum + m.content.length, 0),
  };
}
