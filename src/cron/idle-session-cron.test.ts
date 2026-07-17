import { describe, it, expect } from "bun:test";
import { createIdleSessionScanner } from "./idle-session-scanner.ts";
import { runIdleSessionSweep, startIdleSessionCron } from "./idle-session-cron.ts";
import type { Message } from "../session/history.ts";
import type { EpisodicSummary } from "../memory/episodic-store.ts";

const NOW = 1_000_000_000;
const TIMEOUT = 30 * 60_000;

describe("runIdleSessionSweep", () => {
  it("summarizes, stores, and closes each idle session, then clears it from the scanner", async () => {
    const scanner = createIdleSessionScanner();
    scanner.touch("spaces/X:users/1", NOW - TIMEOUT);

    const messages: Message[] = [{ role: "user", content: "hi" }];
    let storedEntry: EpisodicSummary | undefined;
    let closedKey: string | undefined;

    await runIdleSessionSweep(scanner, NOW, TIMEOUT, {
      getSession: (key) => ({ key, userId: "users/1", messages }),
      summarize: async (msgs) => {
        expect(msgs).toBe(messages);
        return "user said hi";
      },
      store: async (entry) => {
        storedEntry = entry;
      },
      closeSession: (key) => {
        closedKey = key;
      },
    });

    expect(storedEntry).toEqual({
      userId: "users/1",
      sessionKey: "spaces/X:users/1",
      summary: "user said hi",
      timestamp: new Date(NOW).toISOString(),
    });
    expect(closedKey).toBe("spaces/X:users/1");
    expect(scanner.scanIdle(NOW, TIMEOUT)).toEqual([]);
  });

  it("does nothing for sessions that aren't idle yet", async () => {
    const scanner = createIdleSessionScanner();
    scanner.touch("spaces/X:users/1", NOW - TIMEOUT + 60_000); // 1 min short of the timeout

    let summarizeCalls = 0;
    await runIdleSessionSweep(scanner, NOW, TIMEOUT, {
      getSession: () => ({ key: "spaces/X:users/1", userId: "users/1", messages: [] }),
      summarize: async () => {
        summarizeCalls++;
        return "";
      },
      store: async () => {},
      closeSession: () => {},
    });

    expect(summarizeCalls).toBe(0);
  });

  it("clears tracking without summarizing/storing when the session no longer exists", async () => {
    const scanner = createIdleSessionScanner();
    scanner.touch("gone", NOW - TIMEOUT);

    let summarizeCalls = 0;
    let storeCalls = 0;
    await runIdleSessionSweep(scanner, NOW, TIMEOUT, {
      getSession: () => undefined,
      summarize: async () => {
        summarizeCalls++;
        return "";
      },
      store: async () => {
        storeCalls++;
      },
      closeSession: () => {},
    });

    expect(summarizeCalls).toBe(0);
    expect(storeCalls).toBe(0);
    expect(scanner.scanIdle(NOW, TIMEOUT)).toEqual([]);
  });

  // Hard-won convention (CLAUDE.md): one bad tick must never take down the
  // rest of Mercury. A failure summarizing/storing one idle session must
  // not stop other idle sessions in the same sweep from being processed,
  // and must not silently clear the failed session's tracking (so it's
  // retried on the next sweep instead of being lost).
  it("a failure for one session doesn't stop the sweep from processing the others, and leaves the failed one tracked for retry", async () => {
    const scanner = createIdleSessionScanner();
    scanner.touch("bad", NOW - TIMEOUT);
    scanner.touch("good", NOW - TIMEOUT);

    const closedKeys: string[] = [];
    const loggedMessages: string[] = [];

    await runIdleSessionSweep(scanner, NOW, TIMEOUT, {
      getSession: (key) => ({ key, userId: "users/1", messages: [] }),
      summarize: async (_msgs) => {
        return "ok";
      },
      store: async (entry) => {
        if (entry.sessionKey === "bad") {
          throw new Error("qdrant unreachable");
        }
      },
      closeSession: (key) => {
        closedKeys.push(key);
      },
      log: (msg) => loggedMessages.push(msg),
    });

    expect(closedKeys).toEqual(["good"]);
    expect(scanner.scanIdle(NOW, TIMEOUT)).toEqual(["bad"]); // still tracked, will retry
    expect(loggedMessages.some((m) => m.includes("bad") && m.includes("qdrant unreachable"))).toBe(true);
  });
});

describe("startIdleSessionCron", () => {
  it("runs a sweep on each tick and stop() halts further ticks", async () => {
    const scanner = createIdleSessionScanner();
    scanner.touch("spaces/X:users/1", 0);
    // Re-touches independently of the sweep's own clear-after-close (a
    // re-touch from inside closeSession would just be wiped out by the
    // scanner.clear(key) that runs right after it in the same sweep
    // iteration) — purely so this fixture stays "idle" across multiple
    // real ticks, letting the test observe more than one.
    const retoucher = setInterval(() => scanner.touch("spaces/X:users/1", 0), 5);

    let sweeps = 0;
    const cron = startIdleSessionCron(
      scanner,
      {
        getSession: () => ({ key: "spaces/X:users/1", userId: "users/1", messages: [] }),
        summarize: async () => {
          sweeps++;
          return "s";
        },
        store: async () => {},
        closeSession: () => {},
      },
      { idleTimeoutMs: 0, checkIntervalMs: 10 },
    );

    await new Promise((r) => setTimeout(r, 45));
    cron.stop();
    clearInterval(retoucher);
    const sweepsAtStop = sweeps;
    await new Promise((r) => setTimeout(r, 30));

    expect(sweepsAtStop).toBeGreaterThan(1);
    expect(sweeps).toBe(sweepsAtStop); // no further ticks after stop
  });
});
