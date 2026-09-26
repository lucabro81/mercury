/**
 * Tests for the composition config helper and the instance's `mercury.config.ts`.
 * Two concerns: `defineMercuryConfig` is a pure identity+typing helper (it must
 * hand back exactly what it was given, adding no runtime behavior), and the
 * app-root `mercury.config.ts` must declare the plugin set this instance
 * composes — the regression that pins which plugins load and in what order.
 */
import { describe, expect, test } from "bun:test";
import { defineMercuryConfig } from "./define-config.ts";
import mercuryConfig from "../../mercury.config.ts";

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

describe("mercury.config.ts", () => {
  test("declares this instance's tool plugin set, in order", () => {
    expect(mercuryConfig.plugins.map((p) => p.name)).toEqual(["jira", "bitbucket", "atlassian-admin"]);
  });

  test("declares this instance's channel plugin set", () => {
    expect((mercuryConfig.channels ?? []).map((c) => c.name)).toEqual(["google-chat"]);
  });
});
