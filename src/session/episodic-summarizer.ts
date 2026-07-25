/**
 * Thin glue turning a closed session's messages into the episodic
 * summary written to Qdrant (see `src/memory/episodic-store.ts`) — a
 * factual account of what happened, not an interpretation. Distinct from
 * `summarizer.ts` (Layer 1): that one condenses history to keep the
 * *next* turn's prompt small, preserving whatever helps continue the
 * same conversation; this one produces a standalone record of a
 * *finished* conversation, and must not infer patterns or preferences
 * (that inference is a separate, deterministic consolidation step,
 * not this LLM call's job).
 *
 * Deliberately never asks the model for a date: it has no reliable notion
 * of "today" and would invent one (observed live: dates from the wrong
 * year, hedged with "replace with current date if applicable"). The
 * entry's own `timestamp` field (computed by the caller,
 * `idle-session-cron.ts`) is the one and only source of truth for "when" —
 * never duplicated into this text, mechanically or otherwise.
 *
 * Same "not worth mocking deeply" reasoning as `summarizer.ts` — no
 * dedicated test file, it's one line of glue around `generateText`.
 */
import { generateText, type LanguageModel } from "ai";
import type { Message } from "./history.ts";

/** Returns a function that summarizes a closed session's messages into a factual account. */
export function createEpisodicSummarizer(
  model: LanguageModel,
): (messages: Message[]) => Promise<string> {
  return async (messages) => {
    const { text } = await generateText({
      model,
      system:
        "Summarize what happened in this conversation as a short, factual account for future recall — what was discussed, asked, or decided. Describe only what occurred in this session. Do not infer patterns, habits, or preferences about the user — that is a separate process, not this one. Never mention or guess a date — you don't reliably know the current date, and it's tracked separately from this text.",
      prompt: messages.map((m) => `${m.role}: ${m.content}`).join("\n"),
    });
    return text;
  };
}
