/**
 * Base primitive for sending a message to the configured Chat admin
 * space (`MERCURY_ADMIN_SPACE`), same static-env-var pattern as
 * `GOOGLE_CHAT_SPACES`. Used by the identity bridge's fallback to ask
 * for a missing Jira<->Chat mapping. A generic "any ownerless check can
 * register here" extension is a possible future direction, not built yet.
 */
import type { sendMessage } from "../router/channels/google-chat-client.ts";
import type { runCli } from "../tools/cli-executor.ts";

export async function notifyAdmin(
  text: string,
  deps: { adminSpace: string; sendMessageFn: typeof sendMessage; runCliFn: typeof runCli },
): Promise<void> {
  await deps.sendMessageFn(deps.adminSpace, text, deps.runCliFn);
}
