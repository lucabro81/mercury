/**
 * Wraps `@google-cloud/pubsub` for the one thing this app needs: a
 * long-lived StreamingPull subscription that emits decoded events as they
 * arrive, replacing the retired REST `pull`-in-a-`setInterval` loop
 * (`pullEvents`/`acknowledge` in `google-chat-app-client.ts`) — synchronous
 * Pull has no real long-polling (confirmed against Google's own docs: an
 * empty response doesn't mean the server waited for a message), so a fixed
 * poll interval was the only lever available with that API. StreamingPull
 * is a bidirectional gRPC stream; hand-rolling that with `fetch` the way
 * the REST pull/ack calls were isn't practical, hence the one real
 * dependency this project takes on Google's own client library.
 *
 * Isolated in its own file so `google-chat-provider.ts` never imports the
 * SDK directly — its own tests inject a fake via the `subscriptionFn` seam
 * instead of touching real gRPC. Verified live (`docs/DECISIONS.md`) that
 * this SDK's StreamingPull works cleanly under Bun in this project's real
 * Docker image before this file was written.
 */
import { PubSub } from "@google-cloud/pubsub";
import type { ServiceAccountCredentials } from "./google-chat-app-client.ts";

/** One incoming Pub/Sub message. `data` is already the raw message body — the SDK handles the wire-level base64 transport itself. */
export type StreamMessage = { data: Buffer; ack: () => void; nack: () => void };

/** The subset of `@google-cloud/pubsub`'s `Subscription` this app actually uses — narrowed so a fake can satisfy it in tests without depending on the real SDK's types. */
export type PubSubSubscription = {
  on(event: "message", listener: (message: StreamMessage) => void): void;
  on(event: "error", listener: (err: Error) => void): void;
  close(): Promise<void>;
};

/** Splits `"projects/<id>/subscriptions/<name>"` into its two parts — thrown separately so a malformed env var fails fast and clearly, not deep inside the SDK's own error handling. */
export function parseSubscriptionName(resourceName: string): { projectId: string; subscriptionId: string } {
  const match = resourceName.match(/^projects\/([^/]+)\/subscriptions\/([^/]+)$/);
  if (!match) throw new Error(`unexpected Pub/Sub subscription resource name: ${resourceName}`);
  return { projectId: match[1]!, subscriptionId: match[2]! };
}

/**
 * Opens a StreamingPull subscription. Real gRPC — exercised by the Phase 0
 * spike and live verification, not by unit tests (`google-chat-provider.ts`
 * injects a fake `PubSubSubscription` via its own `subscriptionFn` seam for
 * those). Credentials are passed directly (`client_email`/`private_key`),
 * same service-account values already used for the Chat API's own
 * JWT-bearer flow — no key file on disk, no second credential to manage.
 */
export function openSubscription(credentials: ServiceAccountCredentials, resourceName: string): PubSubSubscription {
  const { projectId, subscriptionId } = parseSubscriptionName(resourceName);
  const pubsub = new PubSub({
    projectId,
    credentials: { client_email: credentials.clientEmail, private_key: credentials.privateKey },
  });
  return pubsub.subscription(subscriptionId) as unknown as PubSubSubscription;
}
