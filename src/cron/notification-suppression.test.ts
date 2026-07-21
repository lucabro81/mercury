import { describe, it, expect, afterEach } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { isNotificationSuppressed } from "./notification-suppression.ts";
import { writeSuppressionNote } from "../wiki/wiki-note.ts";
import { initVault } from "../wiki/vault-init.ts";

const tempDirs: string[] = [];
afterEach(async () => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop()!;
    await rm(dir, { recursive: true, force: true });
  }
});

async function makeTempVault(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "mercury-notification-suppression-test-"));
  tempDirs.push(dir);
  await initVault(dir);
  return dir;
}

describe("isNotificationSuppressed", () => {
  it("returns false when no suppression note exists for this item", async () => {
    const vaultPath = await makeTempVault();
    expect(await isNotificationSuppressed(vaultPath, "stale-ticket", "KAN-123")).toBe(false);
  });

  it("returns true once writeSuppressionNote has confirmed this item", async () => {
    const vaultPath = await makeTempVault();
    await writeSuppressionNote(vaultPath, "stale-ticket", "KAN-123", { confirmedAt: "2026-07-19T12:00:00Z" });

    expect(await isNotificationSuppressed(vaultPath, "stale-ticket", "KAN-123")).toBe(true);
  });

  it("scopes the check to checkType, not just itemKey — same key under a different check isn't suppressed", async () => {
    const vaultPath = await makeTempVault();
    await writeSuppressionNote(vaultPath, "stale-ticket", "KAN-123", { confirmedAt: "2026-07-19T12:00:00Z" });

    expect(await isNotificationSuppressed(vaultPath, "stale-pr", "KAN-123")).toBe(false);
  });

  it("handles an itemKey with path-traversal-shaped characters the same way writeSuppressionNote encodes it", async () => {
    const vaultPath = await makeTempVault();
    await writeSuppressionNote(vaultPath, "stale-ticket", "../../evil", { confirmedAt: "2026-07-19T12:00:00Z" });

    expect(await isNotificationSuppressed(vaultPath, "stale-ticket", "../../evil")).toBe(true);
  });
});
