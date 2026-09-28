---
"mercury": minor
---

- How a Jira issue list reads is now a rule in `mercury.config.ts`, applied by the new `@mercury/formatter` package; the core no longer formats anything.
- A formatter takes one rule per kind of list a plugin emits, typed from the plugin, so a wrong kind fails the typecheck.
- `JIRA_ISSUE_LIST_TEMPLATE` is removed: change the rule in the config instead.
- A plugin's command allowlist no longer names a post-processor per command; a plugin contributes a single post-processor that is told which command matched. The plugin contract moves to version 3.
