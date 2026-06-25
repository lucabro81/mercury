import { describe, it, expect } from "bun:test";
import { runCli } from "./cli-executor.ts";

describe("runCli", () => {
  it("parses valid JSON stdout on exit code 0", async () => {
    const result = await runCli("bun", [
      "-e",
      "console.log(JSON.stringify({ hello: 'world' }))",
    ]);
    expect(result).toEqual({ ok: true, data: { hello: "world" } });
  });

  it("returns a structured error on non-zero exit, never throws", async () => {
    const result = await runCli("bun", [
      "-e",
      "console.error('boom'); process.exit(2)",
    ]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("boom");
      expect(result.error).toContain("2");
    }
  });

  it("returns a structured error when stdout is not valid JSON", async () => {
    const result = await runCli("bun", ["-e", "console.log('not json')"]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.toLowerCase()).toContain("json");
    }
  });

  it("returns a structured error when stdout is empty", async () => {
    const result = await runCli("bun", ["-e", ""]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.toLowerCase()).toContain("json");
    }
  });

  it("returns a structured error when the binary does not exist on PATH, never crashes", async () => {
    const result = await runCli("this-binary-does-not-exist-xyz", []);
    expect(result.ok).toBe(false);
  });
});
