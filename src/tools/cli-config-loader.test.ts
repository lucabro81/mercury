import { describe, it, expect } from "bun:test";
import {
  loadCliConfigFile,
  toCliConfig,
  loadCliConfig,
  loadActiveCliConfigs,
} from "./cli-config-loader.ts";
import type { CliResult } from "./cli-executor.ts";

const FIXTURES = new URL("./__fixtures__/cli-config-loader/", import.meta.url).pathname;

describe("loadCliConfigFile", () => {
  it("parses a valid config file", async () => {
    const result = await loadCliConfigFile(`${FIXTURES}fakecli.json`);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.raw.binary).toBe("fakecli");
    }
  });

  it("fails closed when the file doesn't exist", async () => {
    const result = await loadCliConfigFile(`${FIXTURES}does-not-exist.json`);
    expect(result.ok).toBe(false);
  });

  it("fails closed on invalid JSON", async () => {
    const result = await loadCliConfigFile(`${FIXTURES}not-json.json`);
    expect(result.ok).toBe(false);
  });

  it("fails closed on a schema violation", async () => {
    const result = await loadCliConfigFile(`${FIXTURES}broken.json`);
    expect(result.ok).toBe(false);
  });
});

describe("toCliConfig", () => {
  it("maps commands to allowedPrefixes and passes globalFlags through", () => {
    const config = toCliConfig({
      binary: "fakecli",
      commands: [
        { prefix: ["doctor"], confirm: false },
        { prefix: ["issue", "delete"], confirm: true },
      ],
      globalFlags: [{ flag: "--select", takesValue: true }],
    });
    expect(config).toEqual({
      allowedPrefixes: [
        { prefix: ["doctor"], confirm: false },
        { prefix: ["issue", "delete"], confirm: true },
      ],
      globalFlags: [{ flag: "--select", takesValue: true }],
    });
  });

  it("maps a file with no globalFlags to an undefined globalFlags", () => {
    const config = toCliConfig({
      binary: "fakecli",
      commands: [{ prefix: ["doctor"], confirm: false }],
    });
    expect(config.globalFlags).toBeUndefined();
  });
});

describe("loadCliConfig", () => {
  it("returns a mapped CliConfig for a valid file with no minVersion, never calling runCliFn", async () => {
    let called = false;
    const runCliFn = async (): Promise<CliResult> => {
      called = true;
      return { ok: true, data: "fakecli 1.0.0" };
    };
    const result = await loadCliConfig("fakecli", { configDir: FIXTURES.replace(/\/$/, ""), runCliFn });
    expect(called).toBe(false);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config.allowedPrefixes).toEqual([
        { prefix: ["doctor"], confirm: false },
        { prefix: ["issue", "delete"], confirm: true },
      ]);
    }
  });

  it("fails closed when the declared binary doesn't match the requested name", async () => {
    const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: "x 1.0.0" });
    const result = await loadCliConfig("mismatched", { configDir: FIXTURES.replace(/\/$/, ""), runCliFn });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain("mismatched");
    }
  });

  it("fails closed on a schema violation", async () => {
    const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: "x 1.0.0" });
    const result = await loadCliConfig("broken", { configDir: FIXTURES.replace(/\/$/, ""), runCliFn });
    expect(result.ok).toBe(false);
  });

  it("fails closed when the file doesn't exist", async () => {
    const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: "x 1.0.0" });
    const result = await loadCliConfig("nope", { configDir: FIXTURES.replace(/\/$/, ""), runCliFn });
    expect(result.ok).toBe(false);
  });

  it("runs the version check when minVersion is present, and succeeds when satisfied", async () => {
    const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: "versioned 1.2.0" });
    const result = await loadCliConfig("versioned", { configDir: FIXTURES.replace(/\/$/, ""), runCliFn });
    expect(result.ok).toBe(true);
  });

  it("fails closed when the installed version doesn't satisfy minVersion", async () => {
    const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: "versioned 0.5.0" });
    const result = await loadCliConfig("versioned", { configDir: FIXTURES.replace(/\/$/, ""), runCliFn });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain("0.5.0");
    }
  });
});

describe("loadActiveCliConfigs", () => {
  it("returns only successfully-loaded CLIs, logging a reason for each failure", async () => {
    const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: "x 1.0.0" });
    const logs: string[] = [];
    const result = await loadActiveCliConfigs(["fakecli", "broken", "nope"], {
      configDir: FIXTURES.replace(/\/$/, ""),
      runCliFn,
      log: (msg) => logs.push(msg),
    });

    expect(Object.keys(result)).toEqual(["fakecli"]);
    expect(logs.length).toBe(2);
    expect(logs.some((l) => l.includes("broken"))).toBe(true);
    expect(logs.some((l) => l.includes("nope"))).toBe(true);
  });

  it("returns an empty map for an empty list", async () => {
    const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: "x 1.0.0" });
    const result = await loadActiveCliConfigs([], { configDir: FIXTURES.replace(/\/$/, ""), runCliFn });
    expect(result).toEqual({});
  });

  it("loads multiple CLIs independently", async () => {
    const runCliFn = async (): Promise<CliResult> => ({ ok: true, data: "x 1.2.0" });
    const result = await loadActiveCliConfigs(["fakecli", "versioned"], {
      configDir: FIXTURES.replace(/\/$/, ""),
      runCliFn,
    });
    expect(Object.keys(result).sort()).toEqual(["fakecli", "versioned"]);
  });
});
