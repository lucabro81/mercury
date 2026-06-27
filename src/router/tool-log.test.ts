import { describe, it, expect, afterEach } from "bun:test";
import { unlink } from "node:fs/promises";
import { truncateForDisplay, parseDumpCommand, writeDump, defaultDumpPath } from "./tool-log.ts";
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
  // Each call without an explicit path must land in its own file —
  // a fixed default name would silently overwrite the previous dump.
  it("includes a filesystem-safe timestamp derived from the given date", () => {
    const now = new Date("2026-06-27T14:03:22.123Z");
    expect(defaultDumpPath(now)).toBe("mercury-last-tools-2026-06-27T14-03-22-123Z.json");
  });

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
      },
    ];

    await writeDump(path, steps);

    const written = await Bun.file(path).text();
    expect(written).toContain("\n  "); // indented, not a single minified line
    expect(JSON.parse(written)).toEqual(steps);
  });
});
