/**
 * Parses a single free-text command string (as the model would type it in
 * a terminal, e.g. `jira issue search --jql "project = KAN"`) into a
 * binary name and an argv array, for the experimental command-string
 * execution model (see `src/tools/cli-tool.ts`, which consumes this).
 *
 * Quoting/escaping itself is delegated to `shell-quote`'s `parse()` — a
 * widely used, actively maintained tokenizer — rather than hand-rolled,
 * since getting POSIX-ish quote handling right from scratch is exactly the
 * kind of finicky, security-relevant code better left to a library with
 * far more scrutiny than this file would get on its own.
 *
 * `shell-quote` on its own isn't a safe-enough boundary by itself, though —
 * confirmed empirically against the installed version:
 * - It happily recognizes real shell syntax (`;`, `|`, `&&`, globs,
 *   comments) and returns non-string entries for them; a naive "keep only
 *   the strings" filter would silently drop the metacharacter and merge
 *   the rest of the command as if it had been benign.
 * - With no `env` argument it still interpolates `$VAR`/`${VAR}` against
 *   an empty environment, silently resolving every variable to `""`
 *   (`parse("echo $HOME")` -> `["echo", ""]`) instead of leaving the text
 *   alone — quiet data loss inside what looked like a literal value.
 * - It does not error on an unterminated quote; it silently treats the
 *   rest of the string as if the quote had closed at end-of-input, which
 *   for a missing closing quote around a multi-word value means it
 *   silently reverts to word-splitting instead of failing loudly.
 * - A trailing lone backslash is silently dropped rather than flagged.
 *
 * This module closes those gaps itself: reject unbalanced
 * quotes/escapes and any literal `$` before ever calling `parse()`, then
 * reject any non-string entry `parse()` returns.
 */
import { parse } from "shell-quote";

export type ParsedCommand =
  | { ok: true; binary: string; args: string[] }
  | { ok: false; error: string };

/**
 * Walks `command` tracking quote state to find an unterminated quote or a
 * dangling trailing escape — the failure modes `shell-quote`'s `parse()`
 * doesn't itself surface as errors (see this file's header comment).
 * Mirrors the quoting rules `parse()` actually implements (confirmed
 * empirically): backslash escapes the next character outside quotes and
 * inside double quotes, but is a literal character inside single quotes.
 */
function findUnbalancedQuoteOrEscape(command: string): string | null {
  let state: "bare" | "single" | "double" = "bare";
  for (let i = 0; i < command.length; i++) {
    const ch = command[i];
    if (state === "single") {
      if (ch === "'") state = "bare";
      continue;
    }
    if (ch === "\\") {
      if (i === command.length - 1) {
        return "command ends with a dangling escape character (\\)";
      }
      i++; // the escaped character is consumed as literal, whatever it is
      continue;
    }
    if (state === "double") {
      if (ch === '"') state = "bare";
      continue;
    }
    // state === "bare"
    if (ch === "'") state = "single";
    else if (ch === '"') state = "double";
  }
  if (state === "single") return "command has an unterminated single quote (')";
  if (state === "double") return 'command has an unterminated double quote (")';
  return null;
}

/**
 * Parses `command` into `{ binary, args }`. Never throws — every failure
 * mode (unbalanced quoting, a `$`, a shell operator/glob/comment, or an
 * empty result) resolves to `{ ok: false, error }` instead.
 */
export function parseCommand(command: string): ParsedCommand {
  const quoteError = findUnbalancedQuoteOrEscape(command);
  if (quoteError) {
    return { ok: false, error: quoteError };
  }

  if (command.includes("$")) {
    return {
      ok: false,
      error:
        "variable interpolation ('$') is not supported in commands — shell-quote would silently resolve it to an empty string",
    };
  }

  let entries: ReturnType<typeof parse>;
  try {
    entries = parse(command);
  } catch (err) {
    return { ok: false, error: `could not parse command: ${String(err)}` };
  }

  const tokens: string[] = [];
  for (const entry of entries) {
    if (typeof entry !== "string") {
      return {
        ok: false,
        error: `shell operators, globs, and comments are not supported in commands (found ${JSON.stringify(entry)})`,
      };
    }
    tokens.push(entry);
  }

  const [binary, ...args] = tokens;
  if (!binary) {
    return { ok: false, error: "empty command" };
  }
  return { ok: true, binary, args };
}
