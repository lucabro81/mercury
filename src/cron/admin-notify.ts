/**
 * D-35: base primitive for sending a message to the configured Chat admin
 * space (`MERCURY_ADMIN_SPACE`), same static-env-var pattern as
 * `GOOGLE_CHAT_SPACES` (D-33). This is the piece M4 needs early — the
 * identity-bridge fallback (task #10) uses it to ask for a missing
 * Jira<->Chat mapping. The generic "any ownerless check can register here"
 * extension is M5's debt, not built yet.
 */
import type { sendMessage } from "../router/channels/google-chat-client.ts";
import type { runCli } from "../tools/cli-executor.ts";

export async function notifyAdmin(
  text: string,
  deps: { adminSpace: string; sendMessageFn: typeof sendMessage; runCliFn: typeof runCli },
): Promise<void> {
  await deps.sendMessageFn(deps.adminSpace, text, deps.runCliFn);
}
