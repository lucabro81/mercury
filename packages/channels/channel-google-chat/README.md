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

MIT
