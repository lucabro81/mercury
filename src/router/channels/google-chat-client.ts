/**
 * Thin wrapper around the `google-chat` CLI's `subscription create` and
 * `messages send` commands. Not a model-invocable tool —
 * reading/sending Google Chat messages is the transport of the channel
 * itself (see `src/router/channels/google-chat-events.ts`), the same
 * way stdin/stdout is the transport for the terminal channel, never
 * something the model chooses to invoke like `jiraCli`.
 *
 * `runCliFn` is injected (defaulting to the real `runCli` in production)
 * so tests never spawn a real subprocess or need real Google Chat
 * credentials.
 *
 * Used by: `src/router/channels/google-chat-events.ts`, which calls
 * `ensureSpaceSubscription` once per space before starting to listen,
 * and `sendMessage` to reply with the model's response.
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
 * Always passes `--message-filter`, scoping delivery on the (shared)
 * `topic` to this space's own events via the `ce-subject` CloudEvents
 * attribute — dot notation only, `attributes.ce-subject`, confirmed live
 * in the CLI-monorepo (google-chat-v0.4.0) to be where the space id
 * actually lives (not `ce-source`, which holds the Workspace Events
 * subscription's own name instead). `--topic`/`--message-filter` are
 * immutable once the pull subscription exists, so `pubsubSubscription`
 * must be dedicated to this space (see `deriveSubscriptionName` in
 * `google-chat-events.ts`), not shared across spaces.
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
  const bareSpaceId = space.replace(/^spaces\//, "");
  const messageFilter = `hasPrefix(attributes.ce-subject, "//chat.googleapis.com/spaces/${bareSpaceId}")`;
  const result = await runCliFn("google-chat", [
    "subscription",
    "create",
    "--space",
    space,
    "--topic",
    topic,
    "--pubsub-subscription",
    pubsubSubscription,
    "--message-filter",
    messageFilter,
  ]);
  return unwrap(result) as { name: string };
}

/**
 * Resolves `userId` (`users/<id>` or a bare id, same value found in a
 * message's `sender.name`) to a human display name via `google-chat users
 * get`, which itself calls the People API — Chat's own API never exposes
 * a display name on a user-authenticated Chat User resource. Response
 * shape confirmed live: the real `people.get` payload, `names` is an
 * array (a person can have entries from more than one source) — picks the
 * one marked `metadata.primary: true`, falling back to the first entry if
 * none is marked (better a plausible name than none). Throws if `names`
 * is missing/empty or the underlying CLI call fails — there's no
 * fallback identity to show instead. `email` (added to the CLI's output
 * at 0.8.0, same `{value, metadata: {primary}}` shape as `names`) is
 * best-effort: `null` when absent, never thrown over — not every People
 * API profile exposes one, and email isn't the primary purpose of this
 * lookup.
 */
export async function getUser(
  userId: string,
  runCliFn: typeof runCli,
): Promise<{ displayName: string; email: string | null }> {
  const result = await runCliFn("google-chat", ["users", "get", "--user", userId]);
  const data = unwrap(result) as {
    names?: { displayName?: string; metadata?: { primary?: boolean } }[];
    emailAddresses?: { value?: string; metadata?: { primary?: boolean } }[];
  };

  if (!data.names || data.names.length === 0) {
    throw new Error(`google-chat users get --user ${userId} returned no names`);
  }
  const primaryName = data.names.find((n) => n.metadata?.primary) ?? data.names[0];
  if (!primaryName?.displayName) {
    throw new Error(`google-chat users get --user ${userId} returned a name entry with no displayName`);
  }

  const emails = data.emailAddresses ?? [];
  const primaryEmail = emails.find((e) => e.metadata?.primary) ?? emails[0];

  return { displayName: primaryName.displayName, email: primaryEmail?.value ?? null };
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
