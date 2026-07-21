import { describe, it, expect } from "bun:test";
import { tryConfirm } from "./confirm-flow.ts";
import { createConfirmationStore } from "../tools/confirmation-store.ts";
import type { CliResult } from "../tools/cli-executor.ts";
import type { writeSuppressionNote } from "../wiki/wiki-note.ts";
import type { EpisodicSummary } from "../memory/episodic-store.ts";

const noopWriteSuppressionNoteFn: typeof writeSuppressionNote = async () => {};
const noopRecordSuppressionEventFn = async (_entry: EpisodicSummary): Promise<void> => {};

function baseDeps(overrides: Partial<Parameters<typeof tryConfirm>[2]> = {}): Parameters<typeof tryConfirm>[2] {
  return {
    store: createConfirmationStore(),
    runCliFn: async (): Promise<CliResult> => ({ ok: true, data: {} }),
    userId: "users/42",
    vaultPath: "/vault",
    writeSuppressionNoteFn: noopWriteSuppressionNoteFn,
    recordSuppressionEventFn: noopRecordSuppressionEventFn,
    ...overrides,
  };
}

describe("tryConfirm", () => {
  it("returns null for input that isn't a confirm command, never touching the store or runCliFn", async () => {
    let called = false;
    const runCliFn = async (): Promise<CliResult> => {
      called = true;
      return { ok: true, data: {} };
    };

    const result = await tryConfirm("crea un bug su KAN", "terminal", baseDeps({ runCliFn }));

    expect(result).toBeNull();
    expect(called).toBe(false);
  });

  it("executes the staged cli action for a valid token and reports success", async () => {
    const store = createConfirmationStore({ tokenFn: () => "TOK1" });
    const token = store.stage("terminal", { kind: "cli", binary: "jira", args: ["issue", "delete", "KAN-1", "--confirm"] });
    let receivedBinary: string | undefined;
    let receivedArgs: string[] | undefined;
    const runCliFn = async (binary: string, args: string[]): Promise<CliResult> => {
      receivedBinary = binary;
      receivedArgs = args;
      return { ok: true, data: { key: "KAN-1", deleted: true } };
    };

    const result = await tryConfirm(`conferma ${token}`, "terminal", baseDeps({ store, runCliFn }));

    expect(receivedBinary).toBe("jira");
    expect(receivedArgs).toEqual(["issue", "delete", "KAN-1", "--confirm"]);
    expect(result).not.toBeNull();
    expect(result).toContain("KAN-1");
  });

  it("returns a canned message for an unknown/expired/wrong-session token, never calling runCliFn", async () => {
    let called = false;
    const runCliFn = async (): Promise<CliResult> => {
      called = true;
      return { ok: true, data: {} };
    };

    const result = await tryConfirm("conferma NOPE", "terminal", baseDeps({ runCliFn }));

    expect(called).toBe(false);
    expect(result).not.toBeNull();
    expect(result?.toLowerCase()).toContain("nessuna conferma");
  });

  it("reports failure when the staged cli action's runCliFn call fails, still consuming the token", async () => {
    const store = createConfirmationStore({ tokenFn: () => "TOK1" });
    const token = store.stage("terminal", { kind: "cli", binary: "jira", args: ["issue", "delete", "KAN-1", "--confirm"] });
    const runCliFn = async (): Promise<CliResult> => ({ ok: false, error: "jira exited with code 1: boom" });

    const result = await tryConfirm(`conferma ${token}`, "terminal", baseDeps({ store, runCliFn }));

    expect(result).toContain("boom");
    // one-shot regardless of outcome: a retry with the same token now finds nothing staged
    const retry = await tryConfirm(`conferma ${token}`, "terminal", baseDeps({ store, runCliFn }));
    expect(retry?.toLowerCase()).toContain("nessuna conferma");
  });

  // D-26: the suppress-notification branch — writes the hard Wiki gate
  // AND records a soft episodic event (for D-25's future tone/frequency
  // reasoning), never runs a CLI command.
  describe("suppress-notification", () => {
    it("writes the suppression note and reports success, without calling runCliFn", async () => {
      const store = createConfirmationStore({ tokenFn: () => "TOK1" });
      const token = store.stage("terminal", { kind: "suppress-notification", checkType: "stale-ticket", itemKey: "KAN-123" });

      let cliCalled = false;
      const runCliFn = async (): Promise<CliResult> => {
        cliCalled = true;
        return { ok: true, data: {} };
      };
      let writtenArgs: unknown[] | undefined;
      const writeSuppressionNoteFn: typeof writeSuppressionNote = async (...args) => {
        writtenArgs = args;
      };

      const result = await tryConfirm(
        `conferma ${token}`,
        "terminal",
        baseDeps({ store, runCliFn, writeSuppressionNoteFn, now: () => new Date("2026-07-21T00:00:00Z") }),
      );

      expect(cliCalled).toBe(false);
      expect(writtenArgs).toEqual(["/vault", "stale-ticket", "KAN-123", { confirmedAt: "2026-07-21T00:00:00.000Z" }]);
      expect(result).toContain("KAN-123");
    });

    it("records a soft episodic event for the same suppression", async () => {
      const store = createConfirmationStore({ tokenFn: () => "TOK1" });
      const token = store.stage("terminal", { kind: "suppress-notification", checkType: "stale-ticket", itemKey: "KAN-123" });

      let recorded: EpisodicSummary | undefined;
      const recordSuppressionEventFn = async (entry: EpisodicSummary): Promise<void> => {
        recorded = entry;
      };

      await tryConfirm(
        `conferma ${token}`,
        "terminal",
        baseDeps({ store, userId: "users/42", recordSuppressionEventFn, now: () => new Date("2026-07-21T00:00:00Z") }),
      );

      expect(recorded).toEqual({
        userId: "users/42",
        sessionKey: "terminal",
        summary: expect.stringContaining("KAN-123"),
        timestamp: "2026-07-21T00:00:00.000Z",
      });
    });

    it("one-shot regardless of kind: a suppress-notification token can't be reused either", async () => {
      const store = createConfirmationStore({ tokenFn: () => "TOK1" });
      const token = store.stage("terminal", { kind: "suppress-notification", checkType: "stale-ticket", itemKey: "KAN-123" });

      await tryConfirm(`conferma ${token}`, "terminal", baseDeps({ store }));
      const retry = await tryConfirm(`conferma ${token}`, "terminal", baseDeps({ store }));

      expect(retry?.toLowerCase()).toContain("nessuna conferma");
    });
  });
});
