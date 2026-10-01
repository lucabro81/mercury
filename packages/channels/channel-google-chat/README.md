# @mercury-fw/channel-google-chat

Puts a [Mercury](https://github.com/lucabro81/mercury-fw) agent on Google Chat as a registered Chat app: it receives messages through a Pub/Sub subscription and replies through the Chat API, with status cards while it works and a button for the actions that need confirmation.

```bash
bun add @mercury-fw/channel-google-chat
```

```ts
import { googleChatChannel } from "@mercury-fw/channel-google-chat";

channels: [googleChatChannel],
```

| Variable | |
|---|---|
| `GOOGLE_CHAT_PUBSUB_SUBSCRIPTION` | `projects/<project>/subscriptions/<subscription>` the Chat app's events arrive on. Empty leaves the channel inert. |
| `GOOGLE_CHAT_APP_CLIENT_EMAIL` | The service account the app authenticates as. |
| `GOOGLE_CHAT_APP_PRIVATE_KEY` | That service account's private key. |

Each instance needs a Chat app of its own (its own Google Cloud project, topic, subscription and service account): two instances on one subscription either both answer or split a conversation between them. The [reference instance's README](https://github.com/lucabro81/mercury-fw/tree/main/apps/mercury#setting-up-the-chat-apps-google-cloud-project) has the `gcloud` commands, and the one step Cloud Console only does by hand.

## When the subscription disappears

Pub/Sub deletes a subscription nobody has pulled from in 31 days (its default expiration policy), so an instance that stayed off for a month comes back with the channel logging `NOT_FOUND` on the subscription, while the topic, the service account and the Chat app's configuration are all still there. Recreate it on the same topic and with the same name, so `GOOGLE_CHAT_PUBSUB_SUBSCRIPTION` doesn't change, this time with no expiration; then give the app's service account its subscriber role back, since it went away with the subscription:

```bash
PROJECT_ID=<the Chat app's project>
TOPIC=<the topic the Chat app publishes to>
SUBSCRIPTION=<the last part of GOOGLE_CHAT_PUBSUB_SUBSCRIPTION>
SA_EMAIL=<GOOGLE_CHAT_APP_CLIENT_EMAIL>

gcloud pubsub subscriptions create "$SUBSCRIPTION" --topic="$TOPIC" --expiration-period=never --project="$PROJECT_ID"
gcloud pubsub subscriptions add-iam-policy-binding "$SUBSCRIPTION" \
  --project="$PROJECT_ID" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/pubsub.subscriber"
```

Then restart the app (`bunx mfw restart`). The messages sent to the app while the subscription was missing are lost, though: Pub/Sub only keeps them for a subscription that exists.

To tell which of the pieces is missing, `gcloud pubsub topics list --project="$PROJECT_ID"` and `gcloud pubsub subscriptions list --project="$PROJECT_ID"`. If the topic is gone too, follow the setup in the reference instance's README again from the topic on, Cloud Console step included.

MIT
