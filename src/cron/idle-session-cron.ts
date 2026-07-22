/**
 * The session-persistence cron loop: periodically sweeps for sessions idle past the
 * configured timeout, summarizes each one (episodic-summarizer.ts),
 * writes the result to Qdrant (episodic-store.ts), and discards the raw
 * transcript (`deps.closeSession`). Every dependency is injected — this
 * file owns only the sweep/interval mechanics, not session storage, the
 * LLM call, or Qdrant itself.
 */
import type { IdleSessionScanner } from "./idle-session-scanner.ts";
import type { Message } from "../session/history.ts";
import type { EpisodicSummary } from "../memory/episodic-store.ts";
import type { SemanticFact } from "../session/semantic-fact-extractor.ts";
import type { SemanticFactEntry } from "../memory/semantic-facts-store.ts";

export type IdleSession = { key: string; userId: string; messages: Message[] };

export type IdleSessionSweepDeps = {
  /** Looks up a session's current content by key; `undefined` if it's already gone (e.g. closed by something else in the meantime). */
  getSession: (key: string) => IdleSession | undefined;
  summarize: (messages: Message[]) => Promise<string>;
  store: (entry: EpisodicSummary) => Promise<void>;
  /** Discards the session's raw transcript — called only after a successful summarize+store. */
  closeSession: (key: string) => void;
  /**
   * Semantic fact extraction/consolidation (D-22/D-34) — an enrichment on
   * top of the episodic summary above, not a required part of it: omit
   * all three and the sweep behaves exactly as before. When present, a
   * failure here is logged and never blocks `closeSession` — the
   * episodic write already succeeded and is the source of truth being
   * preserved, same "system must work when this enrichment is absent"
   * boundary as every other Layer 2/3 store in Mercury.
   */
  extractFacts?: (messages: Message[]) => Promise<SemanticFact[]>;
  storeFact?: (entry: SemanticFactEntry) => Promise<void>;
  consolidateFact?: (userId: string, topic: string) => Promise<void>;
  log?: (msg: string) => void;
};

/**
 * Runs one sweep at `now`: every session `scanner` reports idle (past
 * `idleTimeoutMs`) gets summarized, stored, and closed, then cleared from
 * `scanner`. A failure summarizing or storing the episodic entry is
 * logged and leaves that session's tracking untouched (retried on the
 * next sweep) — it must never stop the sweep from processing the others
 * (hard-won convention: one bad tick can't take down the rest of
 * Mercury). Semantic fact extraction/consolidation, when wired, runs
 * after a successful episodic store but never blocks `closeSession` on
 * its own failure — see `IdleSessionSweepDeps`.
 */
export async function runIdleSessionSweep(
  scanner: IdleSessionScanner,
  now: number,
  idleTimeoutMs: number,
  deps: IdleSessionSweepDeps,
): Promise<void> {
  const log = deps.log ?? ((msg: string) => console.error(msg));

  for (const key of scanner.scanIdle(now, idleTimeoutMs)) {
    try {
      const session = deps.getSession(key);
      if (!session) {
        scanner.clear(key);
        continue;
      }

      const summary = await deps.summarize(session.messages);
      await deps.store({
        userId: session.userId,
        sessionKey: key,
        summary,
        timestamp: new Date(now).toISOString(),
      });

      if (deps.extractFacts && deps.storeFact && deps.consolidateFact) {
        try {
          const facts = await deps.extractFacts(session.messages);
          for (const fact of facts) {
            try {
              await deps.storeFact({
                userId: session.userId,
                topic: fact.topic,
                value: fact.value,
                timestamp: new Date(now).toISOString(),
              });
              await deps.consolidateFact(session.userId, fact.topic);
            } catch (err) {
              log(`semantic fact consolidation failed for ${key}/${fact.topic}: ${String(err)}`);
            }
          }
        } catch (err) {
          log(`semantic fact extraction failed for ${key}: ${String(err)}`);
        }
      }

      deps.closeSession(key);
      scanner.clear(key);
    } catch (err) {
      log(`idle session sweep failed for ${key}: ${String(err)}`);
    }
  }
}

export type IdleSessionCron = { stop: () => void };

/** Starts the periodic sweep on `opts.checkIntervalMs`, gated on `opts.idleTimeoutMs`. `stop()` halts it. */
export function startIdleSessionCron(
  scanner: IdleSessionScanner,
  deps: IdleSessionSweepDeps,
  opts: { idleTimeoutMs: number; checkIntervalMs: number },
): IdleSessionCron {
  const interval = setInterval(() => {
    runIdleSessionSweep(scanner, Date.now(), opts.idleTimeoutMs, deps).catch((err) => {
      (deps.log ?? ((msg: string) => console.error(msg)))(`idle session cron tick failed: ${String(err)}`);
    });
  }, opts.checkIntervalMs);

  return {
    stop: () => clearInterval(interval),
  };
}
