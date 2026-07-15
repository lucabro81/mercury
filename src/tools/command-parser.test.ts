import { describe, it, expect } from "bun:test";
import { parseCommand } from "./command-parser.ts";

describe("parseCommand", () => {
  it("splits a plain command with no quoting", () => {
    expect(parseCommand("jira issue search --jql project=KAN")).toEqual({
      ok: true,
      binary: "jira",
      args: ["issue", "search", "--jql", "project=KAN"],
    });
  });

  // This is the exact case that motivated switching from a model-supplied
  // args array to a model-supplied command string: a JQL value containing
  // spaces has to survive as ONE argv token, not get split on its internal
  // spaces.
  it("keeps a double-quoted value with spaces as one token", () => {
    expect(
      parseCommand('jira issue search --jql "project = KAN"'),
    ).toEqual({
      ok: true,
      binary: "jira",
      args: ["issue", "search", "--jql", "project = KAN"],
    });
  });

  it("keeps a single-quoted value with spaces as one token", () => {
    expect(
      parseCommand("jira issue search --jql 'project = KAN'"),
    ).toEqual({
      ok: true,
      binary: "jira",
      args: ["issue", "search", "--jql", "project = KAN"],
    });
  });

  it("treats a backslash-escaped space outside quotes as a literal space in the token", () => {
    expect(
      parseCommand("google-chat subscription create --space Foo\\ Bar"),
    ).toEqual({
      ok: true,
      binary: "google-chat",
      args: ["subscription", "create", "--space", "Foo Bar"],
    });
  });

  it("keeps an escaped double quote inside a double-quoted value literal", () => {
    expect(
      parseCommand('jira issue get --raw "say \\"hi\\""'),
    ).toEqual({
      ok: true,
      binary: "jira",
      args: ["issue", "get", "--raw", 'say "hi"'],
    });
  });

  it("collapses leading, trailing, and repeated internal whitespace with no empty tokens", () => {
    expect(parseCommand("   jira    doctor   ")).toEqual({
      ok: true,
      binary: "jira",
      args: ["doctor"],
    });
  });

  it("concatenates a quoted run adjacent to an unquoted run into one token", () => {
    expect(parseCommand('jira issue get KAN-"42"')).toEqual({
      ok: true,
      binary: "jira",
      args: ["issue", "get", "KAN-42"],
    });
  });

  // shell-quote's parse() itself represents control operators as {op}
  // objects rather than strings when it recognizes shell syntax — this
  // asserts Mercury explicitly rejects them rather than silently dropping
  // them (a naive "keep only the strings" filter would have accepted
  // "jira ; rm -rf /" and quietly turned it into ["jira", "rm", "-rf", "/"]).
  it("rejects a command containing a shell control operator", () => {
    const result = parseCommand("jira issue search ; whatever");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("operator");
    }
  });

  it("rejects a command containing a pipe", () => {
    const result = parseCommand("jira issue search | whatever");
    expect(result.ok).toBe(false);
  });

  it("rejects a command containing a glob pattern", () => {
    const result = parseCommand("jira issue search *.txt");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("glob");
    }
  });

  it("rejects a command containing a shell comment", () => {
    const result = parseCommand("jira doctor #comment");
    expect(result.ok).toBe(false);
  });

  // shell-quote interpolates $VAR/${VAR} against an env lookup, and with no
  // env supplied it silently resolves every variable to "" (confirmed
  // empirically: parse("echo $HOME") -> ["echo", ""]) rather than leaving
  // the text alone or erroring. Silently turning part of a model-written
  // argument into an empty string is exactly the kind of quiet data loss
  // this tool must not allow, so any literal "$" is rejected outright
  // instead of trying to distinguish "safe" from "interpolating" usages.
  it("rejects a command containing a literal $, since shell-quote would silently interpolate it to an empty string", () => {
    const result = parseCommand('jira issue search --jql "price = $5"');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("$");
    }
  });

  // shell-quote itself does not error on an unterminated quote — it
  // silently treats the rest of the string as if the quote had been closed
  // at end-of-input (confirmed empirically: a missing closing quote around
  // a multi-word JQL value splits back into separate bare tokens instead of
  // one value, with no error signal at all). That's the one failure mode
  // this tool must catch itself, since a small model dropping a closing
  // quote is a real, expected mistake, not a hypothetical one.
  it("rejects a command with an unterminated double quote", () => {
    const result = parseCommand('jira issue search --jql "project = KAN');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("unterminated");
    }
  });

  it("rejects a command with an unterminated single quote", () => {
    const result = parseCommand("jira issue search --jql 'project = KAN");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("unterminated");
    }
  });

  // Also not surfaced as an error by shell-quote itself (confirmed
  // empirically: a trailing lone backslash is just silently dropped).
  it("rejects a command ending in a dangling escape character", () => {
    const result = parseCommand("jira issue get KAN-1\\");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("escape");
    }
  });

  it("rejects an empty command", () => {
    expect(parseCommand("")).toEqual({ ok: false, error: "empty command" });
  });

  it("rejects a whitespace-only command", () => {
    expect(parseCommand("    ")).toEqual({ ok: false, error: "empty command" });
  });

  it("rejects a command whose first token is an empty quoted string", () => {
    const result = parseCommand("'' issue search");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("empty command");
    }
  });

  it("never throws, even on adversarial input", () => {
    const adversarial = [
      "\"unterminated with a trailing \\",
      "''''''''''",
      "\\\\\\\\\\",
      "$$$$",
      "jira ; | && > < *",
      "\"$(rm -rf /)\"",
    ];
    for (const command of adversarial) {
      expect(() => parseCommand(command)).not.toThrow();
      expect(parseCommand(command).ok).toBe(false);
    }
  });
});
