/**
 * Regression over this instance's composition: `mercury.config.ts` must declare
 * the plugin and channel set Comperio's Mercury composes — the pin on which
 * plugins load and in what order. It lives with the app, not with `@mercury/core`:
 * the core is agnostic to which plugins any instance wires; this asserts the
 * concrete choice of *this* instance.
 */
import { describe, expect, test } from "bun:test";
import mercuryConfig from "../mercury.config.ts";

describe("mercury.config.ts", () => {
  test("declares this instance's tool plugin set, in order", () => {
    expect(mercuryConfig.plugins.map((p) => p.name)).toEqual(["jira", "bitbucket", "atlassian-admin"]);
  });

  test("declares this instance's channel plugin set", () => {
    expect((mercuryConfig.channels ?? []).map((c) => c.name)).toEqual(["google-chat", "http"]);
  });
});
