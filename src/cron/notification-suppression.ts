/**
 * Deterministic read-side of the suppression gate written by
 * `writeSuppressionNote` — a cron check must call this before
 * re-notifying about an item. Existence-only check, no frontmatter
 * parsing needed: `writeSuppressionNote` never writes a note it doesn't
 * mean, so presence alone is the signal.
 */
import { stat } from "node:fs/promises";
import { join } from "node:path";

export async function isNotificationSuppressed(vaultPath: string, checkType: string, itemKey: string): Promise<boolean> {
  const path = join(vaultPath, "inferred", "suppressed", checkType, `${encodeURIComponent(itemKey)}.md`);
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}
