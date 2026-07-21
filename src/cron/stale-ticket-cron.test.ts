import { describe, it, expect } from "bun:test";
import { runStaleTicketSweep, type StaleTicketSweepDeps } from "./stale-ticket-cron.ts";
import { DEFAULT_NOTIFICATION_THRESHOLDS_BODY, DEFAULT_STALE_TICKET_JQL } from "./notification-config.ts";
import type { CliResult } from "../tools/cli-executor.ts";
import type { EpisodicSummary } from "../memory/episodic-store.ts";
import type { IdentityBridgeResult } from "./identity-bridge.ts";

const MODEL = "fake-model" as never;

function issuesFixture() {
  return {
    ok: true as const,
    data: {
      issues: [
        {
          key: "KAN-1",
          fields: {
            summary: "Fix login bug",
            assignee: { accountId: "acc-1", emailAddress: "mario@example.com", displayName: "Mario Rossi" },
          },
        },
      ],
    },
  };
}

function baseDeps(overrides: Partial<StaleTicketSweepDeps> = {}): StaleTicketSweepDeps {
  const jiraCallLog: string[][] = [];
  return {
    vaultPath: "/vault",
    adminSpace: "spaces/ADMIN",
    model: MODEL,
    runCliFn: async (binary, args) => {
      jiraCallLog.push(args);
      if (binary === "jira") return issuesFixture();
      return { ok: true, data: {} };
    },
    readWikiFileFn: async () => DEFAULT_NOTIFICATION_THRESHOLDS_BODY,
    writeCuratedNoteFn: async () => {},
    writeJiraUserResolvedNoteFn: async () => {},
    isNotificationSuppressedFn: async () => false,
    resolveChatTargetForJiraUserFn: async () =>
      ({ kind: "found", chatUserId: "users/42", displayName: "Mario Rossi" }) satisfies IdentityBridgeResult,
    historyFn: async () => [],
    composeStaleTicketMessageFn: async () => "messaggio composto",
    getOrCreateDmSpaceFn: async () => ({ name: "spaces/DM1" }),
    sendMessageFn: async () => ({ name: "spaces/DM1/messages/1" }),
    notifyAdminFn: async () => {},
    recordEventFn: async () => {},
    now: () => new Date("2026-07-21T00:00:00Z"),
    ...overrides,
  };
}

describe("runStaleTicketSweep", () => {
  it("seeds the default config doc and uses its threshold+jql when the doc doesn't exist yet", async () => {
    let seededBody: string | undefined;
    let receivedArgs: string[] | undefined;
    const deps = baseDeps({
      readWikiFileFn: async () => {
        throw Object.assign(new Error("ENOENT"), { code: "ENOENT" });
      },
      writeCuratedNoteFn: async (_vaultPath, _relPath, _fields, body) => {
        seededBody = body;
      },
      runCliFn: async (binary, args) => {
        if (binary === "jira") {
          receivedArgs = args;
          return issuesFixture();
        }
        return { ok: true, data: {} };
      },
    });

    await runStaleTicketSweep(Date.now(), deps);

    expect(seededBody).toBe(DEFAULT_NOTIFICATION_THRESHOLDS_BODY);
    expect(receivedArgs).toEqual([
      "issue",
      "search",
      "--jql",
      `${DEFAULT_STALE_TICKET_JQL} order by updated asc`,
      "--stale-days",
      "5",
      "--select",
      "issues.key,issues.fields.summary,issues.fields.assignee.accountId,issues.fields.assignee.emailAddress,issues.fields.assignee.displayName",
    ]);
  });

  it("uses the configured threshold and jql when the doc already exists", async () => {
    let receivedArgs: string[] | undefined;
    const customBody = ["```yaml", "stale_ticket_days: 10", 'stale_ticket_jql: "project = KAN"', "```"].join("\n");
    const deps = baseDeps({
      readWikiFileFn: async () => customBody,
      runCliFn: async (binary, args) => {
        if (binary === "jira") {
          receivedArgs = args;
          return issuesFixture();
        }
        return { ok: true, data: {} };
      },
    });

    await runStaleTicketSweep(Date.now(), deps);

    expect(receivedArgs).toContain("project = KAN order by updated asc");
    expect(receivedArgs).toContain("10");
  });

  it("logs and returns without throwing when the jira query itself fails", async () => {
    const logged: string[] = [];
    const deps = baseDeps({
      runCliFn: async (binary): Promise<CliResult> => {
        if (binary === "jira") return { ok: false, error: "jira exited with code 1: boom" };
        return { ok: true, data: {} };
      },
      log: (msg) => logged.push(msg),
    });

    await expect(runStaleTicketSweep(Date.now(), deps)).resolves.toBeUndefined();
    expect(logged.some((m) => m.includes("boom"))).toBe(true);
  });

  it("skips a ticket that's already suppressed, never touching the identity bridge", async () => {
    let bridgeCalled = false;
    const deps = baseDeps({
      isNotificationSuppressedFn: async (_vaultPath, checkType, itemKey) => checkType === "stale-ticket" && itemKey === "KAN-1",
      resolveChatTargetForJiraUserFn: async () => {
        bridgeCalled = true;
        return { kind: "not-found" };
      },
    });

    await runStaleTicketSweep(Date.now(), deps);

    expect(bridgeCalled).toBe(false);
  });

  it("routes an unassigned ticket straight to notifyAdmin, without touching the identity bridge", async () => {
    let notifiedText: string | undefined;
    let bridgeCalled = false;
    const deps = baseDeps({
      runCliFn: async (binary) => {
        if (binary === "jira") {
          return {
            ok: true,
            data: { issues: [{ key: "KAN-2", fields: { summary: "Orphan ticket", assignee: null } }] },
          };
        }
        return { ok: true, data: {} };
      },
      resolveChatTargetForJiraUserFn: async () => {
        bridgeCalled = true;
        return { kind: "not-found" };
      },
      notifyAdminFn: async (text) => {
        notifiedText = text;
      },
    });

    await runStaleTicketSweep(Date.now(), deps);

    expect(bridgeCalled).toBe(false);
    expect(notifiedText).toContain("KAN-2");
  });

  it("caches the Jira user and calls the identity bridge with the assignee's data for an assigned ticket", async () => {
    let cachedArgs: unknown[] | undefined;
    let bridgeArgs: unknown[] | undefined;
    const deps = baseDeps({
      writeJiraUserResolvedNoteFn: async (...args) => {
        cachedArgs = args;
      },
      resolveChatTargetForJiraUserFn: async (...args) => {
        bridgeArgs = args;
        return { kind: "found", chatUserId: "users/42", displayName: "Mario Rossi" };
      },
    });

    await runStaleTicketSweep(Date.now(), deps);

    expect(cachedArgs?.[0]).toBe("/vault");
    expect(cachedArgs?.[1]).toBe("acc-1");
    expect(cachedArgs?.[2]).toMatchObject({ email: "mario@example.com" });
    expect(cachedArgs?.[3]).toBe("Mario Rossi");

    expect(bridgeArgs?.[0]).toEqual({ accountId: "acc-1", email: "mario@example.com", displayName: "Mario Rossi" });
  });

  it("does nothing further when the identity bridge returns not-found (it already notified admin itself)", async () => {
    let historyCalled = false;
    let sendCalled = false;
    const deps = baseDeps({
      resolveChatTargetForJiraUserFn: async () => ({ kind: "not-found" }),
      historyFn: async () => {
        historyCalled = true;
        return [];
      },
      sendMessageFn: async (...args) => {
        sendCalled = true;
        return { name: "spaces/DM1/messages/1" };
      },
    });

    await runStaleTicketSweep(Date.now(), deps);

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
      composeStaleTicketMessageFn: async (finding) => {
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

    await runStaleTicketSweep(Date.now(), deps);

    expect(historyQuery?.userId).toBe("users/42");
    expect(historyQuery?.queryText).toContain("KAN-1");
    expect(composedFinding).toEqual({ key: "KAN-1", summary: "Fix login bug", staleDays: 5 });
    expect(dmUserId).toBe("users/42");
    expect(sentArgs?.[0]).toBe("spaces/DM1");
    expect(sentArgs?.[1]).toBe("ecco il messaggio");
    expect(recordedEvent).toEqual({
      userId: "users/42",
      sessionKey: "spaces/DM1",
      summary: expect.stringContaining("KAN-1"),
      timestamp: "2026-07-21T00:00:00.000Z",
    });
  });

  it("logs and continues to the next ticket when one ticket's processing throws", async () => {
    const logged: string[] = [];
    let secondProcessed = false;
    const deps = baseDeps({
      runCliFn: async (binary) => {
        if (binary === "jira") {
          return {
            ok: true,
            data: {
              issues: [
                { key: "KAN-BAD", fields: { summary: "x", assignee: { accountId: "a", emailAddress: null, displayName: "A" } } },
                { key: "KAN-OK", fields: { summary: "y", assignee: { accountId: "b", emailAddress: null, displayName: "B" } } },
              ],
            },
          };
        }
        return { ok: true, data: {} };
      },
      writeJiraUserResolvedNoteFn: async (_vaultPath, accountId) => {
        if (accountId === "a") throw new Error("boom");
      },
      resolveChatTargetForJiraUserFn: async (jiraUser) => {
        if (jiraUser.accountId === "b") secondProcessed = true;
        return { kind: "found", chatUserId: "users/99", displayName: jiraUser.displayName };
      },
      log: (msg) => logged.push(msg),
    });

    await runStaleTicketSweep(Date.now(), deps);

    expect(logged.some((m) => m.includes("KAN-BAD") && m.includes("boom"))).toBe(true);
    expect(secondProcessed).toBe(true);
  });
});
