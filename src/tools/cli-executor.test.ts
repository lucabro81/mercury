import { describe, it, expect } from "bun:test";
import { runCli, spawnLines } from "./cli-executor.ts";

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

describe("spawnLines", () => {
  it("calls onLine once per printed line, in order, with no trailing newline", async () => {
    const lines: string[] = [];
    const { exited } = spawnLines(
      "bun",
      ["-e", "console.log('one'); console.log('two'); console.log('three')"],
      (line) => lines.push(line),
    );
    await exited;
    expect(lines).toEqual(["one", "two", "three"]);
  });

  it("never calls onLine when the signal is already aborted before spawning", async () => {
    const lines: string[] = [];
    const controller = new AbortController();
    controller.abort();

    const { exited } = spawnLines(
      "bun",
      ["-e", "console.log('should-not-appear')"],
      (line) => lines.push(line),
      { signal: controller.signal },
    );
    await exited;

    expect(lines).toEqual([]);
  });

  it("stops calling onLine and resolves exited once the signal aborts mid-stream", async () => {
    const lines: string[] = [];
    const controller = new AbortController();

    const { exited } = spawnLines(
      "bun",
      [
        "-e",
        "for (let i = 0; i < 20; i++) { console.log('line' + i); await new Promise((r) => setTimeout(r, 20)); }",
      ],
      (line) => lines.push(line),
      { signal: controller.signal },
    );

    // let a couple of lines through, then abort mid-stream
    await new Promise((r) => setTimeout(r, 50));
    controller.abort();
    await exited;

    const countAfterAbort = lines.length;
    await new Promise((r) => setTimeout(r, 100));
    expect(lines.length).toBe(countAfterAbort);
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.length).toBeLessThan(20);
  });
});
