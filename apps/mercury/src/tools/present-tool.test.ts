import { describe, it, expect } from "bun:test";
import { createPresentTool } from "./present-tool.ts";
import { createDisplayStore } from "./display-store.ts";

async function run(t: { execute?: (args: { ref: string }, opts: unknown) => unknown }, ref: string) {
  if (!t.execute) throw new Error("present tool has no execute");
  return await t.execute({ ref }, {});
}

describe("createPresentTool", () => {
  it("surfaces a valid ref so it is shown at finalize", async () => {
    const store = createDisplayStore({ refFn: () => "d1" });
    store.stash("terminal", "MER-1\nhttps://x");
    const { present } = createPresentTool({ sessionKey: "terminal", store });

    const result = await run(present, "d1");
    expect(result).toEqual({ ok: true });
    expect(store.takeSurfaced("terminal")).toEqual(["MER-1\nhttps://x"]);
  });

  it("returns a self-correctable error for an unknown ref, without surfacing anything", async () => {
    const store = createDisplayStore({ refFn: () => "d1" });
    store.stash("terminal", "MER-1\nhttps://x");
    const { present } = createPresentTool({ sessionKey: "terminal", store });

    const result = (await run(present, "d999")) as { ok: boolean; error?: string };
    expect(result.ok).toBe(false);
    expect(typeof result.error).toBe("string");
    expect(store.takeSurfaced("terminal")).toEqual([]);
  });

  it("scopes surfacing to its own session: can't present another session's ref", async () => {
    const store = createDisplayStore({ refFn: () => "d1" });
    store.stash("spaces/X:users/42", "MER-1\nhttps://x");
    const { present } = createPresentTool({ sessionKey: "terminal", store });

    const result = (await run(present, "d1")) as { ok: boolean };
    expect(result.ok).toBe(false);
    expect(store.takeSurfaced("spaces/X:users/42")).toEqual([]);
  });
});
