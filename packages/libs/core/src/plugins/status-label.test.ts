import { describe, it, expect } from "bun:test";
import { defaultStatusLabel } from "@mercury/plugin-types";

/**
 * The contract-level default status label — what every CLI command's status
 * reads as unless a plugin overrides it with its own `describeStatus`. The
 * point of 3.3 is that the core no longer classifies read vs write; this plain
 * "esecuzione <binary> <sottocomando>" is the plugin-layer default the core
 * merely transports. The subcommand is the leading non-flag tokens, capped at
 * two (the command + subcommand depth), so positional args and flags don't
 * leak into the label.
 */
describe("defaultStatusLabel", () => {
  it("names the binary and its subcommand, dropping flags and their values", () => {
    expect(defaultStatusLabel({ binary: "jira", args: ["issue", "search", "--jql", "X"], mutating: false })).toBe(
      "esecuzione jira issue search",
    );
  });

  it("caps the subcommand at two leading tokens, so positional args don't leak in", () => {
    expect(defaultStatusLabel({ binary: "bitbucket", args: ["pr", "list", "workspace/repo"], mutating: false })).toBe(
      "esecuzione bitbucket pr list",
    );
    expect(defaultStatusLabel({ binary: "jira", args: ["issue", "delete", "KAN-1"], mutating: true })).toBe(
      "esecuzione jira issue delete",
    );
  });

  it("handles a single-token subcommand and an empty argument list", () => {
    expect(defaultStatusLabel({ binary: "bitbucket", args: ["doctor"], mutating: false })).toBe(
      "esecuzione bitbucket doctor",
    );
    expect(defaultStatusLabel({ binary: "bitbucket", args: [], mutating: false })).toBe("esecuzione bitbucket");
  });

  it("ignores the mutating flag — read vs write is not the default's concern", () => {
    expect(defaultStatusLabel({ binary: "jira", args: ["issue", "create"], mutating: true })).toBe(
      "esecuzione jira issue create",
    );
  });
});
