---
"@mercury-fw/core": minor
"@mercury-fw/cli": minor
"@mercury-fw/plugin-jira": patch
"@mercury-fw/plugin-bitbucket": patch
"@mercury-fw/plugin-atlassian-admin": patch
---

- Every tool plugin declared in `mercury.config.ts` loads: `MERCURY_CLIS` is no longer read. An app that used it to keep a declared plugin off now gets that plugin on; remove the plugin from the config instead.
- A new app's env example has no `MERCURY_CLIS`, and its config's comment says every declared plugin and channel is active.
- A plugin caught in a dependency cycle is always reported at startup.
- The plugins' READMEs no longer ask to list them in `MERCURY_CLIS`.
