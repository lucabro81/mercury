/**
 * Deterministic text interception for the "confirm" half of the
 * confirm-required flow (`cli-tool.ts`'s confirm-required branch stages
 * the command and hands the model a token — see there for the "propose"
 * half). `tryConfirm` is called from each channel BEFORE the model ever
 * sees the message, same pattern as `/dump` (`tool-log.ts`) and `NO_REPLY`
 * — running a previously-approved mutation must never depend on the
 * model's own tool-calling judgment.
 */
import { isTokenShaped, type ConfirmationStore } from "../tools/confirmation-store.ts";
import type { runCli } from "../tools/cli-executor.ts";
import type { writeSuppressionNote, writeConfirmationNote } from "../wiki/wiki-note.ts";
import type { EpisodicSummary } from "../memory/episodic-store.ts";

/**
 * Returns `null` if `input` doesn't look like a bare confirmation token —
 * the caller should proceed with its normal flow (`runTurn`, etc.).
 * Otherwise always returns a user-facing string, resolved without ever
 * invoking the model: an unknown/expired/wrong-session token gets a
 * canned message, a valid one actually executes the staged action and
 * reports the outcome. No `conferma ` keyword to type or match — the
 * real gate was always `store.take()`'s existence/session/expiry check,
 * not that prefix (see `isTokenShaped`'s own doc comment). A card button
 * click on Google Chat and a bare token typed on the terminal both resolve
 * through this exact same path.
 *
 * The suppress-notification branch writes two things on confirm, not
 * one: `writeSuppressionNoteFn` is the hard, deterministic gate a cron
 * check reads before re-notifying (never an LLM judgment call);
 * `recordSuppressionEventFn` is a soft episodic signal (the same
 * `storeEpisodicSummary` history a notification-composing LLM call can
 * read back later) that lets Mercury notice a pattern and *propose*
 * something broader — never decide it alone.
 */
export async function tryConfirm(
  input: string,
  sessionKey: string,
  deps: {
    store: ConfirmationStore;
    runCliFn: typeof runCli;
    userId: string;
    vaultPath: string;
    writeSuppressionNoteFn: typeof writeSuppressionNote;
    recordSuppressionEventFn: (entry: EpisodicSummary) => Promise<void>;
    writeConfirmationNoteFn: typeof writeConfirmationNote;
    now?: () => Date;
  },
): Promise<string | null> {
  const token = input.trim();
  if (!isTokenShaped(token)) {
    return null;
  }

  const staged = deps.store.take(sessionKey, token);
  if (!staged) {
    return "Nessuna conferma in sospeso per questo token — potrebbe essere scaduta, già usata, o mai esistita.";
  }

  if (staged.kind === "suppress-notification") {
    const timestamp = (deps.now?.() ?? new Date()).toISOString();
    await deps.writeSuppressionNoteFn(deps.vaultPath, staged.checkType, staged.itemKey, { confirmedAt: timestamp });
    await deps.recordSuppressionEventFn({
      userId: deps.userId,
      sessionKey,
      summary: `L'utente ha chiesto di non essere più notificato per "${staged.itemKey}" (${staged.checkType}).`,
      timestamp,
    });
    return `Confermato: non ti segnalerò più "${staged.itemKey}".`;
  }

  const result = await deps.runCliFn(staged.binary, staged.args);
  const resolvedAt = (deps.now?.() ?? new Date()).toISOString();
  // Overwrites the same note the propose half wrote (writeConfirmationNoteFn
  // in cli-tool.ts) so the persistent record reflects what actually
  // happened, never stuck saying "pending" — see the stale-primer bug this
  // guards against. Same resilience tradeoff as the propose side: a
  // wiki-write failure must not stop the user from getting their result.
  try {
    await deps.writeConfirmationNoteFn(deps.vaultPath, deps.userId, token, {
      status: result.ok ? "confirmed" : "failed",
      requestedAt: staged.requestedAt ?? resolvedAt,
      resolvedAt,
      command: [staged.binary, ...staged.args].join(" "),
    });
  } catch (err) {
    console.error(`[confirm-flow] failed to write confirmation note: ${String(err)}`);
  }
  if (!result.ok) {
    return `Confermato, ma l'esecuzione è fallita: ${result.error}`;
  }
  return `Confermato ed eseguito: ${JSON.stringify(result.data)}`;
}
