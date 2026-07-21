import { describe, it, expect } from "bun:test";
import { createConfirmationStore, parseConfirmCommand } from "./confirmation-store.ts";

describe("createConfirmationStore", () => {
  it("stages a cli action and returns it on a matching take, one-shot", () => {
    const store = createConfirmationStore({ tokenFn: () => "TOK1" });
    const token = store.stage("terminal", { kind: "cli", binary: "jira", args: ["issue", "delete", "KAN-1", "--confirm"] });
    expect(token).toBe("TOK1");

    const first = store.take("terminal", "TOK1");
    expect(first).toEqual({ kind: "cli", binary: "jira", args: ["issue", "delete", "KAN-1", "--confirm"] });

    // one-shot: the same token can't be taken twice
    const second = store.take("terminal", "TOK1");
    expect(second).toBeNull();
  });

  // D-26: same store, same token mechanism as an irreversible CLI action —
  // just a different action kind, discriminated at take() time, not a
  // second parallel store to look tokens up in.
  it("stages a suppress-notification action and returns it on a matching take", () => {
    const store = createConfirmationStore({ tokenFn: () => "TOK1" });
    const token = store.stage("terminal", { kind: "suppress-notification", checkType: "stale-ticket", itemKey: "KAN-123" });
    expect(token).toBe("TOK1");

    expect(store.take("terminal", "TOK1")).toEqual({
      kind: "suppress-notification",
      checkType: "stale-ticket",
      itemKey: "KAN-123",
    });
  });

  it("does not return a staged action for the wrong sessionKey, and doesn't consume it", () => {
    const store = createConfirmationStore({ tokenFn: () => "TOK1" });
    store.stage("terminal", { kind: "cli", binary: "jira", args: ["issue", "delete", "KAN-1", "--confirm"] });

    expect(store.take("spaces/X:users/42", "TOK1")).toBeNull();
    // proves the wrong-session attempt didn't consume the token
    expect(store.take("terminal", "TOK1")).toEqual({
      kind: "cli",
      binary: "jira",
      args: ["issue", "delete", "KAN-1", "--confirm"],
    });
  });

  it("returns null for an unknown token", () => {
    const store = createConfirmationStore();
    expect(store.take("terminal", "NOPE")).toBeNull();
  });

  it("returns null for a token past its expiry, and cleans it up", () => {
    let now = 0;
    const store = createConfirmationStore({ now: () => now, ttlMs: 1000, tokenFn: () => "TOK1" });
    store.stage("terminal", { kind: "cli", binary: "jira", args: ["doctor"] });

    now = 1001;
    expect(store.take("terminal", "TOK1")).toBeNull();

    // cleaned up, not just "expired but still there": moving time back
    // doesn't resurrect it (proves it was actually deleted, not just
    // failing the expiry check every time).
    now = 0;
    expect(store.take("terminal", "TOK1")).toBeNull();
  });

  it("stages independent tokens per session without collision", () => {
    let counter = 0;
    const store = createConfirmationStore({ tokenFn: () => `TOK${++counter}` });
    store.stage("terminal", { kind: "cli", binary: "jira", args: ["issue", "delete", "KAN-1", "--confirm"] });
    store.stage("spaces/X:users/42", { kind: "cli", binary: "jira", args: ["issue", "delete", "KAN-2", "--confirm"] });

    expect(store.take("terminal", "TOK2")).toBeNull();
    expect(store.take("spaces/X:users/42", "TOK2")).toEqual({
      kind: "cli",
      binary: "jira",
      args: ["issue", "delete", "KAN-2", "--confirm"],
    });
  });

  it("defaults to a real random token when tokenFn isn't injected", () => {
    const store = createConfirmationStore();
    const token = store.stage("terminal", { kind: "cli", binary: "jira", args: ["doctor"] });
    expect(token.length).toBeGreaterThan(0);
    expect(store.take("terminal", token)).toEqual({ kind: "cli", binary: "jira", args: ["doctor"] });
  });
});

describe("parseConfirmCommand", () => {
  it("extracts the token from a well-formed confirm command", () => {
    expect(parseConfirmCommand("conferma TOK1")).toBe("TOK1");
  });

  it("matches the conferma keyword case-insensitively, but preserves token case", () => {
    expect(parseConfirmCommand("CONFERMA TOK1")).toBe("TOK1");
    expect(parseConfirmCommand("Conferma tok1")).toBe("tok1");
  });

  it("returns null for input that isn't a confirm command", () => {
    expect(parseConfirmCommand("crea un bug su KAN")).toBeNull();
    expect(parseConfirmCommand("conferma")).toBeNull();
    expect(parseConfirmCommand("conferma TOK1 extra")).toBeNull();
    expect(parseConfirmCommand("")).toBeNull();
  });

  it("tolerates surrounding whitespace", () => {
    expect(parseConfirmCommand("  conferma   TOK1  ")).toBe("TOK1");
  });
});
