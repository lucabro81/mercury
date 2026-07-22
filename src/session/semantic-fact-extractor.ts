/**
 * Turns a closed session's messages into structured `{topic, value}`
 * facts for the semantic consolidation engine (see
 * `src/memory/semantic-facts-store.ts`) — distinct from
 * `episodic-summarizer.ts`, which produces a prose account of the whole
 * session. A single extracted fact here is a candidate, not yet a
 * standing belief about the user: consolidation (a separate,
 * deterministic step) decides whether repeated facts on the same topic
 * are frequent enough to be promoted to a wiki note.
 */
import { generateObject, type LanguageModel } from "ai";
import { z } from "zod";
import type { Message } from "./history.ts";

export const SemanticFactSchema = z.object({ topic: z.string(), value: z.string() });
export type SemanticFact = z.infer<typeof SemanticFactSchema>;

type GenerateObjectFn = (params: {
  model: LanguageModel;
  output: "array";
  schema: typeof SemanticFactSchema;
  system: string;
  prompt: string;
}) => Promise<{ object: SemanticFact[] }>;

const SYSTEM_PROMPT =
  "Estrai fatti stabili e ricorrenti sull'utente da questa conversazione — preferenze, contesto " +
  "che resta valido nel tempo (es. ruolo, team, strumenti usati, lingua preferita). Ogni fatto è " +
  'una coppia {topic, value}: "topic" è una chiave breve e stabile (es. "preferred-language", "team"), ' +
  '"value" è quanto dichiarato o chiaramente implicato. Non estrarre dettagli specifici di un singolo ' +
  "task, validi solo per questa sessione — solo cose plausibilmente vere anche in futuro. Restituisci " +
  "un array vuoto se non c'è nulla che qualifica.";

/** Lowercases, trims, and collapses whitespace/underscore runs into single hyphens — keeps topics comparable across LLM calls that may otherwise format the same concept differently. */
export function normalizeTopic(topic: string): string {
  return topic
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");
}

/** Returns a function that extracts standing {topic, value} facts (topic normalized) from a closed session's messages. */
export function createSemanticFactExtractor(
  model: LanguageModel,
  generateObjectFn: GenerateObjectFn = generateObject as unknown as GenerateObjectFn,
): (messages: Message[]) => Promise<SemanticFact[]> {
  return async (messages) => {
    const { object } = await generateObjectFn({
      model,
      output: "array",
      schema: SemanticFactSchema,
      system: SYSTEM_PROMPT,
      prompt: messages.map((m) => `${m.role}: ${m.content}`).join("\n"),
    });
    return object.map((fact) => ({ topic: normalizeTopic(fact.topic), value: fact.value }));
  };
}
