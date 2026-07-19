/**
 * Deterministic text interception for the "confirm" half of the
 * confirm-required flow (`cli-tool.ts`'s confirm-required branch stages
 * the command and hands the model a token — see there for the "propose"
 * half). `tryConfirm` is called from each channel BEFORE the model ever
 * sees the message, same pattern as `/dump` (`tool-log.ts`) and `NO_REPLY`
 * — running a previously-approved mutation must never depend on the
 * model's own tool-calling judgment.
 */
import { parseConfirmCommand, type ConfirmationStore } from "../tools/confirmation-store.ts";
import type { runCli } from "../tools/cli-executor.ts";

/**
 * Returns `null` if `input` isn't a `conferma <token>` command — the
 * caller should proceed with its normal flow (`runTurn`, etc.). Otherwise
 * always returns a user-facing string, resolved without ever invoking the
 * model: an unknown/expired/wrong-session token gets a canned message, a
 * valid one actually runs the staged command and reports the outcome.
 */
export async function tryConfirm(
  input: string,
  sessionKey: string,
  deps: { store: ConfirmationStore; runCliFn: typeof runCli },
): Promise<string | null> {
  const token = parseConfirmCommand(input);
  if (!token) {
    return null;
  }

  const staged = deps.store.take(sessionKey, token);
  if (!staged) {
    return "Nessuna conferma in sospeso per questo token — potrebbe essere scaduta, già usata, o mai esistita.";
  }

  const result = await deps.runCliFn(staged.binary, staged.args);
  if (!result.ok) {
    return `Confermato, ma l'esecuzione è fallita: ${result.error}`;
  }
  return `Confermato ed eseguito: ${JSON.stringify(result.data)}`;
}
