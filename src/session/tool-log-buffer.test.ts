import { describe, it, expect, beforeEach } from "bun:test";
import { recordStep, getToolLog, resetToolLogForTest } from "./tool-log-buffer.ts";
import type { StepInfo } from "./agent-turn.ts";

function stepWithOneCall(toolName: string, output: unknown): StepInfo {
  return {
    toolCalls: [{ toolCallId: "call-1", toolName, input: { x: 1 } }],
    toolResults: [{ toolCallId: "call-1", toolName, output }],
    content: [],
  };
}

describe("recordStep / getToolLog", () => {
  beforeEach(() => {
    resetToolLogForTest();
  });

  it("returns only entries matching the given sessionKey", () => {
    recordStep("google-chat", "space-A:user-1", stepWithOneCall("runCommand", { ok: true }));
    recordStep("google-chat", "space-B:user-2", stepWithOneCall("runCommand", { ok: true }));

    const entries = getToolLog({ sessionKey: "space-A:user-1" });

    expect(entries).toHaveLength(1);
    expect(entries[0]?.toolName).toBe("runCommand");
  });

  it("returns everything when no filter is given", () => {
    recordStep("terminal", "terminal", stepWithOneCall("runCommand", { ok: true }));
    recordStep("google-chat", "space-A:user-1", stepWithOneCall("write_file", { ok: true }));

    expect(getToolLog()).toHaveLength(2);
  });

  it("orders results most-recent-first regardless of sessionKey filtering", () => {
    recordStep("terminal", "terminal", stepWithOneCall("first", { ok: true }));
    recordStep("terminal", "terminal", stepWithOneCall("second", { ok: true }));

    const entries = getToolLog({ sessionKey: "terminal" });

    expect(entries.map((e) => e.toolName)).toEqual(["second", "first"]);
  });

  it("evicts the oldest entry once the buffer exceeds its max size", () => {
    for (let i = 0; i < 205; i++) {
      recordStep("terminal", "terminal", stepWithOneCall(`tool-${i}`, { ok: true }));
    }

    const entries = getToolLog();

    expect(entries).toHaveLength(200);
    expect(entries[0]?.toolName).toBe("tool-204");
    expect(entries.at(-1)?.toolName).toBe("tool-5");
  });
});
