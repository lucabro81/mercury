/**
 * Terminal channel: a stdin/stdout REPL that feeds whatever it reads
 * into a generic `handleInput` callback and writes back whatever that
 * callback returns.
 *
 * Why this exists: the terminal is a first-class input channel
 * alongside Google Chat (see `src/router/channels/google-chat-events.ts`),
 * useful both as a bootstrap path before a channel is fully wired and
 * for direct debugging. This file is the *only* place that touches
 * stdin/stdout — `handleInput` itself doesn't know it's talking to a
 * terminal, which is what keeps adding another channel later a matter
 * of writing a new file, not touching this one.
 *
 * `io.input`/`io.output` are injectable specifically so this file is
 * unit-testable without spawning a real subprocess or touching real
 * stdin — production code (see `src/index.ts`) calls this with no `io`
 * argument and gets the real terminal.
 *
 * Used by: `src/index.ts` (wiring), which supplies `handleInput` as a
 * closure over `runTurn` and a `SessionHistory` (see
 * `src/session/agent-turn.ts`).
 */
import * as readline from "node:readline";

/** Lines from the real process stdin, one per line, ending at EOF (Ctrl+D). */
async function* realStdinLines(): AsyncIterable<string> {
  const rl = readline.createInterface({ input: process.stdin });
  for await (const line of rl) {
    yield line;
  }
}

/** Writes a line to the real process stdout. */
function realOutputWrite(s: string): void {
  process.stdout.write(s + "\n");
}

/**
 * Written before the first input and again after every result, so a
 * human at the terminal can tell an answer has finished and the next
 * question can be typed — without this, a multi-line answer and the
 * start of a new question were visually indistinguishable.
 */
export const PROMPT = "> ";

/**
 * Runs the REPL loop: read a line, pass it to `handleInput`, write the
 * result, repeat until the input source is exhausted (EOF).
 *
 * If `handleInput` rejects, the error is written as a line (so a long-
 * running debug session can see what went wrong) and the loop continues
 * with the next line — one bad turn shouldn't kill the whole session.
 *
 * @param handleInput - Turns one line of input into one line of output.
 *   Knows nothing about this being a terminal.
 * @param io - Test seam. Defaults to real stdin/stdout when omitted.
 */
export async function startTerminalRepl(
  handleInput: (input: string) => Promise<string>,
  io?: { input?: AsyncIterable<string>; output?: { write(s: string): void } },
): Promise<void> {
  const input = io?.input ?? realStdinLines();
  const output = io?.output ?? { write: realOutputWrite };

  output.write(PROMPT);
  for await (const line of input) {
    try {
      const result = await handleInput(line);
      output.write(result);
    } catch (err) {
      output.write(`error: ${String(err instanceof Error ? err.message : err)}`);
    }
    output.write(PROMPT);
  }
}
