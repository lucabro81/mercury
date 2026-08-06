import { describe, it, expect } from "bun:test";
import { collectFormattedLists, spliceFormattedLists } from "./format-list-splice.ts";
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

describe("collectFormattedLists", () => {
  it("returns the formattedList from a single tool result", () => {
    const steps = [step([{ toolCallId: "1", toolName: "runCommand", output: { ok: true, data: { formattedList: "MER-1" } } }])];
    expect(collectFormattedLists(steps)).toEqual(["MER-1"]);
  });

  it("returns nothing for a formattedListNote-only result", () => {
    const steps = [
      step([{ toolCallId: "1", toolName: "runCommand", output: { ok: true, data: { formattedListNote: "retry with --select-all" } } }]),
    ];
    expect(collectFormattedLists(steps)).toEqual([]);
  });

  it("returns nothing and does not throw for a non-Jira tool result with no data field", () => {
    const steps = [step([{ toolCallId: "1", toolName: "recall_tool_calls", output: { entries: [] } }])];
    expect(collectFormattedLists(steps)).toEqual([]);
  });

  it("returns nothing and does not throw for output that isn't an object", () => {
    const steps = [step([{ toolCallId: "1", toolName: "runCommand", output: "plain string output" }])];
    expect(collectFormattedLists(steps)).toEqual([]);
  });

  it("collects distinct lists from two tool calls, in encounter order, across steps", () => {
    const steps = [
      step([{ toolCallId: "1", toolName: "runCommand", output: { ok: true, data: { formattedList: "list-a" } } }]),
      step([{ toolCallId: "2", toolName: "runCommand", output: { ok: true, data: { formattedList: "list-b" } } }]),
    ];
    expect(collectFormattedLists(steps)).toEqual(["list-a", "list-b"]);
  });

  it("dedupes when the same formattedList string appears across two tool calls", () => {
    const steps = [
      step([
        { toolCallId: "1", toolName: "runCommand", output: { ok: true, data: { formattedList: "list-a" } } },
        { toolCallId: "2", toolName: "runCommand", output: { ok: true, data: { formattedList: "list-a" } } },
      ]),
    ];
    expect(collectFormattedLists(steps)).toEqual(["list-a"]);
  });

  it("treats the empty-results sentinel string as a real formattedList, not as falsy/empty", () => {
    const steps = [step([{ toolCallId: "1", toolName: "runCommand", output: { ok: true, data: { formattedList: "No matching issues." } } }])];
    expect(collectFormattedLists(steps)).toEqual(["No matching issues."]);
  });
});
