/**
 * In-memory staging area for an action that needs explicit confirmation
 * before it executes: a CLI command that matched a `confirm:true` prefix
 * (see `matchCommand` in `cli-tool.ts`), or a request to stop notifying
 * about a specific item. Either way the model stages it here, and the
 * channel gets the returned token confirmed back to it — a card button
 * click on Google Chat, a bare token typed on the terminal — before
 * anything actually happens (see `confirm-flow.ts`). Scoped by
 * `sessionKey` so a token proposed to one session (terminal, or a given
 * Google Chat space+sender) can't be confirmed by another.
 *
 * One store, one token namespace, one confirmation surface for both
 * kinds — `take()` returns the tagged union, the caller branches on
 * `kind` only once it's time to actually execute. A second parallel store
 * per action kind would mean `confirm-flow.ts` searching multiple stores
 * for the same token, for no benefit.
 */
export type StagedAction =
  | { kind: "cli"; binary: string; args: string[]; requestedAt?: string }
  | { kind: "suppress-notification"; checkType: string; itemKey: string };

export type ConfirmationStore = {
  /** Stages `action` for `sessionKey` and returns a fresh token. */
  stage(sessionKey: string, action: StagedAction): string;
  /** Consumes and returns the staged action for `sessionKey`/`token`, or
   * `null` if it doesn't exist, belongs to a different session, or has
   * expired. Always one-shot: a successful take removes the entry. */
  take(sessionKey: string, token: string): StagedAction | null;
};

// Full alphanumeric — a token is only ever copy-pasted, never read or
// typed from memory, so legibility (avoiding 0/O/1/l/I) was never the
// actual point. What makes a token distinguishable from ordinary text is
// its shape below (two groups joined by a fixed hyphen), not a restricted
// character set — a restricted set doesn't help anyway: it still collides
// with any real short word that happens to avoid the same few excluded
// characters (found live: "second", used as plain conversational text,
// was indistinguishable from a real token under the old bare-6-char shape).
const TOKEN_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const TOKEN_GROUP_LENGTH = 4;
const DEFAULT_TTL_MS = 5 * 60_000;

function randomGroup(): string {
  const bytes = new Uint8Array(TOKEN_GROUP_LENGTH);
  crypto.getRandomValues(bytes);
  let group = "";
  for (const b of bytes) {
    group += TOKEN_ALPHABET[b % TOKEN_ALPHABET.length];
  }
  return group;
}

/** `<4 alphanumeric>-<4 alphanumeric>`, e.g. `k9m2-x7q4` — see `TOKEN_ALPHABET`'s own doc comment for why this shape, not a restricted character set, is what makes a token distinguishable from ordinary text. */
function defaultTokenFn(): string {
  return `${randomGroup()}-${randomGroup()}`;
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

const TOKEN_SHAPE_RE = new RegExp(`^[${TOKEN_ALPHABET}]{${TOKEN_GROUP_LENGTH}}-[${TOKEN_ALPHABET}]{${TOKEN_GROUP_LENGTH}}$`);

/**
 * True if `input` (trimmed) has the exact shape of a token this store
 * mints — same alphabet, same length. Not a security boundary itself
 * (that's `take()`'s existence/session/expiry check) — just enough to
 * tell apart "this looks like a confirmation attempt" from "this is an
 * ordinary message", so a caller (`tryConfirm` in `confirm-flow.ts`) knows
 * whether to intercept at all before ever touching the store.
 */
export function isTokenShaped(input: string): boolean {
  return TOKEN_SHAPE_RE.test(input.trim());
}
