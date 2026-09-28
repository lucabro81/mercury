import { describe, it, expect } from "bun:test";
import { toCliConfig, loadCliConfigFromObject } from "@mercury/cli-engine";
import type { CliResult } from "@mercury/cli-engine";

describe("toCliConfig", () => {
  it("maps commands to allowedPrefixes and passes globalFlags through", () => {
    const config = toCliConfig({
      binary: "fakecli",
      commands: [
        { prefix: ["doctor"], confirm: false, mutating: false },
        { prefix: ["issue", "delete"], confirm: true, mutating: true },
      ],
      globalFlags: [{ flag: "--select", takesValue: true }],
    });
    expect(config).toEqual({
      allowedPrefixes: [
        { prefix: ["doctor"], confirm: false, mutating: false },
        { prefix: ["issue", "delete"], confirm: true, mutating: true },
      ],
      globalFlags: [{ flag: "--select", takesValue: true }],
    });
  });

  it("maps a file with no globalFlags to an undefined globalFlags", () => {
    const config = toCliConfig({
      binary: "fakecli",
      commands: [{ prefix: ["doctor"], confirm: false, mutating: false }],
    });
    expect(config.globalFlags).toBeUndefined();
  });

  it("passes mutating through independently of confirm", () => {
    const config = toCliConfig({
      binary: "fakecli",
      commands: [{ prefix: ["issue", "create"], confirm: false, mutating: true }],
    });
    expect(config.allowedPrefixes).toEqual([{ prefix: ["issue", "create"], confirm: false, mutating: true }]);
  });

  it("passes postProcess through when declared, and leaves it undefined when not", () => {
    const config = toCliConfig({
      binary: "fakecli",
      commands: [
        { prefix: ["issue", "search"], confirm: false, mutating: false, postProcess: "issue-list" },
        { prefix: ["doctor"], confirm: false, mutating: false },
      ],
    });
    expect(config.allowedPrefixes[0]?.postProcess).toBe("issue-list");
    expect(config.allowedPrefixes[1]?.postProcess).toBeUndefined();
  });
});

// A plugin owns its allowlist as data and hands the already-parsed object over;
// the same Zod barrier and version check run, only the file read drops out.
describe("loadCliConfigFromObject", () => {
  const validRaw = {
    binary: "fakecli",
    commands: [
      { prefix: ["doctor"], confirm: false, mutating: false },
      { prefix: ["issue", "delete"], confirm: true, mutating: true },
    ],
    globalFlags: [{ flag: "--select", takesValue: true }],
  };

  it("validates a valid object and returns its binary and mapped config, never calling runCliFn without minVersion", async () => {
    let called = false;
    const runCliFn = async (): Promise<CliResult> => {
      called = true;
      return { ok: true, data: "fakecli 1.0.0" };
    };
    const result = await loadCliConfigFromObject(validRaw, { runCliFn });
    expect(called).toBe(false);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.binary).toBe("fakecli");
      expect(result.config.allowedPrefixes).toEqual([
        { prefix: ["doctor"], confirm: false, mutating: false },
        { prefix: ["issue", "delete"], confirm: true, mutating: true },
      ]);
      expect(result.config.globalFlags).toEqual([{ flag: "--select", takesValue: true }]);
    }
  });

  it("fails closed on a schema violation instead of throwing", async () => {
    const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: "x 1.0.0" });
    const result = await loadCliConfigFromObject({ binary: "x", commands: [] }, { runCliFn });
    expect(result.ok).toBe(false);
  });

  it("fails closed on an unknown extra key, same .strict() barrier as the file path", async () => {
    const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: "x 1.0.0" });
    const result = await loadCliConfigFromObject({ ...validRaw, unexpected: true }, { runCliFn });
    expect(result.ok).toBe(false);
  });

  it("runs the version check when minVersion is present, and succeeds when satisfied", async () => {
    const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: "fakecli 1.2.0" });
    const result = await loadCliConfigFromObject({ ...validRaw, minVersion: "1.0.0" }, { runCliFn });
    expect(result.ok).toBe(true);
  });

  it("fails closed when the installed version doesn't satisfy minVersion", async () => {
    const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: "fakecli 0.5.0" });
    const result = await loadCliConfigFromObject({ ...validRaw, minVersion: "1.0.0" }, { runCliFn });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain("0.5.0");
    }
  });
});
