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

/**
 * Closed vocabulary — the model can only ever return one of these exact
 * values, never invent a new key for the same concept. Deliberately
 * excludes identity/name: a registered Chat app's own `MESSAGE` event
 * already carries the sender's `displayName` directly, so a semantic
 * fact about "who the user is" would only duplicate or contradict that
 * more authoritative source, never add anything — observed live as the
 * `name`/`user-name` duplicate before this fix.
 */
export const SEMANTIC_FACT_TOPICS = ["team", "role", "preferred-language", "tools-used"] as const;
export const SemanticFactSchema = z.object({ topic: z.enum(SEMANTIC_FACT_TOPICS), value: z.string() });
export type SemanticFact = z.infer<typeof SemanticFactSchema>;

type GenerateObjectFn = (params: {
  model: LanguageModel;
  output: "array";
  schema: typeof SemanticFactSchema;
  system: string;
  prompt: string;
}) => Promise<{ object: SemanticFact[] }>;

const SYSTEM_PROMPT =
  "Estrai fatti stabili e ricorrenti sull'utente da questa conversazione, scegliendo il topic " +
  'esclusivamente tra questi quattro: "team", "role" (ruolo), "preferred-language" (lingua ' +
  'preferita), "tools-used" (strumenti usati). Ogni fatto è una coppia {topic, value}: "value" è ' +
  "quanto dichiarato o chiaramente implicato per quel topic. Non estrarre l'identità o il nome " +
  "dell'utente — Mercury lo traccia già separatamente, non va incluso qui. Non estrarre dettagli " +
  "specifici di un singolo task, validi solo per questa sessione — solo cose plausibilmente vere " +
  "anche in futuro. Restituisci un array vuoto se non c'è nulla che qualifica tra i topic ammessi.";

// index.ts prepends this to every user message before it reaches history,
// so the model knows who it's talking to within a turn — bookkeeping
// Mercury wrote itself, never something the user said. Left in, the
// extractor mistakes the marker repeating in every turn for a "stable,
// recurring fact" (this is exactly how the live name/user-name duplicate
// happened): stripped here, only in this extractor, before the messages
// are joined into the prompt.
const SENDER_MARKER_RE = /^\[Da: [^\]]*\]\n/;

/** Returns a function that extracts standing {topic, value} facts from a closed session's messages. */
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
      prompt: messages.map((m) => `${m.role}: ${m.content.replace(SENDER_MARKER_RE, "")}`).join("\n"),
    });
    return object;
  };
}
