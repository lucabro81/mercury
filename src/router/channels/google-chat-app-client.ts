/**
 * The registered Chat app's own transport — Chat REST API + Pub/Sub pull,
 * called directly over HTTPS from this process, never through `gchat-cli`
 * (that CLI is only ever a subprocess wrapper for the retired impersonation
 * path; it is not model-facing either way — see `google-chat-join.ts`'s own
 * doc comment on why channel transport is never model-invocable).
 *
 * Auth: a service-account JWT-bearer flow (RFC 7523), signed with Node's
 * built-in `crypto` — no new OAuth/Google API client dependency needed for
 * this. One token, two scopes (`chat.bot` for the Chat API, `pubsub` for
 * pulling/acking events), re-minted lazily once it's within a minute of
 * expiring. Verified live against the real APIs earlier in this project's
 * history (a throwaway service account, JWT-bearer flow, `chat.bot` scope,
 * `spaces.messages.create` → HTTP 200, delivered as the app's own `BOT`
 * identity) before this file was written — this is that same pattern,
 * generalized and made persistent instead of a one-off script.
 */
import { createSign } from "node:crypto";

export type ServiceAccountCredentials = { clientEmail: string; privateKey: string };

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CHAT_API_BASE = "https://chat.googleapis.com/v1";
const PUBSUB_API_BASE = "https://pubsub.googleapis.com/v1";
const SCOPES = "https://www.googleapis.com/auth/chat.bot https://www.googleapis.com/auth/pubsub";
/** Re-mint this long before real expiry — a token that expires mid-request is worse than one wasted early. */
const REFRESH_MARGIN_SECONDS = 60;

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Builds and signs the JWT assertion for the OAuth2 JWT-bearer grant. Pure function, no I/O — testable without a real key. */
export function buildSignedAssertion(creds: ServiceAccountCredentials, scope: string, nowSeconds: number): string {
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: creds.clientEmail,
      scope,
      aud: TOKEN_URL,
      exp: nowSeconds + 3600,
      iat: nowSeconds,
    }),
  );
  const unsigned = `${header}.${claims}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const signature = base64url(signer.sign(creds.privateKey));
  return `${unsigned}.${signature}`;
}

export type FetchFn = typeof fetch;

/** Exchanges a signed JWT assertion for an access token. Throws with the response body on failure — no fallback identity to authenticate as instead. */
async function exchangeAssertionForToken(
  assertion: string,
  fetchFn: FetchFn,
): Promise<{ accessToken: string; expiresInSeconds: number }> {
  const response = await fetchFn(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }).toString(),
  });
  if (!response.ok) {
    throw new Error(`token exchange failed: HTTP ${response.status} ${await response.text()}`);
  }
  const data = (await response.json()) as { access_token: string; expires_in: number };
  return { accessToken: data.access_token, expiresInSeconds: data.expires_in };
}

export type TokenSource = { getToken(): Promise<string> };

/** A lazily-refreshing token source: mints once, reuses until close to expiry, re-mints after. */
export function createTokenSource(
  creds: ServiceAccountCredentials,
  deps: { fetchFn?: FetchFn; nowSeconds?: () => number } = {},
): TokenSource {
  const fetchFn = deps.fetchFn ?? fetch;
  const nowSeconds = deps.nowSeconds ?? (() => Math.floor(Date.now() / 1000));
  let cached: { accessToken: string; expiresAt: number } | null = null;

  return {
    async getToken(): Promise<string> {
      const now = nowSeconds();
      if (cached && cached.expiresAt - REFRESH_MARGIN_SECONDS > now) {
        return cached.accessToken;
      }
      const assertion = buildSignedAssertion(creds, SCOPES, now);
      const { accessToken, expiresInSeconds } = await exchangeAssertionForToken(assertion, fetchFn);
      cached = { accessToken, expiresAt: now + expiresInSeconds };
      return accessToken;
    },
  };
}

/** Throws with the response body on a non-2xx result — there's no fallback the caller can take instead of knowing the real call failed. */
async function callChatApi(
  path: string,
  init: { method: string; body?: unknown },
  deps: { tokenSource: TokenSource; fetchFn?: FetchFn },
): Promise<unknown> {
  const fetchFn = deps.fetchFn ?? fetch;
  const token = await deps.tokenSource.getToken();
  const response = await fetchFn(`${CHAT_API_BASE}/${path}`, {
    method: init.method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  if (!response.ok) {
    throw new Error(`Chat API ${init.method} ${path} failed: HTTP ${response.status} ${await response.text()}`);
  }
  return response.json();
}

/**
 * Finds or creates a DIRECT_MESSAGE space with `userId` (`users/<id>`).
 * Checks `spaces.findDirectMessage` first and reuses an existing DM if one
 * exists; falls back to `spaces.setup` (creates a space **and** adds the
 * given member in one call — the closest single-call equivalent of the
 * retired `gchat-cli`'s `spaces create --user`, which the CLI's own docs
 * described as wrapping `spaces.setup`) when none is found.
 */
export async function getOrCreateDmSpace(
  userId: string,
  deps: { tokenSource: TokenSource; fetchFn?: FetchFn },
): Promise<{ name: string }> {
  const found = (await callChatApi(
    `spaces:findDirectMessage?name=${encodeURIComponent(userId)}`,
    { method: "GET" },
    deps,
  ).catch(() => null)) as { name?: string } | null;
  if (found?.name) {
    return { name: found.name };
  }
  const created = (await callChatApi(
    "spaces:setup",
    { method: "POST", body: { space: { spaceType: "DIRECT_MESSAGE" }, memberships: [{ member: { name: userId, type: "HUMAN" } }] } },
    deps,
  )) as { name: string };
  return { name: created.name };
}

/** Sends a plain-text message to `space`. Returns the created message's `name` (used for loop-prevention, same as the retired impersonation-era transport). */
export async function sendMessage(
  space: string,
  text: string,
  deps: { tokenSource: TokenSource; fetchFn?: FetchFn },
): Promise<{ name: string }> {
  const data = (await callChatApi(`${space}/messages`, { method: "POST", body: { text } }, deps)) as { name: string };
  return { name: data.name };
}

/** A single Cards v2 message — one call, `cardsV2` is an array because the API supports multiple cards per message, but every caller here sends exactly one. */
export type ChatCard = { header?: { title: string }; sections: Array<{ widgets: unknown[] }> };

/** Posts `card` as a Cards v2 message to `space`. Returns the created message's `name`, same shape as `sendMessage`. */
export async function sendCard(
  space: string,
  card: ChatCard,
  deps: { tokenSource: TokenSource; fetchFn?: FetchFn },
): Promise<{ name: string }> {
  const data = (await callChatApi(
    `${space}/messages`,
    { method: "POST", body: { cardsV2: [{ cardId: "card", card }] } },
    deps,
  )) as { name: string };
  return { name: data.name };
}

/** Edits an already-sent message's text (PATCH, `updateMask=text`). Used only to rewrite a one-shot "might be stuck" note once real content arrives. */
export async function updateMessage(
  name: string,
  text: string,
  deps: { tokenSource: TokenSource; fetchFn?: FetchFn },
): Promise<{ name: string }> {
  const data = (await callChatApi(`${name}?updateMask=text`, { method: "PATCH", body: { text } }, deps)) as {
    name: string;
  };
  return { name: data.name };
}

/** One event delivered on the app's Pub/Sub subscription — the envelope Chat's Cloud Pub/Sub deployment publishes (confirmed live earlier this session against a real test app). */
export type ChatPubSubMessage = { ackId: string; data: unknown };

/**
 * Synchronously pulls up to `maxMessages` waiting events, decoding the
 * base64 Pub/Sub payload into its parsed JSON body. Returns `[]` if
 * nothing is waiting — a normal, frequent case for a poll loop, not an
 * error.
 */
export async function pullEvents(
  subscription: string,
  maxMessages: number,
  deps: { tokenSource: TokenSource; fetchFn?: FetchFn },
): Promise<ChatPubSubMessage[]> {
  const fetchFn = deps.fetchFn ?? fetch;
  const token = await deps.tokenSource.getToken();
  const response = await fetchFn(`${PUBSUB_API_BASE}/${subscription}:pull`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ maxMessages }),
  });
  if (!response.ok) {
    throw new Error(`Pub/Sub pull failed: HTTP ${response.status} ${await response.text()}`);
  }
  const body = (await response.json()) as {
    receivedMessages?: Array<{ ackId: string; message: { data: string } }>;
  };
  return (body.receivedMessages ?? []).map((m) => ({
    ackId: m.ackId,
    data: JSON.parse(Buffer.from(m.message.data, "base64").toString("utf-8")),
  }));
}

/**
 * Acknowledges delivered events so Pub/Sub doesn't redeliver them. A
 * failure here is logged by the caller, not thrown over, but is not
 * actually harmless: unlike Mercury's own outbound messages (deduped via
 * `sentMessageNames` to stop reply-to-self loops), a genuine inbound user
 * message has no such idempotency net — if this call fails, Pub/Sub will
 * redeliver it and the caller (`pollOnce`, `google-chat-provider.ts`) will
 * process it a second time from scratch. Best-effort because there's
 * nothing more useful to do with the failure, not because a redelivery is
 * actually safe to ignore.
 */
export async function acknowledge(
  subscription: string,
  ackIds: string[],
  deps: { tokenSource: TokenSource; fetchFn?: FetchFn },
): Promise<void> {
  if (ackIds.length === 0) return;
  const fetchFn = deps.fetchFn ?? fetch;
  const token = await deps.tokenSource.getToken();
  const response = await fetchFn(`${PUBSUB_API_BASE}/${subscription}:acknowledge`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ ackIds }),
  });
  if (!response.ok) {
    throw new Error(`Pub/Sub acknowledge failed: HTTP ${response.status} ${await response.text()}`);
  }
}
