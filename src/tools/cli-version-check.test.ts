import { describe, it, expect } from "bun:test";
import { parseVersion, compareVersions, checkCliVersion } from "./cli-version-check.ts";
import type { CliResult } from "./cli-executor.ts";

describe("parseVersion", () => {
  it("extracts major.minor.patch from typical --version output", () => {
    expect(parseVersion("jira-cli 1.4.2")).toEqual({ major: 1, minor: 4, patch: 2 });
  });

  it("extracts from a bare version string", () => {
    expect(parseVersion("1.4.2")).toEqual({ major: 1, minor: 4, patch: 2 });
  });

  it("extracts from a version string with trailing metadata", () => {
    expect(parseVersion("jira-cli 1.4.2 (abcdef)")).toEqual({ major: 1, minor: 4, patch: 2 });
  });

  it("returns null when no version pattern is present", () => {
    expect(parseVersion("jira-cli")).toBeNull();
    expect(parseVersion("")).toBeNull();
  });
});

describe("compareVersions", () => {
  it("returns 0 for equal versions", () => {
    expect(compareVersions({ major: 1, minor: 4, patch: 2 }, { major: 1, minor: 4, patch: 2 })).toBe(0);
  });

  it("compares by major first", () => {
    expect(compareVersions({ major: 2, minor: 0, patch: 0 }, { major: 1, minor: 9, patch: 9 })).toBe(1);
    expect(compareVersions({ major: 1, minor: 9, patch: 9 }, { major: 2, minor: 0, patch: 0 })).toBe(-1);
  });

  it("compares by minor when major is equal", () => {
    expect(compareVersions({ major: 1, minor: 5, patch: 0 }, { major: 1, minor: 4, patch: 9 })).toBe(1);
    expect(compareVersions({ major: 1, minor: 4, patch: 9 }, { major: 1, minor: 5, patch: 0 })).toBe(-1);
  });

  it("compares by patch when major and minor are equal", () => {
    expect(compareVersions({ major: 1, minor: 4, patch: 3 }, { major: 1, minor: 4, patch: 2 })).toBe(1);
    expect(compareVersions({ major: 1, minor: 4, patch: 2 }, { major: 1, minor: 4, patch: 3 })).toBe(-1);
  });
});

describe("checkCliVersion", () => {
  it("passes when the installed version meets minVersion", async () => {
    const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: "jira-cli 1.5.0" });
    const result = await checkCliVersion("jira", "1.4.0", runCliFn);
    expect(result).toEqual({ ok: true });
  });

  it("passes when the installed version exactly equals minVersion", async () => {
    const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: "jira-cli 1.4.0" });
    const result = await checkCliVersion("jira", "1.4.0", runCliFn);
    expect(result).toEqual({ ok: true });
  });

  it("calls runCliFn with --version", async () => {
    let receivedBinary: string | undefined;
    let receivedArgs: string[] | undefined;
    const runCliFn = async (binary: string, args: string[]): Promise<CliResult> => {
      receivedBinary = binary;
      receivedArgs = args;
      return { ok: true, data: "jira-cli 1.5.0" };
    };
    await checkCliVersion("jira", "1.4.0", runCliFn);
    expect(receivedBinary).toBe("jira");
    expect(receivedArgs).toEqual(["--version"]);
  });

  it("fails closed when the installed version is below minVersion", async () => {
    const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: "jira-cli 1.2.0" });
    const result = await checkCliVersion("jira", "1.4.0", runCliFn);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain("1.2.0");
      expect(result.reason).toContain("1.4.0");
    }
  });

  it("fails closed when the CLI invocation itself fails", async () => {
    const runCliFn = async (): Promise<CliResult> => ({ ok: false, error: "jira: command not found" });
    const result = await checkCliVersion("jira", "1.4.0", runCliFn);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain("jira: command not found");
    }
  });

  it("fails closed when the version output can't be parsed", async () => {
    const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: "no version here" });
    const result = await checkCliVersion("jira", "1.4.0", runCliFn);
    expect(result.ok).toBe(false);
  });

  // runCli's CliResult.data is `unknown` — if --version output happened to
  // parse as JSON (e.g. a bare number), coerce to string before matching
  // rather than crashing on a non-string value.
  it("fails closed (without throwing) when data isn't a string", async () => {
    const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: { unexpected: true } });
    const result = await checkCliVersion("jira", "1.4.0", runCliFn);
    expect(result.ok).toBe(false);
  });

  it("fails closed, without ever calling runCliFn, when minVersion itself is malformed", async () => {
    let called = false;
    const runCliFn = async (): Promise<CliResult> => {
      called = true;
      return { ok: true, data: "jira-cli 1.5.0" };
    };
    const result = await checkCliVersion("jira", "latest", runCliFn);
    expect(called).toBe(false);
    expect(result.ok).toBe(false);
  });
});
