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
  it("renders the display channel of a single tool result", () => {
    const steps = [
      step([{ toolCallId: "1", toolName: "runCommand", output: { ok: true, data: {}, display: { type: "issue-list", items: ["MER-1"] } } }]),
    ];
    expect(collectDisplayStrings(steps)).toEqual(["MER-1"]);
  });

  it("joins an issue-list display's item lines with a blank line between them", () => {
    const steps = [
      step([
        {
          toolCallId: "1",
          toolName: "runCommand",
          output: { ok: true, data: {}, display: { type: "issue-list", items: ["MER-1\nhttps://x", "MER-2\nhttps://y"] } },
        },
      ]),
    ];
    expect(collectDisplayStrings(steps)).toEqual(["MER-1\nhttps://x\n\nMER-2\nhttps://y"]);
  });

  it("renders an empty issue-list display as the empty-set sentence", () => {
    const steps = [
      step([{ toolCallId: "1", toolName: "runCommand", output: { ok: true, data: {}, display: { type: "issue-list", items: [] } } }]),
    ];
    expect(collectDisplayStrings(steps)).toEqual(["No matching issues."]);
  });

  it("returns nothing for a result that carries only a model-facing note and no display", () => {
    const steps = [
      step([{ toolCallId: "1", toolName: "runCommand", output: { ok: true, data: { formattedListNote: "retry with --select-all" } } }]),
    ];
    expect(collectDisplayStrings(steps)).toEqual([]);
  });

  it("skips a display whose type has no registered renderer", () => {
    const steps = [
      step([{ toolCallId: "1", toolName: "runCommand", output: { ok: true, data: {}, display: { type: "unknown-kind", items: ["x"] } } }]),
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

  it("collects distinct renderings from two tool calls, in encounter order, across steps", () => {
    const steps = [
      step([{ toolCallId: "1", toolName: "runCommand", output: { ok: true, data: {}, display: { type: "issue-list", items: ["list-a"] } } }]),
      step([{ toolCallId: "2", toolName: "runCommand", output: { ok: true, data: {}, display: { type: "issue-list", items: ["list-b"] } } }]),
    ];
    expect(collectDisplayStrings(steps)).toEqual(["list-a", "list-b"]);
  });

  it("dedupes when two displays render to the same string", () => {
    const steps = [
      step([
        { toolCallId: "1", toolName: "runCommand", output: { ok: true, data: {}, display: { type: "issue-list", items: ["list-a"] } } },
        { toolCallId: "2", toolName: "runCommand", output: { ok: true, data: {}, display: { type: "issue-list", items: ["list-a"] } } },
      ]),
    ];
    expect(collectDisplayStrings(steps)).toEqual(["list-a"]);
  });
});
