import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { getOllamaProvider } from "./client.ts";

describe("getOllamaProvider", () => {
  const originalHost = process.env.OLLAMA_HOST;

  beforeEach(() => {
    delete process.env.OLLAMA_HOST;
  });

  afterEach(() => {
    if (originalHost === undefined) {
      delete process.env.OLLAMA_HOST;
    } else {
      process.env.OLLAMA_HOST = originalHost;
    }
  });

  it("throws a descriptive error when OLLAMA_HOST is unset", () => {
    expect(() => getOllamaProvider()).toThrow(/OLLAMA_HOST/);
  });

  it("throws when OLLAMA_HOST is set to an empty string", () => {
    process.env.OLLAMA_HOST = "";
    expect(() => getOllamaProvider()).toThrow(/OLLAMA_HOST/);
  });

  it("returns a truthy provider when OLLAMA_HOST is a valid-looking URL", () => {
    process.env.OLLAMA_HOST = "http://localhost:11434";
    expect(getOllamaProvider()).toBeTruthy();
  });
});
