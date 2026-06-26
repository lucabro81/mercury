import { describe, it, expect } from "bun:test";
import { startTerminalRepl } from "./terminal.ts";

function fakeOutput() {
  const lines: string[] = [];
  return { lines, write: (s: string) => lines.push(s) };
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
  it("writes handleInput's result for each input line, then returns on EOF", async () => {
    const output = fakeOutput();
    const handleInput = async (input: string) => input.toUpperCase();

    await startTerminalRepl(handleInput, { input: oneLine("hello"), output });

    expect(output.lines).toEqual(["HELLO"]);
  });

  it("processes multiple lines in order", async () => {
    const output = fakeOutput();
    const handleInput = async (input: string) => `echo: ${input}`;

    await startTerminalRepl(handleInput, {
      input: manyLines(["a", "b", "c"]),
      output,
    });

    expect(output.lines).toEqual(["echo: a", "echo: b", "echo: c"]);
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

    expect(output.lines[0]).toBe("ok: good-before");
    expect(output.lines[1]).toContain("boom");
    expect(output.lines[2]).toBe("ok: good-after");
  });
});
