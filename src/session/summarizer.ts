import { generateText, type LanguageModel } from "ai";
import type { Message } from "./history.ts";

export function createSummarizer(
  model: LanguageModel,
): (messages: Message[]) => Promise<string> {
  return async (messages) => {
    const { text } = await generateText({
      model,
      system:
        "Summarize this conversation concisely, preserving names, ticket keys, and decisions.",
      prompt: messages.map((m) => `${m.role}: ${m.content}`).join("\n"),
    });
    return text;
  };
}
