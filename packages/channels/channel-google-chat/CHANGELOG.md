# @mercury-fw/channel-google-chat

## 0.1.1

### Patch Changes

- 51bd439: `mfw google-chat set-key <key-file> [--subscription <name>]` writes the Google Chat channel's service account key (and its subscription) into the app's env file, the key on one line the way the channel reads it and never printed. The channel's setup uses it in place of the hand-written `sed`/`printf` step.
- de8b1e7: The README walks through setting up the Chat app step by step (gcloud wherever it can, the two Cloud Console pages field by field) and creates the Pub/Sub subscription with no expiration. A new section covers a subscription Pub/Sub deleted after 31 idle days: how to recreate it and give the service account its role back.
