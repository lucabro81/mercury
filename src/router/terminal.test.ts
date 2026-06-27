import { describe, it, expect } from "bun:test";
import { startTerminalRepl, PROMPT } from "./terminal.ts";

function fakeOutput() {
  const lines: string[] = [];
  const calls: Array<{ text: string; newline: boolean }> = [];
  return {
    lines,
    calls,
    write: (s: string, opts?: { newline?: boolean }) => {
      lines.push(s);
      calls.push({ text: s, newline: opts?.newline !== false });
    },
  };
}

async function* oneLine(line: string): AsyncIterable<string> {
  yield line;
}

async function* manyLines(lines: string[]): AsyncIterable<string> {
  for (const line of lines) {
    yield line;
  }
}

describe("startTerminalRepl", () => {
  it("writes a prompt before the first input and after each result, so it's clear when an answer is done", async () => {
    const output = fakeOutput();
    const handleInput = async (input: string) => input.toUpperCase();

    await startTerminalRepl(handleInput, { input: oneLine("hello"), output });

    expect(output.lines).toEqual([PROMPT, "HELLO", PROMPT]);
  });

  // Regression: PROMPT was written through the same path as every other
  // line, which on the real terminal always appends "\n" — so input
  // landed one line below "> " instead of right after it.
  it("writes the prompt without a trailing newline, so input continues on the same line", async () => {
    const output = fakeOutput();
    const handleInput = async (input: string) => `echo: ${input}`;

    await startTerminalRepl(handleInput, { input: oneLine("hi"), output });

    const promptCalls = output.calls.filter((c) => c.text === PROMPT);
    expect(promptCalls.length).toBeGreaterThan(0);
    expect(promptCalls.every((c) => c.newline === false)).toBe(true);

    const resultCall = output.calls.find((c) => c.text === "echo: hi");
    expect(resultCall?.newline).toBe(true);
  });

  it("writes handleInput's result for each input line, then returns on EOF", async () => {
    const output = fakeOutput();
    const handleInput = async (input: string) => input.toUpperCase();

    await startTerminalRepl(handleInput, { input: oneLine("hello"), output });

    expect(output.lines).toContain("HELLO");
  });

  it("processes multiple lines in order, with a prompt between each", async () => {
    const output = fakeOutput();
    const handleInput = async (input: string) => `echo: ${input}`;

    await startTerminalRepl(handleInput, {
      input: manyLines(["a", "b", "c"]),
      output,
    });

    expect(output.lines).toEqual([
      PROMPT,
      "echo: a",
      PROMPT,
      "echo: b",
      PROMPT,
      "echo: c",
      PROMPT,
    ]);
  });

  it("writes an error line and keeps going when handleInput rejects, instead of crashing", async () => {
    const output = fakeOutput();
    const handleInput = async (input: string) => {
      if (input === "bad") {
        throw new Error("boom");
      }
      return `ok: ${input}`;
    };

    await startTerminalRepl(handleInput, {
      input: manyLines(["good-before", "bad", "good-after"]),
      output,
    });

    const results = output.lines.filter((l) => l !== PROMPT);
    expect(results[0]).toBe("ok: good-before");
    expect(results[1]).toContain("boom");
    expect(results[2]).toBe("ok: good-after");
  });
});
