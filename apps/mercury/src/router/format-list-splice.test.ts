import { describe, it, expect } from "bun:test";
import { collectDisplayStrings, spliceFormattedLists } from "./format-list-splice.ts";
import type { StepInfo } from "../session/step-info.ts";

function step(toolResults: StepInfo["toolResults"]): StepInfo {
  return { toolCalls: [], toolResults, content: [] };
}

describe("spliceFormattedLists", () => {
  it("appends a list not present in the text", () => {
    expect(spliceFormattedLists("Here you go.", ["MER-1\nhttps://x"])).toBe("Here you go.\n\nMER-1\nhttps://x");
  });

  it("leaves the text unchanged when the list is already present verbatim", () => {
    const text = "Here they are:\n\nMER-1\nhttps://x";
    expect(spliceFormattedLists(text, ["MER-1\nhttps://x"])).toBe(text);
  });

  it("appends both lists, in order, when neither is present", () => {
    expect(spliceFormattedLists("Done.", ["list-a", "list-b"])).toBe("Done.\n\nlist-a\n\nlist-b");
  });

  it("appends only the missing list when the other is already present", () => {
    expect(spliceFormattedLists("Here: list-a", ["list-a", "list-b"])).toBe("Here: list-a\n\nlist-b");
  });

  it("returns the text unchanged when there are no lists to splice", () => {
    expect(spliceFormattedLists("Nothing to add here.", [])).toBe("Nothing to add here.");
  });

  it("returns just the list when the text is empty", () => {
    expect(spliceFormattedLists("", ["MER-1\nhttps://x"])).toBe("MER-1\nhttps://x");
  });
});

describe("collectDisplayStrings", () => {
  it("collects the already-rendered string block off a display", () => {
    const steps = [
      step([{ toolCallId: "1", toolName: "runCommand", output: { ok: true, data: {}, display: { type: "issue-list", items: ["MER-1\nhttps://x\n\nMER-2\nhttps://y"] } } }]),
    ];
    expect(collectDisplayStrings(steps)).toEqual(["MER-1\nhttps://x\n\nMER-2\nhttps://y"]);
  });

  it("does no rendering of its own — it collects string items verbatim, without joining", () => {
    // Post-decoration a display carries a single rendered block; the core never
    // joins. Two string items would be collected as two separate strings — the
    // core is not where the blank-line join happens (that is the handler's job).
    const steps = [
      step([{ toolCallId: "1", toolName: "runCommand", output: { ok: true, data: {}, display: { type: "issue-list", items: ["a", "b"] } } }]),
    ];
    expect(collectDisplayStrings(steps)).toEqual(["a", "b"]);
  });

  it("ignores structured (non-string) items — a display no formatter was applied to contributes nothing", () => {
    const steps = [
      step([{ toolCallId: "1", toolName: "runCommand", output: { ok: true, data: {}, display: { type: "issue-list", items: [{ key: "MER-1" }] } } }]),
    ];
    expect(collectDisplayStrings(steps)).toEqual([]);
  });

  it("does not key on display.type — a string item is collected whatever the type", () => {
    const steps = [
      step([{ toolCallId: "1", toolName: "runCommand", output: { ok: true, data: {}, display: { type: "pr-list", items: ["rendered"] } } }]),
    ];
    expect(collectDisplayStrings(steps)).toEqual(["rendered"]);
  });

  it("returns nothing for a result that carries only a model-facing note and no display", () => {
    const steps = [
      step([{ toolCallId: "1", toolName: "runCommand", output: { ok: true, data: { formattedListNote: "retry with --select-all" } } }]),
    ];
    expect(collectDisplayStrings(steps)).toEqual([]);
  });

  it("returns nothing and does not throw for a non-Jira tool result with no display field", () => {
    const steps = [step([{ toolCallId: "1", toolName: "recall_tool_calls", output: { entries: [] } }])];
    expect(collectDisplayStrings(steps)).toEqual([]);
  });

  it("returns nothing and does not throw for output that isn't an object", () => {
    const steps = [step([{ toolCallId: "1", toolName: "runCommand", output: "plain string output" }])];
    expect(collectDisplayStrings(steps)).toEqual([]);
  });

  it("collects distinct blocks from two tool calls, in encounter order, across steps", () => {
    const steps = [
      step([{ toolCallId: "1", toolName: "runCommand", output: { ok: true, data: {}, display: { type: "issue-list", items: ["list-a"] } } }]),
      step([{ toolCallId: "2", toolName: "runCommand", output: { ok: true, data: {}, display: { type: "issue-list", items: ["list-b"] } } }]),
    ];
    expect(collectDisplayStrings(steps)).toEqual(["list-a", "list-b"]);
  });

  it("dedupes when two displays carry the same string block", () => {
    const steps = [
      step([
        { toolCallId: "1", toolName: "runCommand", output: { ok: true, data: {}, display: { type: "issue-list", items: ["list-a"] } } },
        { toolCallId: "2", toolName: "runCommand", output: { ok: true, data: {}, display: { type: "issue-list", items: ["list-a"] } } },
      ]),
    ];
    expect(collectDisplayStrings(steps)).toEqual(["list-a"]);
  });
});
