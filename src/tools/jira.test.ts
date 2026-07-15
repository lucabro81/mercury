import { describe, it, expect } from "bun:test";
import { isAllowed } from "./jira.ts";

describe("isAllowed", () => {
  it("allows read-only subcommands", () => {
    expect(isAllowed(["issue", "search", "--jql", "project=KAN"])).toBe(true);
    expect(isAllowed(["issue", "get", "KAN-42"])).toBe(true);
    expect(isAllowed(["issue", "transitions", "KAN-42"])).toBe(true);
    expect(isAllowed(["doctor"])).toBe(true);
    expect(isAllowed(["auth", "whoami"])).toBe(true);
  });

  it("rejects write subcommands", () => {
    expect(isAllowed(["issue", "delete", "KAN-1", "--confirm"])).toBe(false);
    expect(isAllowed(["issue", "create", "--project", "KAN"])).toBe(false);
    expect(isAllowed(["issue", "transition", "KAN-1", "--to", "Done"])).toBe(
      false,
    );
    expect(isAllowed(["issue", "comment", "add", "KAN-1"])).toBe(false);
  });

  it("always allows --help, even on a write subcommand", () => {
    expect(isAllowed(["issue", "create", "--help"])).toBe(true);
    expect(isAllowed(["--help"])).toBe(true);
  });

  // Regression: jira's --select is a global flag, documented (top-level
  // --help: "Usage: jira [OPTIONS] <COMMAND>") to come BEFORE the
  // subcommand, not just after. Observed for real: the model called
  // ["--select", "issues.key", "issue", "search", "--jql", "..."] for an
  // ordinary read query, and the old positional-prefix check rejected it
  // as "not permitted" since args[0] was "--select", not "issue".
  it("allows a read-only subcommand even when --select appears before it", () => {
    expect(
      isAllowed(["--select", "issues.key,issues.fields.summary", "issue", "search", "--jql", "project=KAN"]),
    ).toBe(true);
    expect(isAllowed(["--select", "id", "doctor"])).toBe(true);
  });

  it("still rejects a write subcommand when --select appears before it", () => {
    expect(isAllowed(["--select", "id", "issue", "delete", "KAN-1", "--confirm"])).toBe(false);
  });
});
