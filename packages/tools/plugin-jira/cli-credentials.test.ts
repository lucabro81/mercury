import { describe, expect, test } from "bun:test";
import { readCliCredentials } from "@mercury-fw/utils";
import pkg from "./package.json" with { type: "json" };

/**
 * The plugin's CLI keeps its login in ~/.config/jira-cli, and the plugin declares
 * it in its package.json: what `mfw credentials` and the core read to carry
 * that login into the container.
 */
describe("mercury.cliCredentials", () => {
  test("declares the CLI's login folder", () => {
    expect(readCliCredentials(pkg)).toEqual({ name: "jira-cli", path: ".config/jira-cli" });
  });
});
