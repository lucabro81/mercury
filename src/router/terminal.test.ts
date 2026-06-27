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

  // The terminal-side half of streaming: handleInput receives an onChunk
  // it can call as text arrives, so the REPL doesn't sit silent for the
  // several seconds a full local-model response can take.
  it("writes each chunk as handleInput emits it via onChunk, then a closing newline and the next prompt", async () => {
    const output = fakeOutput();
    const handleInput = async (_input: string, onChunk: (chunk: string) => void) => {
      onChunk("Hel");
      onChunk("lo");
      return "Hello";
    };

    await startTerminalRepl(handleInput, { input: oneLine("hi"), output });

    expect(output.calls).toEqual([
      { text: PROMPT, newline: false },
      { text: "Hel", newline: false },
      { text: "lo", newline: false },
      { text: "", newline: true },
      { text: PROMPT, newline: false },
    ]);
  });

  it("doesn't duplicate output: when handleInput never calls onChunk, the returned result is written once", async () => {
    const output = fakeOutput();
    const handleInput = async (input: string, _onChunk: (chunk: string) => void) =>
      `echo: ${input}`;

    await startTerminalRepl(handleInput, { input: oneLine("hi"), output });

    expect(output.lines).toEqual([PROMPT, "echo: hi", PROMPT]);
  });

  it("ends the streamed line before printing an error, when handleInput streams then rejects", async () => {
    const output = fakeOutput();
    const handleInput = async (_input: string, onChunk: (chunk: string) => void) => {
      onChunk("partial");
      throw new Error("boom");
    };

    await startTerminalRepl(handleInput, { input: oneLine("hi"), output });

    const texts = output.calls.map((c) => c.text);
    expect(texts[0]).toBe(PROMPT);
    expect(texts[1]).toBe("partial");
    expect(texts[2]).toBe("");
    expect(texts[3]).toContain("boom");
    expect(texts[4]).toBe(PROMPT);
  });

  // Lets the caller show a live indicator (e.g. context usage, see
  // src/router/tool-log.ts's formatContextUsage) right before "> ",
  // recomputed each time since the value it reports changes turn to turn.
  // Regression: the suffix was written with the default newline, landing
  // on its own line above "> " instead of right next to it.
  it("writes the result of promptSuffix() right before every prompt, on the same line, recomputing it each time", async () => {
    const output = fakeOutput();
    const handleInput = async (input: string) => `echo: ${input}`;
    let counter = 0;
    const promptSuffix = () => `[call ${++counter}] `;

    await startTerminalRepl(
      handleInput,
      { input: manyLines(["a", "b"]), output },
      { promptSuffix },
    );

    expect(output.lines).toEqual([
      "[call 1] ",
      PROMPT,
      "echo: a",
      "[call 2] ",
      PROMPT,
      "echo: b",
      "[call 3] ",
      PROMPT,
    ]);
    const suffixCalls = output.calls.filter((c) => c.text.startsWith("[call"));
    expect(suffixCalls.every((c) => c.newline === false)).toBe(true);
  });

  it("writes no suffix at all when promptSuffix is omitted", async () => {
    const output = fakeOutput();
    const handleInput = async (input: string) => `echo: ${input}`;

    await startTerminalRepl(handleInput, { input: oneLine("hi"), output });

    expect(output.lines).toEqual([PROMPT, "echo: hi", PROMPT]);
  });
});
