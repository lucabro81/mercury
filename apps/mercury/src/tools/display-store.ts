/**
 * In-memory staging area for the user-facing `display` artifacts a tool
 * produces (see `ToolDisplay` and the formatter decorator), decoupling
 * *producing* an artifact from *showing* it. A tool `stash`es its already-
 * rendered artifact here and gets back a short `ref`; the model, and only
 * the model, decides whether to actually surface it by calling the
 * `present` tool (see `present-tool.ts`), which marks the ref via
 * `surface`. At finalize the turn runner appends only what
 * `takeSurfaced` returns — the artifacts the model explicitly asked to
 * show — never the whole set unconditionally. The worst case becomes
 * omission (the user says "show me"), never a garbled or force-appended
 * list.
 *
 * Scoped by `sessionKey`, exactly like `confirmation-store.ts`: a ref
 * minted for one session (terminal, or a given Google Chat space+sender)
 * can't be surfaced by another. The store is created once and shared
 * across turns, so a ref stays valid (until its TTL) for a later
 * "show me that list again" follow-up — session-scoped, not turn-scoped.
 */
export type DisplayStore = {
  /** Stashes `artifact` for `sessionKey` and returns a fresh ref. */
  stash(sessionKey: string, artifact: string): string;
  /** Marks `ref` to be shown at finalize. Returns `false` if it doesn't
   * exist, belongs to a different session, or has expired. */
  surface(sessionKey: string, ref: string): boolean;
  /** The artifacts surfaced for `sessionKey`, in stash order. Consumes the
   * surfaced flag (so the same artifact isn't re-appended on a later turn
   * unless `surface` is called again) but keeps the entry until its TTL,
   * so a still-valid ref can be surfaced again across turns. */
  takeSurfaced(sessionKey: string): string[];
};

const DEFAULT_TTL_MS = 5 * 60_000;

type Entry = { sessionKey: string; artifact: string; surfaced: boolean; expiresAt: number };

export function createDisplayStore(
  opts: { now?: () => number; ttlMs?: number; refFn?: () => string } = {},
): DisplayStore {
  const now = opts.now ?? (() => Date.now());
  const ttlMs = opts.ttlMs ?? DEFAULT_TTL_MS;
  let counter = 0;
  const refFn = opts.refFn ?? (() => `d${++counter}`);
  // Insertion-ordered (Map preserves it) so takeSurfaced returns artifacts
  // in stash order regardless of the order the model surfaced them in.
  const entries = new Map<string, Entry>();

  return {
    stash(sessionKey, artifact) {
      const ref = refFn();
      entries.set(ref, { sessionKey, artifact, surfaced: false, expiresAt: now() + ttlMs });
      return ref;
    },
    surface(sessionKey, ref) {
      const entry = entries.get(ref);
      if (!entry) {
        return false;
      }
      if (entry.expiresAt <= now()) {
        entries.delete(ref);
        return false;
      }
      if (entry.sessionKey !== sessionKey) {
        return false;
      }
      entry.surfaced = true;
      return true;
    },
    takeSurfaced(sessionKey) {
      const t = now();
      const out: string[] = [];
      for (const entry of entries.values()) {
        if (entry.expiresAt <= t) continue;
        if (entry.sessionKey !== sessionKey) continue;
        if (!entry.surfaced) continue;
        out.push(entry.artifact);
        entry.surfaced = false;
      }
      return out;
    },
  };
}
