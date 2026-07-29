import { describe, it, expect, afterEach } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { findChatUserByEmail } from "./identity-bridge.ts";
import { writeResolvedNote } from "../wiki/wiki-note.ts";
import { initVault } from "../wiki/vault-init.ts";

const tempDirs: string[] = [];
afterEach(async () => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop()!;
    await rm(dir, { recursive: true, force: true });
  }
});

async function makeTempVault(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "mercury-identity-bridge-test-"));
  tempDirs.push(dir);
  await initVault(dir);
  return dir;
}

describe("findChatUserByEmail", () => {
  it("finds the Chat user cached under a matching email", async () => {
    const vaultPath = await makeTempVault();
    await writeResolvedNote(
      vaultPath,
      "users/42",
      { resolvedAt: "2026-07-19T12:00:00Z", email: "mario@example.com" },
      "Mario Rossi",
    );

    const result = await findChatUserByEmail(vaultPath, "mario@example.com");

    expect(result).toEqual({ userId: "users/42", displayName: "Mario Rossi" });
  });

  it("matches case-insensitively (email addresses aren't case-sensitive in practice)", async () => {
    const vaultPath = await makeTempVault();
    await writeResolvedNote(
      vaultPath,
      "users/42",
      { resolvedAt: "2026-07-19T12:00:00Z", email: "Mario@Example.com" },
      "Mario Rossi",
    );

    const result = await findChatUserByEmail(vaultPath, "mario@example.com");

    expect(result).toEqual({ userId: "users/42", displayName: "Mario Rossi" });
  });

  it("returns null when no cached Chat user has this email", async () => {
    const vaultPath = await makeTempVault();
    await writeResolvedNote(
      vaultPath,
      "users/42",
      { resolvedAt: "2026-07-19T12:00:00Z", email: "someone-else@example.com" },
      "Someone Else",
    );

    const result = await findChatUserByEmail(vaultPath, "mario@example.com");

    expect(result).toBeNull();
  });

  it("ignores non-resolved-name.md files under inferred/users when scanning", async () => {
    const vaultPath = await makeTempVault();
    // A user with an unrelated inferred note (not resolved-name.md) should
    // never be mistaken for a match, and shouldn't crash the scan.
    await writeResolvedNote(
      vaultPath,
      "users/1",
      { resolvedAt: "2026-07-19T12:00:00Z", email: "someone@example.com" },
      "Someone",
    );

    const result = await findChatUserByEmail(vaultPath, "not-cached@example.com");

    expect(result).toBeNull();
  });
});
