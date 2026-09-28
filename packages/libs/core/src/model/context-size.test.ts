import { describe, it, expect } from "bun:test";
import { getLoadedContextLength } from "./context-size.ts";

function fakeFetch(body: unknown, ok = true): typeof fetch {
  return (async () =>
    ({ ok, json: async () => body }) as unknown as Response) as unknown as typeof fetch;
}

describe("getLoadedContextLength", () => {
  it("returns the context_length of the matching loaded model", async () => {
    const fetchFn = fakeFetch({
      models: [
        { model: "qwen3.5:35b", context_length: 262144 },
        { model: "other:1b", context_length: 4096 },
      ],
    });

    const result = await getLoadedContextLength(
      "http://example.com",
      "qwen3.5:35b",
      fetchFn,
    );

    expect(result).toBe(262144);
  });

  it("returns null when no loaded model matches (e.g. nothing loaded yet)", async () => {
    const fetchFn = fakeFetch({ models: [] });

    const result = await getLoadedContextLength("http://example.com", "qwen3.5:35b", fetchFn);

    expect(result).toBeNull();
  });

  it("queries /api/ps on the given host", async () => {
    let requestedUrl: string | undefined;
    const fetchFn = (async (url: string) => {
      requestedUrl = url;
      return { ok: true, json: async () => ({ models: [] }) } as unknown as Response;
    }) as typeof fetch;

    await getLoadedContextLength("http://example.com:11434", "qwen3.5:35b", fetchFn);

    expect(requestedUrl).toBe("http://example.com:11434/api/ps");
  });
});
