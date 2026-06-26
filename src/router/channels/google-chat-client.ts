/**
 * Thin wrapper around the `google-chat` CLI's `subscription create`,
 * `messages send`, and `spaces list` commands. Not a model-invocable
 * tool — reading/sending Google Chat messages is the transport of the
 * channel itself (see `src/router/channels/google-chat-events.ts`), the
 * same way stdin/stdout is the transport for the terminal channel,
 * never something the model chooses to invoke like `jiraCli`.
 *
 * `runCliFn` is injected (defaulting to the real `runCli` in production)
 * so tests never spawn a real subprocess or need real Google Chat
 * credentials.
 *
 * Used by: `src/router/channels/google-chat-events.ts`, which calls
 * `ensureSpaceSubscription` once per space before starting to listen,
 * `sendMessage` to reply with the model's response, and `listSpaces`
 * periodically to discover which spaces Mercury should be listening to.
 */
import type { runCli } from "../../tools/cli-executor.ts";

/** Throws with the CLI's own error message if `result` is a failure. */
function unwrap(result: Awaited<ReturnType<typeof runCli>>): unknown {
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result.data;
}

/**
 * Registers a Workspace Events subscription for `space`, delivering
 * matching events to `pubsubSubscription` on `topic` (creating that
 * pull subscription if it doesn't already exist — `google-chat
 * subscription create` is idempotent about that part).
 *
 * Returns the created subscription's `name`, which must be passed to
 * `google-chat listen --workspace-events-subscription` (see
 * `startGoogleChatSpaceChannel` in `google-chat-events.ts`) so the
 * listening process can keep it renewed past its ~4h TTL.
 *
 * Throws if the underlying CLI call fails — there's no recovering from
 * a missing subscription, the caller needs to know.
 */
export async function ensureSpaceSubscription(
  space: string,
  topic: string,
  pubsubSubscription: string,
  runCliFn: typeof runCli,
): Promise<{ name: string }> {
  const result = await runCliFn("google-chat", [
    "subscription",
    "create",
    "--space",
    space,
    "--topic",
    topic,
    "--pubsub-subscription",
    pubsubSubscription,
  ]);
  return unwrap(result) as { name: string };
}

/**
 * Sends a plain-text message to `space` and returns the created
 * message's `name` — used by the caller to recognize and ignore this
 * same message if it shows up again as an incoming event (loop
 * prevention, see `google-chat-events.ts`).
 */
export async function sendMessage(
  space: string,
  text: string,
  runCliFn: typeof runCli,
): Promise<{ name: string }> {
  const result = await runCliFn("google-chat", [
    "messages",
    "send",
    "--space",
    space,
    "--text",
    text,
  ]);
  return unwrap(result) as { name: string };
}

/**
 * Lists the resource names of every space the authenticated identity is
 * currently a member of. This is what `startGoogleChatChannelManager`
 * (see `google-chat-events.ts`) polls periodically to discover which
 * spaces Mercury should be listening to, instead of relying on a
 * human-maintained static list — Mercury participates wherever it's
 * actually been added, the same way a regular Workspace member would.
 */
export async function listSpaces(runCliFn: typeof runCli): Promise<string[]> {
  const result = await runCliFn("google-chat", ["spaces", "list"]);
  const data = unwrap(result) as { spaces: Array<{ name: string }> };
  return data.spaces.map((s) => s.name);
}
