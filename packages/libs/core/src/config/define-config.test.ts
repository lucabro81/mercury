/**
 * Tests for the composition config helper. `defineMercuryConfig` is a pure
 * identity+typing helper — it must hand back exactly what it was given, adding
 * no runtime behavior. The companion regression that pins a concrete instance's
 * declared plugin set lives with that instance (`apps/mercury`), not here: the
 * core is agnostic to which plugins any app composes.
 */
import { describe, expect, test } from "bun:test";
import { defineMercuryConfig } from "./define-config.ts";

describe("defineMercuryConfig", () => {
  test("returns its input unchanged (same reference)", () => {
    const input = { plugins: [] };
    expect(defineMercuryConfig(input)).toBe(input);
  });

  test("carries the declared plugins through verbatim", () => {
    const a = { apiVersion: 1, name: "a", cliConfig: {} };
    const b = { apiVersion: 1, name: "b", cliConfig: {} };
    const config = defineMercuryConfig({ plugins: [a, b] });
    expect(config.plugins).toEqual([a, b]);
  });
});
