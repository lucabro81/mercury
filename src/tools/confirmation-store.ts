/**
 * In-memory staging area for an action that needs explicit confirmation
 * before it executes: a CLI command that matched a `confirm:true` prefix
 * (see `matchCommand` in `cli-tool.ts`), or a request to stop notifying
 * about a specific item. Either way the model stages it here
 * and relays the returned token to the user, who must reply
 * `conferma <token>` on the same channel/session before anything actually
 * happens (see `confirm-flow.ts`). Scoped by `sessionKey` so a token
 * proposed to one session (terminal, or a given Google Chat space+sender)
 * can't be confirmed by another.
 *
 * One store, one token namespace, one `conferma <token>` command surface
 * for both kinds — `take()` returns the tagged union, the caller branches
 * on `kind` only once it's time to actually execute. A second parallel
 * store per action kind would mean `confirm-flow.ts` searching multiple
 * stores for the same token, for no benefit.
 */
export type StagedAction =
  | { kind: "cli"; binary: string; args: string[] }
  | { kind: "suppress-notification"; checkType: string; itemKey: string };

export type ConfirmationStore = {
  /** Stages `action` for `sessionKey` and returns a fresh token. */
  stage(sessionKey: string, action: StagedAction): string;
  /** Consumes and returns the staged action for `sessionKey`/`token`, or
   * `null` if it doesn't exist, belongs to a different session, or has
   * expired. Always one-shot: a successful take removes the entry. */
  take(sessionKey: string, token: string): StagedAction | null;
};

const TOKEN_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"; // excludes 0/O, 1/l/I
const TOKEN_LENGTH = 6;
const DEFAULT_TTL_MS = 5 * 60_000;

function defaultTokenFn(): string {
  const bytes = new Uint8Array(TOKEN_LENGTH);
  crypto.getRandomValues(bytes);
  let token = "";
  for (const b of bytes) {
    token += TOKEN_ALPHABET[b % TOKEN_ALPHABET.length];
  }
  return token;
}

type Entry = { action: StagedAction; sessionKey: string; expiresAt: number };

export function createConfirmationStore(
  opts: { now?: () => number; ttlMs?: number; tokenFn?: () => string } = {},
): ConfirmationStore {
  const now = opts.now ?? (() => Date.now());
  const ttlMs = opts.ttlMs ?? DEFAULT_TTL_MS;
  const tokenFn = opts.tokenFn ?? defaultTokenFn;
  const entries = new Map<string, Entry>();

  return {
    stage(sessionKey, action) {
      const token = tokenFn();
      entries.set(token, { sessionKey, action, expiresAt: now() + ttlMs });
      return token;
    },
    take(sessionKey, token) {
      const entry = entries.get(token);
      if (!entry) {
        return null;
      }
      if (entry.expiresAt <= now()) {
        entries.delete(token);
        return null;
      }
      if (entry.sessionKey !== sessionKey) {
        return null;
      }
      entries.delete(token);
      return entry.action;
    },
  };
}

const CONFIRM_COMMAND_RE = /^\s*conferma\s+(\S+)\s*$/i;

/** Recognizes a `conferma <token>` command: keyword case-insensitive,
 * token preserved exactly as typed. Returns `null` for anything else,
 * including extra trailing text after the token. */
export function parseConfirmCommand(input: string): string | null {
  const match = CONFIRM_COMMAND_RE.exec(input);
  return match ? (match[1] as string) : null;
}
