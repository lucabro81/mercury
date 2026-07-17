/**
 * Thin glue turning an embedding model into the `(text) => Promise<number[]>`
 * shape `episodic-store.ts`'s `storeEpisodicSummary` expects. Same "not
 * worth mocking deeply" reasoning as `session/summarizer.ts` — one line
 * of glue around the AI SDK's `embed`, no dedicated test file.
 */
import { embed, type EmbeddingModel } from "ai";

/** Returns a function that embeds a string using `model`. */
export function createEmbedder(model: EmbeddingModel): (text: string) => Promise<number[]> {
  return async (text) => {
    const { embedding } = await embed({ model, value: text });
    return embedding;
  };
}
