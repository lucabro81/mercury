/**
 * The folder a new app is created in is named in kebab case, whatever was
 * typed: lowercase ASCII letters and digits, words joined by single hyphens.
 */
import { describe, expect, test } from "bun:test";
import { kebabCase } from "./naming.ts";

describe("kebabCase", () => {
  test.each([
    ["my-app", "my-app"],
    ["My App", "my-app"],
    ["MyApp", "my-app"],
    ["myHTTPApp", "my-http-app"],
    ["my_app", "my-app"],
    ["comperio.mercury", "comperio-mercury"],
    ["  spaced   out  ", "spaced-out"],
    ["--edge--", "edge"],
    ["Città Nuova", "citta-nuova"],
    ["app2 v3", "app2-v3"],
    ["mercury@home!", "mercury-home"],
  ])("%p → %p", (input, expected) => {
    expect(kebabCase(input)).toBe(expected);
  });

  test("nothing usable left is the empty string", () => {
    expect(kebabCase("!!!")).toBe("");
    expect(kebabCase("")).toBe("");
  });
});
