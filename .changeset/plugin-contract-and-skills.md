---
"mercury": minor
---

- A shared plugin contract (`@mercury/plugin-types`) that the core and every plugin build against, with a required `apiVersion` so a core and a plugin built separately can detect a version mismatch instead of failing obscurely.
- Bitbucket is now its own plugin package, extracted with the same contract as Jira and no widening of it — a second plugin that keeps the contract honest.
- The shared CLI-binary provisioning is factored into `@mercury/utils`, so each plugin's postinstall pins and fetches its binary through one dependency-free helper.
- The status line shown while a command runs now comes from its plugin (defaulting to "esecuzione <binary> <subcommand>") rather than the core classifying it as a read or a write.
- Plugins can ship Agent Skills (`SKILL.md`): a skill's name and one-line description stay in the system prompt, and its full instructions load on demand via a `read_skill` tool — instead of every plugin's instructions sitting in the prompt on every turn. Jira's guidance moved to a skill.
