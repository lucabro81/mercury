import { describe, it, expect } from "bun:test";
import { CliConfigFileSchema } from "./cli-config-schema.ts";

describe("CliConfigFileSchema", () => {
  it("accepts a minimal valid file (no minVersion, no globalFlags)", () => {
    const result = CliConfigFileSchema.safeParse({
      binary: "jira",
      commands: [{ prefix: ["doctor"], confirm: false, mutating: false }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts a full valid file", () => {
    const result = CliConfigFileSchema.safeParse({
      binary: "jira",
      minVersion: "1.4.0",
      commands: [
        { prefix: ["issue", "search"], confirm: false, mutating: false },
        { prefix: ["issue", "delete"], confirm: true, mutating: true },
      ],
      globalFlags: [{ flag: "--select", takesValue: true }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a file missing binary", () => {
    const result = CliConfigFileSchema.safeParse({
      commands: [{ prefix: ["doctor"], confirm: false }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a file missing commands", () => {
    const result = CliConfigFileSchema.safeParse({ binary: "jira" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty commands array", () => {
    const result = CliConfigFileSchema.safeParse({ binary: "jira", commands: [] });
    expect(result.success).toBe(false);
  });

  it("rejects a command with an empty prefix array", () => {
    const result = CliConfigFileSchema.safeParse({
      binary: "jira",
      commands: [{ prefix: [], confirm: false }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a command missing confirm", () => {
    const result = CliConfigFileSchema.safeParse({
      binary: "jira",
      commands: [{ prefix: ["doctor"] }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a command with a non-boolean confirm", () => {
    const result = CliConfigFileSchema.safeParse({
      binary: "jira",
      commands: [{ prefix: ["doctor"], confirm: "false" }],
    });
    expect(result.success).toBe(false);
  });

  // mutating tracks a different property than confirm: create/transition/comment
  // are confirm:false (no confirmation needed) but still mutating:true (they
  // change Jira state) — the two fields must both be present and independently
  // validated, one can't stand in for the other.
  it("rejects a command missing mutating", () => {
    const result = CliConfigFileSchema.safeParse({
      binary: "jira",
      commands: [{ prefix: ["doctor"], confirm: false }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a command with a non-boolean mutating", () => {
    const result = CliConfigFileSchema.safeParse({
      binary: "jira",
      commands: [{ prefix: ["doctor"], confirm: false, mutating: "false" }],
    });
    expect(result.success).toBe(false);
  });

  // .strict() everywhere: a maintainer typo like "prefixes" instead of
  // "prefix" must fail loudly, not silently pass through as an ignored
  // extra key.
  it("rejects an unknown top-level key", () => {
    const result = CliConfigFileSchema.safeParse({
      binary: "jira",
      commands: [{ prefix: ["doctor"], confirm: false }],
      extra: "nope",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown key inside a commands entry", () => {
    const result = CliConfigFileSchema.safeParse({
      binary: "jira",
      commands: [{ prefix: ["doctor"], confirm: false, extra: "nope" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown key inside a globalFlags entry", () => {
    const result = CliConfigFileSchema.safeParse({
      binary: "jira",
      commands: [{ prefix: ["doctor"], confirm: false }],
      globalFlags: [{ flag: "--select", takesValue: true, extra: "nope" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty binary string", () => {
    const result = CliConfigFileSchema.safeParse({
      binary: "",
      commands: [{ prefix: ["doctor"], confirm: false }],
    });
    expect(result.success).toBe(false);
  });
});
