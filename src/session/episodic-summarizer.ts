/**
 * Thin glue turning a closed session's messages into the episodic
 * summary written to Qdrant (see `src/memory/episodic-store.ts`) — a
 * dated account of what happened, not an interpretation. Distinct from
 * `summarizer.ts` (Layer 1): that one condenses history to keep the
 * *next* turn's prompt small, preserving whatever helps continue the
 * same conversation; this one produces a standalone record of a
 * *finished* conversation, and must not infer patterns or preferences
 * (that inference is a separate, deterministic consolidation step,
 * not this LLM call's job).
 *
 * Same "not worth mocking deeply" reasoning as `summarizer.ts` — no
 * dedicated test file, it's one line of glue around `generateText`.
 */
import { generateText, type LanguageModel } from "ai";
import type { Message } from "./history.ts";

/** Returns a function that summarizes a closed session's messages into a factual, dated account. */
export function createEpisodicSummarizer(
  model: LanguageModel,
): (messages: Message[]) => Promise<string> {
  return async (messages) => {
    const { text } = await generateText({
      model,
      system:
        "Summarize what happened in this conversation as a short, factual, dated account for future recall — what was discussed, asked, or decided. Describe only what occurred in this session. Do not infer patterns, habits, or preferences about the user — that is a separate process, not this one.",
      prompt: messages.map((m) => `${m.role}: ${m.content}`).join("\n"),
    });
    return text;
  };
}
