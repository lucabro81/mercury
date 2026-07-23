import { describe, it, expect } from "bun:test";
import { setEnvValue } from "./env-file.ts";

describe("setEnvValue", () => {
  it("replaces an existing key's value, leaving every other line byte-identical", () => {
    const content = ["OLLAMA_MODEL=qwen3:14b", "JIRA_CLIENT_SECRET=super-secret", "# a comment", ""].join("\n");

    const result = setEnvValue(content, "OLLAMA_MODEL", "qwen3.6:35b-a3b");

    expect(result).toBe(
      ["OLLAMA_MODEL=qwen3.6:35b-a3b", "JIRA_CLIENT_SECRET=super-secret", "# a comment", ""].join("\n"),
    );
  });

  it("does not touch a different key that merely starts with the same prefix", () => {
    const content = ["STALE_TICKET_CHECK_INTERVAL_MS=3600000", "STALE_TICKET_CHECK_INTERVAL_MS_OLD=1"].join("\n");

    const result = setEnvValue(content, "STALE_TICKET_CHECK_INTERVAL_MS", "60000");

    expect(result).toBe(["STALE_TICKET_CHECK_INTERVAL_MS=60000", "STALE_TICKET_CHECK_INTERVAL_MS_OLD=1"].join("\n"));
  });

  it("appends the key with a trailing newline when it isn't present in a non-empty file", () => {
    const content = "GITHUB_TOKEN=x\n";

    const result = setEnvValue(content, "OLLAMA_MODEL", "qwen3:14b");

    expect(result).toBe("GITHUB_TOKEN=x\nOLLAMA_MODEL=qwen3:14b\n");
  });

  it("inserts a missing newline before appending if the file didn't end with one", () => {
    const content = "GITHUB_TOKEN=x";

    const result = setEnvValue(content, "OLLAMA_MODEL", "qwen3:14b");

    expect(result).toBe("GITHUB_TOKEN=x\nOLLAMA_MODEL=qwen3:14b\n");
  });

  it("appends to an empty file without a leading blank line", () => {
    const result = setEnvValue("", "OLLAMA_MODEL", "qwen3:14b");

    expect(result).toBe("OLLAMA_MODEL=qwen3:14b\n");
  });

  it("replaces only the first matching line when a key is (invalidly) duplicated", () => {
    const content = ["OLLAMA_MODEL=old1", "OLLAMA_MODEL=old2"].join("\n");

    const result = setEnvValue(content, "OLLAMA_MODEL", "new");

    expect(result).toBe(["OLLAMA_MODEL=new", "OLLAMA_MODEL=old2"].join("\n"));
  });
});
