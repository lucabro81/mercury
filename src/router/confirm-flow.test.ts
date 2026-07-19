import { describe, it, expect } from "bun:test";
import { tryConfirm } from "./confirm-flow.ts";
import { createConfirmationStore } from "../tools/confirmation-store.ts";
import type { CliResult } from "../tools/cli-executor.ts";

describe("tryConfirm", () => {
  it("returns null for input that isn't a confirm command, never touching the store or runCliFn", async () => {
    let called = false;
    const store = createConfirmationStore();
    const runCliFn = async (): Promise<CliResult> => {
      called = true;
      return { ok: true, data: {} };
    };

    const result = await tryConfirm("crea un bug su KAN", "terminal", { store, runCliFn });

    expect(result).toBeNull();
    expect(called).toBe(false);
  });

  it("executes the staged command for a valid token and reports success", async () => {
    const store = createConfirmationStore({ tokenFn: () => "TOK1" });
    const token = store.stage("terminal", "jira", ["issue", "delete", "KAN-1", "--confirm"]);
    let receivedBinary: string | undefined;
    let receivedArgs: string[] | undefined;
    const runCliFn = async (binary: string, args: string[]): Promise<CliResult> => {
      receivedBinary = binary;
      receivedArgs = args;
      return { ok: true, data: { key: "KAN-1", deleted: true } };
    };

    const result = await tryConfirm(`conferma ${token}`, "terminal", { store, runCliFn });

    expect(receivedBinary).toBe("jira");
    expect(receivedArgs).toEqual(["issue", "delete", "KAN-1", "--confirm"]);
    expect(result).not.toBeNull();
    expect(result).toContain("KAN-1");
  });

  it("returns a canned message for an unknown/expired/wrong-session token, never calling runCliFn", async () => {
    const store = createConfirmationStore();
    let called = false;
    const runCliFn = async (): Promise<CliResult> => {
      called = true;
      return { ok: true, data: {} };
    };

    const result = await tryConfirm("conferma NOPE", "terminal", { store, runCliFn });

    expect(called).toBe(false);
    expect(result).not.toBeNull();
    expect(result?.toLowerCase()).toContain("nessuna conferma");
  });

  it("reports failure when the staged command's runCliFn call fails, still consuming the token", async () => {
    const store = createConfirmationStore({ tokenFn: () => "TOK1" });
    const token = store.stage("terminal", "jira", ["issue", "delete", "KAN-1", "--confirm"]);
    const runCliFn = async (): Promise<CliResult> => ({ ok: false, error: "jira exited with code 1: boom" });

    const result = await tryConfirm(`conferma ${token}`, "terminal", { store, runCliFn });

    expect(result).toContain("boom");
    // one-shot regardless of outcome: a retry with the same token now finds nothing staged
    const retry = await tryConfirm(`conferma ${token}`, "terminal", { store, runCliFn });
    expect(retry?.toLowerCase()).toContain("nessuna conferma");
  });
});
