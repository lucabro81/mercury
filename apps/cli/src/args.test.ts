/**
 * Parsing `mercury create`'s arguments: the target folder, the answers given as
 * flags (so the wizard can be skipped, or pre-filled), and the errors for a
 * command line that can't work.
 */
import { describe, expect, test } from "bun:test";
import { parseCreateArgs } from "./args.ts";

describe("parseCreateArgs", () => {
  test("the folder alone: nothing answered, wizard not skipped", () => {
    expect(parseCreateArgs(["my-app"])).toEqual({ dir: "my-app", yes: false });
  });

  test("every flag", () => {
    expect(
      parseCreateArgs([
        "apps/demo",
        "--name",
        "demo",
        "--assistant-name",
        "Hermes",
        "--role",
        "the release assistant",
        "--channels",
        "http,google-chat",
        "--plugins",
        "jira",
        "--yes",
      ]),
    ).toEqual({
      dir: "apps/demo",
      name: "demo",
      assistantName: "Hermes",
      role: "the release assistant",
      channels: ["http", "google-chat"],
      plugins: ["jira"],
      yes: true,
    });
  });

  test("lists tolerate spaces and empty items; an empty list means none", () => {
    expect(parseCreateArgs(["d", "--channels", " http , ", "--plugins", ""])).toMatchObject({
      channels: ["http"],
      plugins: [],
    });
  });

  test("-y is --yes", () => {
    expect(parseCreateArgs(["d", "-y"]).yes).toBe(true);
  });

  test("no folder is an error", () => {
    expect(() => parseCreateArgs([])).toThrow("folder");
  });

  test("two folders are an error", () => {
    expect(() => parseCreateArgs(["a", "b"])).toThrow("one folder");
  });

  test("an unknown flag is an error", () => {
    expect(() => parseCreateArgs(["d", "--frobnicate"])).toThrow("frobnicate");
  });
});
