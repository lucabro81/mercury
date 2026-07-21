/**
 * Notification thresholds live as a doc in the Wiki
 * (`curated/config/notifications.md`), not hardcoded — Mercury updates it
 * via `write_file` on conversational request, cron code reads it here.
 * Parsing is deterministic (zod-validated YAML), no LLM involved in
 * reading a threshold at tick time.
 */
import { z } from "zod";
import { parse as parseYaml } from "yaml";

const NotificationThresholdsSchema = z.object({
  stale_ticket_days: z.number().int().positive(),
  // Base JQL scope for the stale-ticket check — --stale-days is appended by
  // the cron, this only narrows *which* tickets are candidates (e.g. a
  // specific project). Optional: DEFAULT_STALE_TICKET_JQL is a reasonable,
  // project-agnostic default when the team hasn't set one.
  stale_ticket_jql: z.string().optional(),
});

export type NotificationThresholds = z.infer<typeof NotificationThresholdsSchema>;

export const NOTIFICATION_CONFIG_PATH = "config/notifications.md";

export const DEFAULT_STALE_TICKET_JQL = "statusCategory != Done";

export const DEFAULT_NOTIFICATION_THRESHOLDS_BODY = [
  "# Soglie di notifica",
  "",
  "Configurazione letta dai check proattivi di Mercury. Modificabile chiedendo a Mercury di aggiornarla in conversazione, es. \"alza la soglia ticket a 7 giorni\" o \"limita il check ai ticket del progetto KAN\".",
  "",
  "```yaml",
  "stale_ticket_days: 5",
  `stale_ticket_jql: "${DEFAULT_STALE_TICKET_JQL}"`,
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
