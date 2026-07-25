/**
 * Detects, within a single turn's steps, a `runCommand` call that failed
 * followed later by one for the same binary that succeeded — a candidate
 * procedural correction, distinct from `semantic-fact-extractor.ts` (which
 * is about the user, from `session.messages`) — this is about a *tool*,
 * from the tool-call trace (`StepInfo`), true for whoever uses that
 * command next, not just this user. Pairing is deterministic (pure
 * string/status matching); describing *what* the correction actually was
 * is delegated to the model, same `generateObject`-with-fixed-schema style
 * as `semantic-fact-extractor.ts`.
 *
 * Wired per-turn (`onStepFinish`, see `index.ts`), not from
 * `idle-session-cron.ts`'s idle sweep: the tool-call trace for a turn only
 * exists in memory for the duration of that turn (`tool-log-buffer.ts` is a
 * 200-entry ring buffer shared across every session — not a reliable place
 * to reconstruct one turn's trace minutes or hours later).
 */
import { generateObject, type LanguageModel } from "ai";
import { z } from "zod";
import { parseCommand } from "../tools/command-parser.ts";
import type { StepInfo } from "./agent-turn.ts";

export const ProceduralCorrectionCandidateSchema = z.object({ topic: z.string(), value: z.string() });
export type ProceduralCorrection = { tool: string; topic: string; value: string };

type GenerateObjectFn = (params: {
  model: LanguageModel;
  output: "array";
  schema: typeof ProceduralCorrectionCandidateSchema;
  system: string;
  prompt: string;
}) => Promise<{ object: z.infer<typeof ProceduralCorrectionCandidateSchema>[] }>;

const SYSTEM_PROMPT =
  "Ti viene mostrato un tentativo di comando fallito e uno, per lo stesso strumento, andato a buon " +
  "fine più tardi nello stesso turno di conversazione. Descrivi la correzione appresa come una coppia " +
  '{topic, value}: "topic" è una chiave breve e stabile per questa specifica correzione (es. ' +
  '"select-prefix", "assignee-operator"), "value" è la regola pratica da ricordare, in una frase, utile ' +
  "per chiunque userà questo comando in futuro — non solo per chi l'ha scoperta ora. Se il secondo " +
  "tentativo non è davvero una correzione dell'errore del primo (es. l'utente ha semplicemente cambiato " +
  "richiesta), restituisci un array vuoto.";

/** Same normalization `semantic-fact-extractor.ts` used to apply to identity/preference topics — still needed here since this topic is free text, not a closed enum (procedural corrections are open-ended by nature). */
function normalizeTopic(topic: string): string {
  return topic
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");
}

type Attempt = { command: string; binary: string; ok: boolean; error?: string };

function extractAttempts(steps: StepInfo[]): Attempt[] {
  const attempts: Attempt[] = [];
  for (const stepInfo of steps) {
    for (const call of stepInfo.toolCalls) {
      if (call.toolName !== "runCommand") continue;
      const input = call.input as { command?: unknown };
      if (typeof input.command !== "string") continue;
      const parsed = parseCommand(input.command);
      if (!parsed.ok) continue;

      const result = stepInfo.toolResults.find((r) => r.toolCallId === call.toolCallId);
      const output = result?.output as { ok?: unknown; error?: unknown } | undefined;
      if (!output) continue; // no result to learn from (e.g. malformed-args tool-error, not a CLI failure)

      attempts.push({
        command: input.command,
        binary: parsed.binary,
        ok: output.ok === true,
        error: typeof output.error === "string" ? output.error : undefined,
      });
    }
  }
  return attempts;
}

/** Each failed attempt paired with the first later attempt for the same binary that succeeded — never the reverse, and never across different binaries. */
function findCorrectionPairs(attempts: Attempt[]): Array<{ failed: Attempt; corrected: Attempt }> {
  const pairs: Array<{ failed: Attempt; corrected: Attempt }> = [];
  for (let i = 0; i < attempts.length; i++) {
    const failed = attempts[i];
    if (!failed || failed.ok) continue;
    const corrected = attempts.slice(i + 1).find((a) => a.binary === failed.binary && a.ok);
    if (corrected) {
      pairs.push({ failed, corrected });
    }
  }
  return pairs;
}

/** Returns a function that extracts candidate procedural corrections from a single turn's steps. */
export function createToolCorrectionExtractor(
  model: LanguageModel,
  generateObjectFn: GenerateObjectFn = generateObject as unknown as GenerateObjectFn,
  deps?: { log?: (msg: string) => void },
): (steps: StepInfo[]) => Promise<ProceduralCorrection[]> {
  const log = deps?.log ?? ((msg: string) => console.error(msg));

  return async (steps) => {
    const pairs = findCorrectionPairs(extractAttempts(steps));
    const corrections: ProceduralCorrection[] = [];

    for (const { failed, corrected } of pairs) {
      try {
        const { object } = await generateObjectFn({
          model,
          output: "array",
          schema: ProceduralCorrectionCandidateSchema,
          system: SYSTEM_PROMPT,
          prompt:
            `Comando fallito: ${failed.command}\n` +
            `Errore: ${failed.error ?? "(nessun messaggio)"}\n` +
            `Comando corretto (riuscito): ${corrected.command}`,
        });
        for (const candidate of object) {
          corrections.push({ tool: failed.binary, topic: normalizeTopic(candidate.topic), value: candidate.value });
        }
      } catch (err) {
        log(`procedural correction extraction failed for ${failed.binary}: ${String(err)}`);
      }
    }

    return corrections;
  };
}
