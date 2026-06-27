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
 * `src/session/agent-turn.ts`). `handleInput` also receives an `onChunk`
 * callback (see `startTerminalRepl`'s doc comment) — `src/index.ts`
 * forwards it as `runTurn`'s `onTextChunk`, so a model response prints as
 * it streams in rather than going silent for however long the full
 * answer takes.
 */
import * as readline from "node:readline";

/**
 * Writes to the real process stdout. Appends a newline by default — the
 * prompt is the one caller that passes `{ newline: false }`, since it
 * must stay on the same line as whatever the user types next.
 */
function realOutputWrite(s: string, opts?: { newline?: boolean }): void {
  process.stdout.write(opts?.newline === false ? s : s + "\n");
}

/** Never yields — the input source for when there's no real terminal to read from. */
async function* noInput(): AsyncIterable<string> {}

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
 *   Knows nothing about this being a terminal. Receives `onChunk`, which
 *   it may call zero or more times with pieces of the answer as they
 *   become available (e.g. while streaming a model response) — each
 *   call is written immediately, without waiting for `handleInput` to
 *   resolve. If `onChunk` is never called, the function's returned
 *   string is written instead once `handleInput` resolves, exactly as
 *   before streaming existed — this is what keeps the `/dump` command
 *   and any other non-streaming reply working unchanged.
 * @param io - Test seam. Defaults to real stdin/stdout when omitted.
 * @param opts.promptSuffix - Optional, called fresh right before every
 *   prompt (including the very first one) and written ahead of it — e.g.
 *   a live context-usage indicator (see `src/router/tool-log.ts`'s
 *   `formatContextUsage`), recomputed each time since the value changes
 *   turn to turn.
 */
export async function startTerminalRepl(
  handleInput: (input: string, onChunk: (chunk: string) => void) => Promise<string>,
  io?: {
    input?: AsyncIterable<string>;
    output?: { write(s: string, opts?: { newline?: boolean }): void };
  },
  opts?: { promptSuffix?: () => string },
): Promise<void> {
  // Real stdin, and only when it's an actual TTY: readline itself must
  // own prompt rendering (via setPrompt/prompt(), not a plain
  // output.write), or its own redraws — e.g. when the user presses an
  // arrow key to recall history — only know how to repaint the prompt
  // text *it* set, wiping out anything (like the dynamic promptSuffix
  // below) written outside of it.
  //
  // Without the isTTY guard, creating this against Docker's detached
  // (no terminal attached) stdin crashed the whole process on startup —
  // observed live: `AbortError: Stream reader cancelled via
  // releaseLock()`, thrown from inside readline's own stream handling
  // against that kind of stdin, not something this file can catch
  // around. There's no one to type arrow keys for in that case anyway —
  // falling back to `noInput()` ends this REPL's loop immediately and
  // lets whatever else (e.g. the Google Chat channel) keeps the process
  // alive run as a background-only instance.
  const isInteractive = !io?.input && process.stdin.isTTY;
  const rl = isInteractive
    ? readline.createInterface({ input: process.stdin, output: process.stdout })
    : null;
  const input = io?.input ?? rl ?? noInput();
  const output = io?.output ?? { write: realOutputWrite };

  const writePrompt = () => {
    const suffix = opts?.promptSuffix?.() ?? "";
    if (rl) {
      rl.setPrompt(suffix + PROMPT);
      rl.prompt();
      return;
    }
    if (suffix) {
      output.write(suffix, { newline: false });
    }
    output.write(PROMPT, { newline: false });
  };

  writePrompt();
  for await (const line of input) {
    let streamed = false;
    const onChunk = (chunk: string) => {
      streamed = true;
      output.write(chunk, { newline: false });
    };
    try {
      const result = await handleInput(line, onChunk);
      // If chunks were already written live, the line just needs closing
      // with a newline — writing `result` again would duplicate the text.
      output.write(streamed ? "" : result);
    } catch (err) {
      if (streamed) {
        output.write("");
      }
      output.write(`error: ${String(err instanceof Error ? err.message : err)}`);
    }
    writePrompt();
  }
}
