/**
 * The "stage" side of the confirm-required flow, as a core-owned closure handed
 * to whoever needs to defer an irreversible action (today the CLI tool; a
 * future memory-deleting plugin all the same). It mints the confirmation token,
 * stashes the opaque action in the `ConfirmationStore`, and writes the "pending"
 * paper-trail note — so the caller never touches the store internals or the
 * wiki, and the confirmation subsystem stays the one place that knows an action
 * is confirmable. The "resolve" side (running the staged thunk once the token
 * comes back) is `tryConfirm` in `confirm-flow.ts`.
 *
 * Bound per session (sessionKey/userId/vaultPath) at the composition root, so
 * the returned function takes only the action itself. The note lives outside
 * inferred/users/<userId>/ — see `writeConfirmationNote`'s own doc comment for
 * why — and its write is best-effort: a failure is logged, never thrown, so it
 * can't stop the user from seeing and confirming the action.
 */
import type { ConfirmationStore } from "./confirmation-store.ts";
import { writeConfirmationNote } from "../wiki/wiki-note.ts";

/** Stages an opaque action for later confirmation and returns its token. The
 * action is a `run` thunk plus a `describe` string (the command/summary text
 * for the paper trail and the channel's confirmation UI). */
export type StageConfirmation = (action: {
  run: () => Promise<{ ok: true; data: unknown } | { ok: false; error: string }>;
  describe: string;
}) => Promise<string>;

export function createStageConfirmation(deps: {
  store: ConfirmationStore;
  sessionKey: string;
  /** Where/who the pending confirmation note is written for. */
  userId: string;
  vaultPath: string;
  /** Test seam; defaults to the real `writeConfirmationNote`. */
  writeConfirmationNoteFn?: typeof writeConfirmationNote;
  /** Test seam; defaults to `() => new Date()`. */
  nowFn?: () => Date;
}): StageConfirmation {
  const write = deps.writeConfirmationNoteFn ?? writeConfirmationNote;
  const nowFn = deps.nowFn ?? (() => new Date());

  return async (action) => {
    const requestedAt = nowFn().toISOString();
    const token = deps.store.stage(deps.sessionKey, { run: action.run, describe: action.describe, requestedAt });
    try {
      await write(deps.vaultPath, deps.userId, token, {
        status: "pending",
        requestedAt,
        resolvedAt: null,
        command: action.describe,
      });
    } catch (err) {
      console.error(`[confirmation-staging] failed to write confirmation note: ${String(err)}`);
    }
    return token;
  };
}
