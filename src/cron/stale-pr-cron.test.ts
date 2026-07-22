import { describe, it, expect } from "bun:test";
import { runStalePrSweep, startStalePrCron, type StalePrSweepDeps } from "./stale-pr-cron.ts";
import { DEFAULT_NOTIFICATION_THRESHOLDS_BODY, DEFAULT_PR_STALE_DAYS } from "./notification-config.ts";
import type { StalePrFinding as DetectedStalePr } from "./stale-pr-finder.ts";
import type { EpisodicSummary } from "../memory/episodic-store.ts";
import type { IdentityBridgeResult } from "./identity-bridge.ts";

const MODEL = "fake-model" as never;

function findingsFixture(): DetectedStalePr[] {
  return [
    {
      repository: "comperiosrl/comperio-frontends",
      prId: 237,
      title: "Feature/update docs",
      updatedOn: "2026-07-18T09:00:00.000Z",
      reviewer: { accountId: "rev-1", displayName: "Mario Rossi" },
    },
  ];
}

function baseDeps(overrides: Partial<StalePrSweepDeps> = {}): StalePrSweepDeps {
  return {
    vaultPath: "/vault",
    adminSpace: "spaces/ADMIN",
    model: MODEL,
    runCliFn: async () => ({ ok: true, data: {} }),
    readWikiFileFn: async () => DEFAULT_NOTIFICATION_THRESHOLDS_BODY,
    writeCuratedNoteFn: async () => {},
    findStalePrsFn: async () => findingsFixture(),
    isNotificationSuppressedFn: async () => false,
    resolveChatTargetForBitbucketUserFn: async () =>
      ({ kind: "found", chatUserId: "users/42", displayName: "Mario Rossi" }) satisfies IdentityBridgeResult,
    historyFn: async () => [],
    composeStalePrMessageFn: async () => "messaggio composto",
    getOrCreateDmSpaceFn: async () => ({ name: "spaces/DM1" }),
    sendMessageFn: async () => ({ name: "spaces/DM1/messages/1" }),
    notifyAdminFn: async () => {},
    recordEventFn: async () => {},
    now: () => new Date("2026-07-22T00:00:00Z"),
    ...overrides,
  };
}

describe("runStalePrSweep", () => {
  it("seeds the default config doc and uses its pr_stale_days/pr_repositories when the doc doesn't exist yet", async () => {
    let seededBody: string | undefined;
    let receivedArgs: [string[], number, Date] | undefined;
    const deps = baseDeps({
      readWikiFileFn: async () => {
        throw Object.assign(new Error("ENOENT"), { code: "ENOENT" });
      },
      writeCuratedNoteFn: async (_vaultPath, _relPath, _fields, body) => {
        seededBody = body;
      },
      findStalePrsFn: async (repositories, staleDays, now) => {
        receivedArgs = [repositories, staleDays, now];
        return [];
      },
    });

    await runStalePrSweep(Date.now(), deps);

    expect(seededBody).toBe(DEFAULT_NOTIFICATION_THRESHOLDS_BODY);
    expect(receivedArgs?.[0]).toEqual([]);
    expect(receivedArgs?.[1]).toBe(DEFAULT_PR_STALE_DAYS);
  });

  it("uses the configured pr_stale_days and pr_repositories when the doc already exists", async () => {
    const customBody = [
      "```yaml",
      "stale_ticket_days: 5",
      "pr_stale_days: 7",
      "pr_repositories:",
      "  - comperiosrl/repo-a",
      "  - comperiosrl/repo-b",
      "```",
    ].join("\n");
    let receivedArgs: [string[], number, Date] | undefined;
    const deps = baseDeps({
      readWikiFileFn: async () => customBody,
      findStalePrsFn: async (repositories, staleDays, now) => {
        receivedArgs = [repositories, staleDays, now];
        return [];
      },
    });

    await runStalePrSweep(Date.now(), deps);

    expect(receivedArgs?.[0]).toEqual(["comperiosrl/repo-a", "comperiosrl/repo-b"]);
    expect(receivedArgs?.[1]).toBe(7);
  });

  it("skips a finding that's already suppressed, never touching the identity bridge", async () => {
    let bridgeCalled = false;
    const deps = baseDeps({
      isNotificationSuppressedFn: async (_vaultPath, checkType, itemKey) =>
        checkType === "stale-pr" && itemKey === "comperiosrl/comperio-frontends#237#rev-1",
      resolveChatTargetForBitbucketUserFn: async () => {
        bridgeCalled = true;
        return { kind: "not-found" };
      },
    });

    await runStalePrSweep(Date.now(), deps);

    expect(bridgeCalled).toBe(false);
  });

  it("calls the identity bridge with the reviewer's accountId and displayName", async () => {
    let bridgeArgs: unknown[] | undefined;
    const deps = baseDeps({
      resolveChatTargetForBitbucketUserFn: async (...args) => {
        bridgeArgs = args;
        return { kind: "found", chatUserId: "users/42", displayName: "Mario Rossi" };
      },
    });

    await runStalePrSweep(Date.now(), deps);

    expect(bridgeArgs?.[0]).toEqual({ accountId: "rev-1", displayName: "Mario Rossi" });
  });

  it("does nothing further when the identity bridge returns not-found (it already notified admin itself)", async () => {
    let historyCalled = false;
    let sendCalled = false;
    const deps = baseDeps({
      resolveChatTargetForBitbucketUserFn: async () => ({ kind: "not-found" }),
      historyFn: async () => {
        historyCalled = true;
        return [];
      },
      sendMessageFn: async () => {
        sendCalled = true;
        return { name: "spaces/DM1/messages/1" };
      },
    });

    await runStalePrSweep(Date.now(), deps);

    expect(historyCalled).toBe(false);
    expect(sendCalled).toBe(false);
  });

  it("composes, delivers via DM, and records an episodic event when the identity bridge finds a match", async () => {
    let historyQuery: { userId: string; queryText: string } | undefined;
    let composedFinding: unknown;
    let dmUserId: string | undefined;
    let sentArgs: unknown[] | undefined;
    let recordedEvent: EpisodicSummary | undefined;

    const deps = baseDeps({
      historyFn: async (userId, queryText) => {
        historyQuery = { userId, queryText };
        return [];
      },
      composeStalePrMessageFn: async (finding) => {
        composedFinding = finding;
        return "ecco il messaggio";
      },
      getOrCreateDmSpaceFn: async (userId) => {
        dmUserId = userId;
        return { name: "spaces/DM1" };
      },
      sendMessageFn: async (...args) => {
        sentArgs = args;
        return { name: "spaces/DM1/messages/1" };
      },
      recordEventFn: async (entry) => {
        recordedEvent = entry;
      },
    });

    await runStalePrSweep(Date.now(), deps);

    expect(historyQuery?.userId).toBe("users/42");
    expect(historyQuery?.queryText).toContain("237");
    expect(composedFinding).toEqual({
      repository: "comperiosrl/comperio-frontends",
      prId: 237,
      title: "Feature/update docs",
      staleDays: DEFAULT_PR_STALE_DAYS,
    });
    expect(dmUserId).toBe("users/42");
    expect(sentArgs?.[0]).toBe("spaces/DM1");
    expect(sentArgs?.[1]).toBe("ecco il messaggio");
    expect(recordedEvent).toEqual({
      userId: "users/42",
      sessionKey: "spaces/DM1",
      summary: expect.stringContaining("237"),
      timestamp: "2026-07-22T00:00:00.000Z",
    });
  });

  it("logs and continues to the next finding when one finding's processing throws", async () => {
    const logged: string[] = [];
    let secondProcessed = false;
    const deps = baseDeps({
      findStalePrsFn: async () => [
        { repository: "comperiosrl/bad", prId: 1, title: "x", updatedOn: "2026-07-18T09:00:00.000Z", reviewer: { accountId: "a", displayName: "A" } },
        { repository: "comperiosrl/good", prId: 2, title: "y", updatedOn: "2026-07-18T09:00:00.000Z", reviewer: { accountId: "b", displayName: "B" } },
      ],
      resolveChatTargetForBitbucketUserFn: async (user) => {
        if (user.accountId === "a") throw new Error("boom");
        secondProcessed = true;
        return { kind: "found", chatUserId: "users/99", displayName: user.displayName };
      },
      log: (msg) => logged.push(msg),
    });

    await runStalePrSweep(Date.now(), deps);

    expect(logged.some((m) => m.includes("comperiosrl/bad") && m.includes("boom"))).toBe(true);
    expect(secondProcessed).toBe(true);
  });
});

describe("startStalePrCron", () => {
  it("runs a sweep on each tick and stop() halts further ticks", async () => {
    let ticks = 0;
    const deps = baseDeps({
      findStalePrsFn: async () => {
        ticks++;
        return [];
      },
    });

    const cron = startStalePrCron(deps, { checkIntervalMs: 10 });

    await new Promise((r) => setTimeout(r, 45));
    cron.stop();
    const ticksAtStop = ticks;
    await new Promise((r) => setTimeout(r, 30));

    expect(ticksAtStop).toBeGreaterThan(1);
    expect(ticks).toBe(ticksAtStop);
  });

  it("logs and survives a tick that throws, instead of taking down the interval", async () => {
    const logged: string[] = [];
    let ticks = 0;
    const deps = baseDeps({
      findStalePrsFn: async () => {
        ticks++;
        throw new Error("boom");
      },
      log: (msg) => logged.push(msg),
    });

    const cron = startStalePrCron(deps, { checkIntervalMs: 10 });
    await new Promise((r) => setTimeout(r, 45));
    cron.stop();

    expect(ticks).toBeGreaterThan(1);
    expect(logged.some((m) => m.includes("boom"))).toBe(true);
  });
});
