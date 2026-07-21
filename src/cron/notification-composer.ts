/**
 * D-25: composes the message for a stale-ticket finding — never a fixed
 * template. Reads the same episodic history `searchEpisodicMemory`
 * returns (past "Mercury notified X about Y" events for this user) so
 * the model can personalize tone/frequency itself: first time, direct;
 * already notified several times, it can ease off or ask outright what
 * to do. `generateTextFn` is injectable, same pattern as
 * `self-review-runner.ts` — a fresh, stateless call, no tools, nothing
 * persisted here.
 */
import { generateText, type LanguageModel } from "ai";
import type { EpisodicSummary } from "../memory/episodic-store.ts";

export type StaleTicketFinding = { key: string; summary: string; staleDays: number };

type GenerateTextFn = (params: { model: LanguageModel; system: string; prompt: string }) => Promise<{ text: string }>;

const SYSTEM_PROMPT =
  "Sei Mercury, un agente che avvisa gli assegnatari di ticket Jira rimasti fermi troppo a lungo. " +
  "Scrivi un messaggio breve, diretto e naturale, mai un template fisso. " +
  "Personalizza tono e frequenza in base allo storico delle notifiche già inviate per questo stesso ticket: " +
  "se è la prima volta, sii diretto; se lo hai già segnalato più volte, evita di essere ripetitivo — " +
  "valuta se cambiare approccio o chiedere esplicitamente cosa fare (es. se serve ancora, se va sospesa la notifica).";

function formatHistory(history: EpisodicSummary[]): string {
  if (history.length === 0) {
    return "Nessuna notifica precedente su questo argomento — è la prima volta.";
  }
  return history.map((h) => `- ${h.timestamp}: ${h.summary}`).join("\n");
}

export async function composeStaleTicketMessage(
  finding: StaleTicketFinding,
  history: EpisodicSummary[],
  deps: { model: LanguageModel; generateTextFn?: GenerateTextFn },
): Promise<string> {
  const generate = deps.generateTextFn ?? generateText;
  const prompt =
    `Ticket ${finding.key}: "${finding.summary}", fermo da ${finding.staleDays} giorni.\n\n` +
    `Storia delle notifiche precedenti per questo ticket:\n${formatHistory(history)}\n\n` +
    "Componi il messaggio da mandare all'assegnatario.";

  const { text } = await generate({ model: deps.model, system: SYSTEM_PROMPT, prompt });
  return text;
}
