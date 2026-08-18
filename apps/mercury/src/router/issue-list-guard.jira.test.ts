import { describe, it, expect } from "bun:test";
import { createIssueListGuard, ISSUE_LIST_CORRECTION_FALLBACK } from "@mercury/plugin-jira";

/**
 * The Jira issue-list post-turn guard's own behaviour — the logic that used to
 * live inline in the core's turn-runner and is now the plugin's
 * `createIssueListGuard`. The core's generic guard mechanism (how a guard's
 * result is applied, status fired, log forwarded) is tested with synthetic
 * guards in turn-runner.test.ts; end-to-end delivery through the pipeline is in
 * jira-behavior.test.ts. This file covers only the guard's own gate, rewrite,
 * re-check, fallback, and log messages, with an injected corrector.
 */
const FLAGGED = "- KAN-1 Fix the login redirect\n- KAN-2 Update the changelog";

describe("createIssueListGuard", () => {
  it("engages (shouldRun) on text that looks like a rendered issue list, and not on ordinary prose", () => {
    const guard = createIssueListGuard(async (t) => t);
    expect(guard.shouldRun(FLAGGED)).toBe(true);
    expect(guard.shouldRun("Ho guardato KAN-1 e mi sembra già risolta.")).toBe(false);
  });

  it("carries the status label and id the channel renders", () => {
    const guard = createIssueListGuard(async (t) => t);
    expect(guard.statusLabel).toBe("Sto verificando la risposta…");
    expect(guard.statusId).toBe("issue-list-correction");
  });

  it("replaces the text with the corrector's rewrite when it no longer looks like a list, reporting success", async () => {
    const guard = createIssueListGuard(async () => "Ho trovato due issue aperte.");
    const result = await guard.run(FLAGGED);
    expect(result.text).toBe("Ho trovato due issue aperte.");
    expect(result.outcome).toBe("success");
    expect(result.log).toContain("replaced with corrector's rewrite");
    expect(result.log).toContain("KAN-1");
  });

  it("falls back to the fixed reply, reporting failed, when the corrector's own output still looks like a list", async () => {
    const guard = createIssueListGuard(async () => "- KAN-1: ancora una lista\n- KAN-2: pure questa");
    const result = await guard.run(FLAGGED);
    expect(result.text).toBe(ISSUE_LIST_CORRECTION_FALLBACK);
    expect(result.outcome).toBe("failed");
    expect(result.log).toContain("still flagged");
  });

  it("falls back to the fixed reply when the corrector returns an empty or whitespace-only string", async () => {
    const empty = await createIssueListGuard(async () => "").run(FLAGGED);
    expect(empty.text).toBe(ISSUE_LIST_CORRECTION_FALLBACK);
    expect(empty.outcome).toBe("failed");

    const whitespace = await createIssueListGuard(async () => "   \n  ").run(FLAGGED);
    expect(whitespace.text).toBe(ISSUE_LIST_CORRECTION_FALLBACK);
    expect(whitespace.outcome).toBe("failed");
  });

  it("degrades to the original text, reporting failed, when the corrector call throws", async () => {
    const guard = createIssueListGuard(async () => {
      throw new Error("model unreachable");
    });
    const result = await guard.run(FLAGGED);
    expect(result.text).toBe(FLAGGED);
    expect(result.outcome).toBe("failed");
    expect(result.log).toContain("corrector call failed");
    expect(result.log).toContain("model unreachable");
  });

  it("truncates a very long original text in the log rather than embedding it whole", async () => {
    const long = Array.from({ length: 200 }, (_, i) => `- KAN-${i} something`).join("\n");
    const guard = createIssueListGuard(async () => "Ho trovato molte issue.");
    const result = await guard.run(long);
    expect(result.log).toContain("truncated");
    expect((result.log ?? "").length).toBeLessThan(long.length);
  });
});
