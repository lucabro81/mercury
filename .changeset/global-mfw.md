---
"@mercury-fw/cli": minor
---

`mfw` is meant to be installed globally (`bun add -g @mercury-fw/cli`) and used as a plain command. Inside an app, a global `mfw` at another version hands the command over to the app's own CLI, so the app's commands always match its framework. `mfw upgrade` installs the registry's latest globally, and `mfw create` run by a stale `mfw` says to. The CLI's messages, the generated app and the docs say `mfw` instead of `bunx mfw`.
