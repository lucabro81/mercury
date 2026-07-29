import { describe, it, expect } from "bun:test";
import { createConfirmationStore, isTokenShaped } from "./confirmation-store.ts";

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

// Replaces parseConfirmCommand's "conferma <token>" keyword parsing: the
// real safety gate was always store.take() (must exist, right session, not
// expired) — the "conferma " prefix added no security, just ceremony left
// over from the pre-card text-only confirmation flow. isTokenShaped only
// needs to tell apart "this looks like a token attempt" from "this is an
// ordinary message", so tryConfirm (confirm-flow.ts) knows whether to
// intercept at all — not a security boundary itself.
//
// The token's shape (two 4-char alphanumeric groups joined by a fixed
// hyphen, e.g. "k9m2-x7q4") is deliberately not just "6 alphanumeric
// characters": a bare N-character run collides with ordinary short
// messages a human might actually send (found live — "second", used as
// plain conversational text in an unrelated test, was indistinguishable
// from a real token under the old 6-char-alphanumeric shape). A token is
// always copy-pasted, never read or typed from memory, so legibility
// (avoiding 0/O/1/l/I) was never the point — the hyphen at a fixed
// position is: an ordinary single-word message essentially never has that
// exact "word-word" shape with nothing else around it.
describe("isTokenShaped", () => {
  it("is true for two 4-char alphanumeric groups joined by a hyphen", () => {
    expect(isTokenShaped("k9m2-x7q4")).toBe(true);
  });

  it("tolerates surrounding whitespace", () => {
    expect(isTokenShaped("  k9m2-x7q4  ")).toBe(true);
  });

  it("is false without the hyphen, even at the right total length", () => {
    expect(isTokenShaped("k9m2x7q4")).toBe(false);
  });

  it("is false for the wrong group length", () => {
    expect(isTokenShaped("k9m-x7q4")).toBe(false);
    expect(isTokenShaped("k9m2x-x7q4x")).toBe(false);
  });

  it("is false for an ordinary conversational message, including ones that happen to be a single 6-character word", () => {
    expect(isTokenShaped("crea un bug su KAN")).toBe(false);
    expect(isTokenShaped("second")).toBe(false);
    expect(isTokenShaped("grazie")).toBe(false);
  });

  it("is false for an empty string", () => {
    expect(isTokenShaped("")).toBe(false);
  });
});
