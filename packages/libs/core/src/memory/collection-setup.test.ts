/**
 * Regression tests for #68: an unreachable Qdrant at startup made the four
 * `ensure…Collection` awaits reject `composeMercury` and crash the process.
 * The setup now runs in the background and retries until Qdrant answers.
 */
import { describe, it, expect } from "bun:test";
import { setUpWhenReachable } from "./collection-setup.ts";

describe("setUpWhenReachable", () => {
  it("runs the setup once and logs nothing when Qdrant answers at once", async () => {
    let calls = 0;
    const logs: string[] = [];
    const { done } = setUpWhenReachable(async () => void calls++, { log: (m) => logs.push(m), retryMs: 1 });

    await done;

    expect(calls).toBe(1);
    expect(logs).toEqual([]);
  });

  it("doesn't throw when Qdrant is down, retries, and says when memory is back", async () => {
    let calls = 0;
    const logs: string[] = [];
    const { done } = setUpWhenReachable(
      async () => {
        calls++;
        if (calls < 4) throw new Error("ConnectionRefused");
      },
      { log: (m) => logs.push(m), retryMs: 1 },
    );

    await done;

    expect(calls).toBe(4);
    // One line when it goes missing, one when it's back: not one per retry.
    expect(logs).toEqual([
      "Qdrant unreachable, episodic memory is off until it answers (retrying every 0.001s): Error: ConnectionRefused",
      "Qdrant reachable, episodic memory collections ready",
    ]);
  });
});
