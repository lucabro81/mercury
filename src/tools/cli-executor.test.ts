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

  // Regression: exit 0 with non-JSON stdout was reported as a tool
  // failure ({ ok: false, error: "failed to parse JSON..." }). `jira
  // --help`/`jira issue --help` are exactly this shape — plain text, exit
  // 0 — so the model saw three "failed" tool calls before its first real
  // success on every session that started with discovery via --help,
  // observed live to send it into a confused, apologetic retry spiral.
  // Exit 0 is success regardless of whether stdout happens to be JSON;
  // non-JSON stdout is just plain-text data, not a parse error.
  it("returns the raw text as data when stdout is not valid JSON but exit code is 0", async () => {
    const result = await runCli("bun", ["-e", "console.log('not json')"]);
    expect(result).toEqual({ ok: true, data: "not json" });
  });

  it("returns an empty string as data when stdout is empty and exit code is 0", async () => {
    const result = await runCli("bun", ["-e", "1"]);
    expect(result).toEqual({ ok: true, data: "" });
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

  // Regression: a process that exits non-zero on its own (not via our
  // abort signal) was treated identically to a clean exit — `exited`
  // just resolved, silently. Observed live: `google-chat listen` exited
  // right after starting, for a reason only visible on its own stderr,
  // and the channel that spawned it just disappeared with no error
  // anywhere.
  it("rejects with the exit code and stderr when the process exits non-zero on its own", async () => {
    const lines: string[] = [];
    const { exited } = spawnLines("bun", [
      "-e",
      "console.error('boom'); process.exit(3)",
    ], (line) => lines.push(line));

    await expect(exited).rejects.toThrow(/boom/);
  });

  it("does not reject when the abort signal (not the process itself) caused the exit", async () => {
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

    await new Promise((r) => setTimeout(r, 30));
    controller.abort();

    await expect(exited).resolves.toBeUndefined();
  });
});
