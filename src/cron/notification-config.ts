/**
 * Notification thresholds live as a doc in the Wiki
 * (`curated/config/notifications.md`), not hardcoded — Mercury updates it
 * via `write_file` on conversational request, cron code reads it here.
 * Parsing is deterministic (zod-validated YAML), no LLM involved in
 * reading a threshold at tick time.
 */
import { z } from "zod";
import { parse as parseYaml } from "yaml";
import type { readWikiFile } from "../wiki/wiki-read.ts";
import type { writeCuratedNote } from "../wiki/wiki-note.ts";

const NotificationThresholdsSchema = z.object({
  stale_ticket_days: z.number().int().positive(),
  // Base JQL scope for the stale-ticket check — --stale-days is appended by
  // the cron, this only narrows *which* tickets are candidates (e.g. a
  // specific project). Optional: DEFAULT_STALE_TICKET_JQL is a reasonable,
  // project-agnostic default when the team hasn't set one.
  stale_ticket_jql: z.string().optional(),
  // How many days a PR can sit with an unapproved assigned reviewer before
  // it counts as stale. Optional: DEFAULT_PR_STALE_DAYS applies when unset.
  pr_stale_days: z.number().int().positive().optional(),
  // Which repos to watch for stale PRs, "workspace/repo_slug" each —
  // Bitbucket has no workspace-wide PR listing, so this has to be an
  // explicit list. Optional, defaults to none (nothing to watch until
  // the team configures it).
  pr_repositories: z.array(z.string()).optional(),
});

export type NotificationThresholds = z.infer<typeof NotificationThresholdsSchema>;

export const NOTIFICATION_CONFIG_PATH = "config/notifications.md";

export const DEFAULT_STALE_TICKET_JQL = "statusCategory != Done";

export const DEFAULT_PR_STALE_DAYS = 3;

export const DEFAULT_NOTIFICATION_THRESHOLDS_BODY = [
  "# Soglie di notifica",
  "",
  "Configurazione letta dai check proattivi di Mercury. Modificabile chiedendo a Mercury di aggiornarla in conversazione, es. \"alza la soglia ticket a 7 giorni\", \"limita il check ai ticket del progetto KAN\", o \"sorveglia anche le PR di workspace/repo\".",
  "",
  "```yaml",
  "stale_ticket_days: 5",
  `stale_ticket_jql: "${DEFAULT_STALE_TICKET_JQL}"`,
  `pr_stale_days: ${DEFAULT_PR_STALE_DAYS}`,
  "pr_repositories: []",
  "```",
  "",
].join("\n");

/** Extracts and validates the fenced ```yaml block from a notification-config doc's body. */
export function parseNotificationThresholds(body: string): NotificationThresholds {
  const match = body.match(/```yaml\n([\s\S]*?)\n```/);
  if (!match) {
    throw new Error("no ```yaml fenced block found in notification thresholds doc");
  }

  const parsed = parseYaml(match[1] as string);
  const validated = NotificationThresholdsSchema.safeParse(parsed);
  if (!validated.success) {
    const issues = validated.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`invalid notification thresholds: ${issues}`);
  }
  return validated.data;
}

/**
 * Reads and parses the notification-config doc, seeding it with
 * `DEFAULT_NOTIFICATION_THRESHOLDS_BODY` on first use (the doc doesn't
 * exist until some cron actually needs it). Shared by every proactive
 * check that reads this doc — stale tickets and stale PRs both call this
 * rather than each seeding it independently.
 */
export async function loadNotificationThresholds(deps: {
  vaultPath: string;
  readWikiFileFn: typeof readWikiFile;
  writeCuratedNoteFn: typeof writeCuratedNote;
}): Promise<NotificationThresholds> {
  try {
    const text = await deps.readWikiFileFn(deps.vaultPath, "cron", `curated/${NOTIFICATION_CONFIG_PATH}`);
    return parseNotificationThresholds(text);
  } catch {
    await deps.writeCuratedNoteFn(deps.vaultPath, NOTIFICATION_CONFIG_PATH, {}, DEFAULT_NOTIFICATION_THRESHOLDS_BODY);
    return parseNotificationThresholds(DEFAULT_NOTIFICATION_THRESHOLDS_BODY);
  }
}
