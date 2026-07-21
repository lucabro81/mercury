import { describe, it, expect, afterEach } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  parseNotificationThresholds,
  DEFAULT_NOTIFICATION_THRESHOLDS_BODY,
  DEFAULT_STALE_TICKET_JQL,
  NOTIFICATION_CONFIG_PATH,
} from "./notification-config.ts";
import { writeCuratedNote } from "../wiki/wiki-note.ts";
import { readWikiFile } from "../wiki/wiki-read.ts";
import { initVault } from "../wiki/vault-init.ts";

describe("parseNotificationThresholds", () => {
  it("parses stale_ticket_days from a fenced yaml block in the doc body", () => {
    const body = [
      "# Soglie di notifica",
      "",
      "Configurazione letta dai check proattivi di Mercury.",
      "",
      "```yaml",
      "stale_ticket_days: 7",
      "```",
      "",
    ].join("\n");

    expect(parseNotificationThresholds(body)).toEqual({ stale_ticket_days: 7 });
  });

  it("parses the checked-in default body", () => {
    expect(parseNotificationThresholds(DEFAULT_NOTIFICATION_THRESHOLDS_BODY)).toEqual({
      stale_ticket_days: 5,
      stale_ticket_jql: DEFAULT_STALE_TICKET_JQL,
    });
  });

  it("parses stale_ticket_jql when present", () => {
    const body = ["```yaml", "stale_ticket_days: 5", 'stale_ticket_jql: "project = KAN AND statusCategory != Done"', "```"].join(
      "\n",
    );
    expect(parseNotificationThresholds(body)).toEqual({
      stale_ticket_days: 5,
      stale_ticket_jql: "project = KAN AND statusCategory != Done",
    });
  });

  it("omits stale_ticket_jql from the result when absent — the cron falls back to DEFAULT_STALE_TICKET_JQL itself", () => {
    const body = ["```yaml", "stale_ticket_days: 5", "```"].join("\n");
    expect(parseNotificationThresholds(body)).toEqual({ stale_ticket_days: 5 });
  });

  it("throws a clear error when no yaml fenced block is present", () => {
    expect(() => parseNotificationThresholds("# Soglie di notifica\n\nNessun blocco qui.\n")).toThrow(
      /no.*yaml.*block/i,
    );
  });

  it("throws a clear error when the yaml block doesn't match the expected shape", () => {
    const body = ["```yaml", "stale_ticket_days: \"not a number\"", "```"].join("\n");
    expect(() => parseNotificationThresholds(body)).toThrow(/stale_ticket_days/);
  });

  it("throws when stale_ticket_days is present but not a positive integer", () => {
    const body = ["```yaml", "stale_ticket_days: -3", "```"].join("\n");
    expect(() => parseNotificationThresholds(body)).toThrow();
  });
});

describe("notification config doc round-trip", () => {
  const tempDirs: string[] = [];

  afterEach(async () => {
    while (tempDirs.length > 0) {
      const dir = tempDirs.pop()!;
      await rm(dir, { recursive: true, force: true });
    }
  });

  // Integration-shaped: writeCuratedNote → readWikiFile → parse, the same
  // path a real cron tick takes. parseNotificationThresholds only looks
  // for a ```yaml fence, so feeding it the whole file (frontmatter
  // included, not just the body) is safe — no collision with the
  // frontmatter's own `---` YAML block.
  it("reads back what writeCuratedNote wrote, cron-style, cache any userId since curated/ isn't user-scoped", async () => {
    const vaultPath = await mkdtemp(join(tmpdir(), "mercury-notification-config-test-"));
    tempDirs.push(vaultPath);
    await initVault(vaultPath);

    await writeCuratedNote(vaultPath, NOTIFICATION_CONFIG_PATH, {}, DEFAULT_NOTIFICATION_THRESHOLDS_BODY);

    const fileText = await readWikiFile(vaultPath, "cron", `curated/${NOTIFICATION_CONFIG_PATH}`);
    expect(parseNotificationThresholds(fileText)).toEqual({
      stale_ticket_days: 5,
      stale_ticket_jql: DEFAULT_STALE_TICKET_JQL,
    });
  });
});
