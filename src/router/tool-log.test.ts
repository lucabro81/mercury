import { describe, it, expect, afterEach } from "bun:test";
import { unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import {
  truncateForDisplay,
  parseDumpCommand,
  writeDump,
  defaultDumpPath,
  describeToolOutcome,
  formatContextUsage,
} from "./tool-log.ts";
import type { StepInfo } from "../session/agent-turn.ts";

describe("truncateForDisplay", () => {
  it("returns the exact JSON unchanged when it fits within maxChars", () => {
    const result = truncateForDisplay({ ok: true }, 100);
    expect(result).toBe('{"ok":true}');
  });

  it("truncates and appends a marker mentioning the real total length when it doesn't fit", () => {
    const value = { data: "x".repeat(2000) };
    const fullJson = JSON.stringify(value);

    const result = truncateForDisplay(value, 50);

    expect(result.startsWith(fullJson.slice(0, 50))).toBe(true);
    expect(result.length).toBeLessThan(fullJson.length);
    expect(result).toContain(`${fullJson.length} chars total`);
    expect(result).toContain("/dump");
  });
});

describe("parseDumpCommand", () => {
  it("matches a bare /dump with no explicit path", () => {
    expect(parseDumpCommand("/dump")).toEqual({ path: undefined });
  });

  it("matches /dump with a custom path", () => {
    expect(parseDumpCommand("/dump out/foo.json")).toEqual({ path: "out/foo.json" });
  });

  it("returns null for regular conversation input", () => {
    expect(parseDumpCommand("what tickets are in progress?")).toBeNull();
  });

  it("returns null for a slash-prefixed word that merely starts with 'dump'", () => {
    expect(parseDumpCommand("/dumpeverything")).toBeNull();
  });
});

describe("defaultDumpPath", () => {
  // Regression: defaulted to a bare filename, written relative to the
  // process's cwd. Inside the Docker image that's /app, owned by root —
  // the `mercury` user can read/execute existing files there but can't
  // create new ones, so a bare-filename default failed with EACCES on
  // every run in the container. tmpdir() is writable by any user on both
  // the container (/tmp) and the host, so it's a safe default everywhere.
  it("lands in the OS temp directory", () => {
    const now = new Date("2026-06-27T14:03:22.123Z");
    expect(defaultDumpPath(now)).toBe(
      `${tmpdir()}/mercury-last-tools-2026-06-27T14-03-22-123Z.json`,
    );
  });

  // Each call without an explicit path must land in its own file —
  // a fixed default name would silently overwrite the previous dump.
  it("produces a different path for a different date", () => {
    const a = defaultDumpPath(new Date("2026-06-27T14:03:22.123Z"));
    const b = defaultDumpPath(new Date("2026-06-27T14:03:23.000Z"));
    expect(a).not.toBe(b);
  });
});

describe("writeDump", () => {
  const path = "/tmp/mercury-tool-log-test.json";

  afterEach(async () => {
    await unlink(path).catch(() => {});
  });

  it("writes the given steps as indented, human-readable JSON that reads back equal", async () => {
    const steps: StepInfo[] = [
      {
        toolCalls: [{ toolCallId: "1", toolName: "jiraCli", input: { args: ["doctor"] } }],
        toolResults: [{ toolCallId: "1", toolName: "jiraCli", output: { ok: true, data: {} } }],
        content: [],
      },
    ];

    await writeDump(path, steps);

    const written = await Bun.file(path).text();
    expect(written).toContain("\n  "); // indented, not a single minified line
    expect(JSON.parse(written)).toEqual(steps);
  });
});

describe("describeToolOutcome", () => {
  // Regression: a tool call that fails before ever executing (e.g.
  // malformed arguments that don't match the tool's schema) has no
  // entry in toolResults — printing "(none)" for it hid a real error
  // behind a label that looked like "nothing happened", observed live
  // right after the model sent args as a JSON string instead of an array.
  it("reports a tool-error content part for a call with no matching result", () => {
    const step: StepInfo = {
      toolCalls: [{ toolCallId: "1", toolName: "jiraCli", input: "not-an-array" }],
      toolResults: [],
      content: [{ type: "tool-error", toolCallId: "1", error: "invalid arguments" }],
    };

    expect(describeToolOutcome(step, "1", 500)).toBe(
      '[tool error] "invalid arguments"',
    );
  });

  it("reports the matching tool result when one exists", () => {
    const step: StepInfo = {
      toolCalls: [{ toolCallId: "1", toolName: "jiraCli", input: { args: ["doctor"] } }],
      toolResults: [{ toolCallId: "1", toolName: "jiraCli", output: { ok: true } }],
      content: [],
    };

    expect(describeToolOutcome(step, "1", 500)).toBe('[tool result] {"ok":true}');
  });

  it("falls back to (none) when there's neither a result nor a tool-error for that call", () => {
    const step: StepInfo = {
      toolCalls: [{ toolCallId: "1", toolName: "jiraCli", input: {} }],
      toolResults: [],
      content: [],
    };

    expect(describeToolOutcome(step, "1", 500)).toBe("[tool result] (none)");
  });
});

describe("formatContextUsage", () => {
  // The model degrading under a long multi-turn conversation is hard to
  // tell apart from "context is actually near full" by eye — this gives
  // a live char/4-token estimate next to the prompt (see src/index.ts),
  // same heuristic and threshold src/session/history.ts already uses to
  // decide when to summarize.
  it("formats a rounded k-token estimate of charCount over maxChars", () => {
    expect(formatContextUsage(12_000, 60_000)).toBe("[~3k/~15k tokens] ");
  });

  it("rounds down to 0k for a small charCount instead of showing 0.x", () => {
    expect(formatContextUsage(100, 60_000)).toBe("[~0k/~15k tokens] ");
  });
});
