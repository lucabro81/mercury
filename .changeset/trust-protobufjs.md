---
"@mercury-fw/cli": patch
"@mercury-fw/channel-google-chat": patch
---

An app created with the Google Chat channel trusts `protobufjs` in `trustedDependencies`, so its install no longer reports that package's postinstall as blocked. The channel's README says to do the same when adding it by hand.
