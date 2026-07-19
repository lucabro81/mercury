import { describe, it, expect } from "bun:test";
import { resolveSenderName } from "./user-resolution.ts";
import type { getUser } from "./channels/google-chat-client.ts";
import type { writeResolvedNote } from "../wiki/wiki-note.ts";
import type { runCli } from "../tools/cli-executor.ts";

const runCliFn: typeof runCli = async () => ({ ok: true, data: {} });

function cachedNoteContent(displayName: string): string {
  return `---\ntype: resolved\nsource: api\nresolved_at: '2026-07-18T00:00:00Z'\ndisplay_name: ${displayName}\n---\n\n${displayName}\n`;
}

describe("resolveSenderName", () => {
  it("returns the cached name on a hit, without calling getUserFn or writeResolvedNoteFn", async () => {
    let getUserCalls = 0;
    let writeCalls = 0;
    let receivedPath: string | undefined;
    const getUserFn: typeof getUser = async () => {
      getUserCalls++;
      return { displayName: "should not be used" };
    };
    const writeResolvedNoteFn: typeof writeResolvedNote = async () => {
      writeCalls++;
    };
    const readFileFn = async (path: string): Promise<string> => {
      receivedPath = path;
      return cachedNoteContent("Luca Brognara");
    };

    const result = await resolveSenderName("users/42", {
      vaultPath: "/vault",
      getUserFn,
      runCliFn,
      writeResolvedNoteFn,
      readFileFn,
    });

    expect(result).toBe("Luca Brognara");
    expect(getUserCalls).toBe(0);
    expect(writeCalls).toBe(0);
    expect(receivedPath).toBe("/vault/inferred/users/users%2F42/resolved-name.md");
  });

  it("resolves via getUserFn on a cache miss, writes the note, and returns the name", async () => {
    const readFileFn = async (): Promise<string> => {
      throw Object.assign(new Error("ENOENT"), { code: "ENOENT" });
    };
    const calls: string[] = [];
    const getUserFn: typeof getUser = async (userId) => {
      calls.push(`getUser:${userId}`);
      return { displayName: "Luca Brognara" };
    };
    let writtenArgs: unknown[] | undefined;
    const writeResolvedNoteFn: typeof writeResolvedNote = async (...args) => {
      calls.push("write");
      writtenArgs = args;
    };

    const result = await resolveSenderName("users/42", {
      vaultPath: "/vault",
      getUserFn,
      runCliFn,
      writeResolvedNoteFn,
      readFileFn,
    });

    expect(result).toBe("Luca Brognara");
    expect(calls).toEqual(["getUser:users/42", "write"]);
    expect(writtenArgs?.[0]).toBe("/vault");
    expect(writtenArgs?.[1]).toBe("users/42");
    expect(writtenArgs?.[3]).toBe("Luca Brognara");
  });

  it("returns null and never writes a cache entry when getUserFn fails", async () => {
    const readFileFn = async (): Promise<string> => {
      throw Object.assign(new Error("ENOENT"), { code: "ENOENT" });
    };
    const getUserFn: typeof getUser = async () => {
      throw new Error("google-chat exited with code 1: permission denied");
    };
    let writeCalls = 0;
    const writeResolvedNoteFn: typeof writeResolvedNote = async () => {
      writeCalls++;
    };

    const result = await resolveSenderName("users/42", {
      vaultPath: "/vault",
      getUserFn,
      runCliFn,
      writeResolvedNoteFn,
      readFileFn,
    });

    expect(result).toBeNull();
    expect(writeCalls).toBe(0);
  });

  it("treats malformed cached content as a miss and re-resolves instead of throwing", async () => {
    const readFileFn = async (): Promise<string> => "not frontmatter at all";
    const getUserFn: typeof getUser = async () => ({ displayName: "Luca Brognara" });
    let writeCalls = 0;
    const writeResolvedNoteFn: typeof writeResolvedNote = async () => {
      writeCalls++;
    };

    const result = await resolveSenderName("users/42", {
      vaultPath: "/vault",
      getUserFn,
      runCliFn,
      writeResolvedNoteFn,
      readFileFn,
    });

    expect(result).toBe("Luca Brognara");
    expect(writeCalls).toBe(1);
  });
});
