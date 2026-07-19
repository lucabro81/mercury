/**
 * In-memory staging area for a CLI command that matched a `confirm:true`
 * prefix (see `matchCommand` in `cli-tool.ts`): instead of running it
 * immediately, the model stages it here and relays the returned token to
 * the user, who must reply `conferma <token>` on the same channel/session
 * before it actually executes (see `confirm-flow.ts`). Scoped by
 * `sessionKey` so a token proposed to one session (terminal, or a given
 * Google Chat space+sender) can't be confirmed by another.
 */
export type StagedCommand = { binary: string; args: string[] };

export type ConfirmationStore = {
  /** Stages `binary`/`args` for `sessionKey` and returns a fresh token. */
  stage(sessionKey: string, binary: string, args: string[]): string;
  /** Consumes and returns the staged command for `sessionKey`/`token`, or
   * `null` if it doesn't exist, belongs to a different session, or has
   * expired. Always one-shot: a successful take removes the entry. */
  take(sessionKey: string, token: string): StagedCommand | null;
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

type Entry = StagedCommand & { sessionKey: string; expiresAt: number };

export function createConfirmationStore(
  opts: { now?: () => number; ttlMs?: number; tokenFn?: () => string } = {},
): ConfirmationStore {
  const now = opts.now ?? (() => Date.now());
  const ttlMs = opts.ttlMs ?? DEFAULT_TTL_MS;
  const tokenFn = opts.tokenFn ?? defaultTokenFn;
  const entries = new Map<string, Entry>();

  return {
    stage(sessionKey, binary, args) {
      const token = tokenFn();
      entries.set(token, { sessionKey, binary, args, expiresAt: now() + ttlMs });
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
      return { binary: entry.binary, args: entry.args };
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
