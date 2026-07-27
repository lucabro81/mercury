import { describe, it, expect } from "bun:test";
import { tryConfirm } from "./confirm-flow.ts";
import { createConfirmationStore } from "../tools/confirmation-store.ts";
import type { CliResult } from "../tools/cli-executor.ts";
import type { writeSuppressionNote, writeConfirmationNote } from "../wiki/wiki-note.ts";
import type { EpisodicSummary } from "../memory/episodic-store.ts";

const noopWriteSuppressionNoteFn: typeof writeSuppressionNote = async () => {};
const noopRecordSuppressionEventFn = async (_entry: EpisodicSummary): Promise<void> => {};
const noopWriteConfirmationNoteFn: typeof writeConfirmationNote = async () => {};

function baseDeps(overrides: Partial<Parameters<typeof tryConfirm>[2]> = {}): Parameters<typeof tryConfirm>[2] {
  return {
    store: createConfirmationStore(),
    runCliFn: async (): Promise<CliResult> => ({ ok: true, data: {} }),
    userId: "users/42",
    vaultPath: "/vault",
    writeSuppressionNoteFn: noopWriteSuppressionNoteFn,
    recordSuppressionEventFn: noopRecordSuppressionEventFn,
    writeConfirmationNoteFn: noopWriteConfirmationNoteFn,
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
    const store = createConfirmationStore({ tokenFn: () => "k9m2-x7q4" });
    const token = store.stage("terminal", { kind: "cli", binary: "jira", args: ["issue", "delete", "KAN-1", "--confirm"] });
    let receivedBinary: string | undefined;
    let receivedArgs: string[] | undefined;
    const runCliFn = async (binary: string, args: string[]): Promise<CliResult> => {
      receivedBinary = binary;
      receivedArgs = args;
      return { ok: true, data: { key: "KAN-1", deleted: true } };
    };

    const result = await tryConfirm(token, "terminal", baseDeps({ store, runCliFn }));

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

    const result = await tryConfirm("ABCD-EFGH", "terminal", baseDeps({ runCliFn }));

    expect(called).toBe(false);
    expect(result).not.toBeNull();
    expect(result?.toLowerCase()).toContain("nessuna conferma");
  });

  it("reports failure when the staged cli action's runCliFn call fails, still consuming the token", async () => {
    const store = createConfirmationStore({ tokenFn: () => "k9m2-x7q4" });
    const token = store.stage("terminal", { kind: "cli", binary: "jira", args: ["issue", "delete", "KAN-1", "--confirm"] });
    const runCliFn = async (): Promise<CliResult> => ({ ok: false, error: "jira exited with code 1: boom" });

    const result = await tryConfirm(token, "terminal", baseDeps({ store, runCliFn }));

    expect(result).toContain("boom");
    // one-shot regardless of outcome: a retry with the same token now finds nothing staged
    const retry = await tryConfirm(token, "terminal", baseDeps({ store, runCliFn }));
    expect(retry?.toLowerCase()).toContain("nessuna conferma");
  });

  // Regression guard for the stale-primer bug: the resolve half of a
  // confirm-required action must overwrite the same deterministic note the
  // propose half wrote, so the persistent record never gets stuck saying
  // "pending" for an action that was actually confirmed or abandoned.
  describe("confirmation note (resolve side)", () => {
    it("overwrites the note as confirmed on a successful cli execution", async () => {
      const store = createConfirmationStore({ tokenFn: () => "k9m2-x7q4" });
      const token = store.stage("terminal", {
        kind: "cli",
        binary: "jira",
        args: ["issue", "delete", "KAN-1", "--confirm"],
        requestedAt: "2026-07-27T12:20:00.000Z",
      });
      const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: { deleted: true } });
      const writes: unknown[] = [];
      const writeConfirmationNoteFn: typeof writeConfirmationNote = async (vaultPath, userId, tok, fields) => {
        writes.push({ vaultPath, userId, tok, fields });
      };

      await tryConfirm(
        token,
        "terminal",
        baseDeps({ store, runCliFn, writeConfirmationNoteFn, now: () => new Date("2026-07-27T12:25:00Z") }),
      );

      expect(writes).toEqual([
        {
          vaultPath: "/vault",
          userId: "users/42",
          tok: "k9m2-x7q4",
          fields: {
            status: "confirmed",
            requestedAt: "2026-07-27T12:20:00.000Z",
            resolvedAt: "2026-07-27T12:25:00.000Z",
            command: "jira issue delete KAN-1 --confirm",
          },
        },
      ]);
    });

    it("overwrites the note as failed when the cli execution fails", async () => {
      const store = createConfirmationStore({ tokenFn: () => "k9m2-x7q4" });
      const token = store.stage("terminal", {
        kind: "cli",
        binary: "jira",
        args: ["issue", "delete", "KAN-1", "--confirm"],
        requestedAt: "2026-07-27T12:20:00.000Z",
      });
      const runCliFn = async (): Promise<CliResult> => ({ ok: false, error: "boom" });
      const writes: unknown[] = [];
      const writeConfirmationNoteFn: typeof writeConfirmationNote = async (vaultPath, userId, tok, fields) => {
        writes.push({ vaultPath, userId, tok, fields });
      };

      await tryConfirm(token, "terminal", baseDeps({ store, runCliFn, writeConfirmationNoteFn }));

      expect(writes).toEqual([
        { vaultPath: "/vault", userId: "users/42", tok: "k9m2-x7q4", fields: expect.objectContaining({ status: "failed" }) },
      ]);
    });

    it("falls back gracefully when the staged action has no requestedAt (older/test-constructed entries)", async () => {
      const store = createConfirmationStore({ tokenFn: () => "k9m2-x7q4" });
      const token = store.stage("terminal", { kind: "cli", binary: "jira", args: ["issue", "delete", "KAN-1", "--confirm"] });
      const writes: unknown[] = [];
      const writeConfirmationNoteFn: typeof writeConfirmationNote = async (vaultPath, userId, tok, fields) => {
        writes.push(fields);
      };

      await tryConfirm(token, "terminal", baseDeps({ store, writeConfirmationNoteFn }));

      expect(writes).toEqual([expect.objectContaining({ requestedAt: expect.any(String) })]);
    });

    it("a wiki-write failure does not break the confirm/execute flow itself", async () => {
      const store = createConfirmationStore({ tokenFn: () => "k9m2-x7q4" });
      const token = store.stage("terminal", { kind: "cli", binary: "jira", args: ["issue", "delete", "KAN-1", "--confirm"] });
      const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: { key: "KAN-1", deleted: true } });
      const writeConfirmationNoteFn: typeof writeConfirmationNote = async () => {
        throw new Error("disk full");
      };

      const result = await tryConfirm(token, "terminal", baseDeps({ store, runCliFn, writeConfirmationNoteFn }));

      expect(result).toContain("KAN-1");
    });
  });

  // The suppress-notification branch — writes the hard Wiki gate
  // AND records a soft episodic event (for future tone/frequency
  // reasoning when composing notifications), never runs a CLI command.
  describe("suppress-notification", () => {
    it("writes the suppression note and reports success, without calling runCliFn", async () => {
      const store = createConfirmationStore({ tokenFn: () => "k9m2-x7q4" });
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
        token,
        "terminal",
        baseDeps({ store, runCliFn, writeSuppressionNoteFn, now: () => new Date("2026-07-21T00:00:00Z") }),
      );

      expect(cliCalled).toBe(false);
      expect(writtenArgs).toEqual(["/vault", "stale-ticket", "KAN-123", { confirmedAt: "2026-07-21T00:00:00.000Z" }]);
      expect(result).toContain("KAN-123");
    });

    it("records a soft episodic event for the same suppression", async () => {
      const store = createConfirmationStore({ tokenFn: () => "k9m2-x7q4" });
      const token = store.stage("terminal", { kind: "suppress-notification", checkType: "stale-ticket", itemKey: "KAN-123" });

      let recorded: EpisodicSummary | undefined;
      const recordSuppressionEventFn = async (entry: EpisodicSummary): Promise<void> => {
        recorded = entry;
      };

      await tryConfirm(
        token,
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
      const store = createConfirmationStore({ tokenFn: () => "k9m2-x7q4" });
      const token = store.stage("terminal", { kind: "suppress-notification", checkType: "stale-ticket", itemKey: "KAN-123" });

      await tryConfirm(token, "terminal", baseDeps({ store }));
      const retry = await tryConfirm(token, "terminal", baseDeps({ store }));

      expect(retry?.toLowerCase()).toContain("nessuna conferma");
    });
  });
});
