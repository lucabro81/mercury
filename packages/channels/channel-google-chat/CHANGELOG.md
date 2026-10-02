# @mercury-fw/channel-google-chat

## 0.1.3

### Patch Changes

- 5e09c69: - README: a section on connecting a new app to a Chat app that already exists (finding the service account and the subscription, creating a key, `mfw google-chat set-key`).
  - README: how to list and delete the keys the old instances left behind, before the service account reaches its limit of 10.
  - README: `--project` on the `keys create` command of the setup.

## 0.1.2

### Patch Changes

- ab52977: An app created with the Google Chat channel trusts `protobufjs` in `trustedDependencies`, so its install no longer reports that package's postinstall as blocked. The channel's README says to do the same when adding it by hand.

## 0.1.1

### Patch Changes

- 51bd439: `mfw google-chat set-key <key-file> [--subscription <name>]` writes the Google Chat channel's service account key (and its subscription) into the app's env file, the key on one line the way the channel reads it and never printed. The channel's setup uses it in place of the hand-written `sed`/`printf` step.
- de8b1e7: The README walks through setting up the Chat app step by step (gcloud wherever it can, the two Cloud Console pages field by field) and creates the Pub/Sub subscription with no expiration. A new section covers a subscription Pub/Sub deleted after 31 idle days: how to recreate it and give the service account its role back.
