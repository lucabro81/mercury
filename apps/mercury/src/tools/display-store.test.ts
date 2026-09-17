import { describe, it, expect } from "bun:test";
import { createDisplayStore } from "./display-store.ts";

describe("createDisplayStore", () => {
  it("stashes an artifact under a fresh ref and surfaces it back on takeSurfaced", () => {
    let n = 0;
    const store = createDisplayStore({ refFn: () => `d${++n}` });
    const ref = store.stash("terminal", "MER-1\nhttps://x");
    expect(ref).toBe("d1");

    // stashed but not yet surfaced: nothing to render
    expect(store.takeSurfaced("terminal")).toEqual([]);

    expect(store.surface("terminal", "d1")).toBe(true);
    expect(store.takeSurfaced("terminal")).toEqual(["MER-1\nhttps://x"]);
  });

  it("returns surfaced artifacts in stash order, only the ones actually surfaced", () => {
    let n = 0;
    const store = createDisplayStore({ refFn: () => `d${++n}` });
    const a = store.stash("terminal", "list-a");
    store.stash("terminal", "list-b"); // stashed, never surfaced
    const c = store.stash("terminal", "list-c");

    expect(store.surface("terminal", c)).toBe(true);
    expect(store.surface("terminal", a)).toBe(true);

    // stash order (a before c), not surface order (c before a)
    expect(store.takeSurfaced("terminal")).toEqual(["list-a", "list-c"]);
  });

  it("takeSurfaced consumes the surfaced flag so the same turn's artifact isn't re-appended next turn", () => {
    const store = createDisplayStore({ refFn: () => "d1" });
    store.stash("terminal", "list-a");
    store.surface("terminal", "d1");

    expect(store.takeSurfaced("terminal")).toEqual(["list-a"]);
    // second finalize in a later turn, present not called again: nothing
    expect(store.takeSurfaced("terminal")).toEqual([]);
  });

  it("lets a still-valid ref be surfaced again across turns (session-scoped, not turn-scoped)", () => {
    const store = createDisplayStore({ refFn: () => "d1" });
    store.stash("terminal", "list-a");

    store.surface("terminal", "d1");
    expect(store.takeSurfaced("terminal")).toEqual(["list-a"]);

    // a follow-up turn: "show me that list again" → present(d1) still works
    expect(store.surface("terminal", "d1")).toBe(true);
    expect(store.takeSurfaced("terminal")).toEqual(["list-a"]);
  });

  it("does not surface a ref for the wrong session, and doesn't leak it there", () => {
    const store = createDisplayStore({ refFn: () => "d1" });
    store.stash("terminal", "list-a");

    expect(store.surface("spaces/X:users/42", "d1")).toBe(false);
    expect(store.takeSurfaced("spaces/X:users/42")).toEqual([]);
    // the wrong-session attempt didn't mark it: the owner can still surface it
    expect(store.surface("terminal", "d1")).toBe(true);
    expect(store.takeSurfaced("terminal")).toEqual(["list-a"]);
  });

  it("returns false when surfacing an unknown ref", () => {
    const store = createDisplayStore();
    expect(store.surface("terminal", "nope")).toBe(false);
  });

  it("returns false when surfacing a ref past its expiry, and cleans it up", () => {
    let now = 0;
    const store = createDisplayStore({ now: () => now, ttlMs: 1000, refFn: () => "d1" });
    store.stash("terminal", "list-a");

    now = 1001;
    expect(store.surface("terminal", "d1")).toBe(false);

    // actually deleted, not just failing the expiry check: moving time back
    // doesn't resurrect it
    now = 0;
    expect(store.surface("terminal", "d1")).toBe(false);
  });

  it("scopes takeSurfaced by session: one session's surfaced artifacts don't reach another", () => {
    let n = 0;
    const store = createDisplayStore({ refFn: () => `d${++n}` });
    const a = store.stash("terminal", "list-a");
    const b = store.stash("spaces/X:users/42", "list-b");

    store.surface("terminal", a);
    store.surface("spaces/X:users/42", b);

    expect(store.takeSurfaced("terminal")).toEqual(["list-a"]);
    expect(store.takeSurfaced("spaces/X:users/42")).toEqual(["list-b"]);
  });

  it("mints distinct default refs when refFn isn't injected", () => {
    const store = createDisplayStore();
    const a = store.stash("terminal", "list-a");
    const b = store.stash("terminal", "list-b");
    expect(a).not.toBe(b);
    expect(store.surface("terminal", a)).toBe(true);
    expect(store.takeSurfaced("terminal")).toEqual(["list-a"]);
  });
});
