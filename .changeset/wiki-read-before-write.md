---
"@mercury-fw/core": patch
---

- Before writing to the wiki, the agent looks for a document on the same topic and updates it, instead of adding a new one each time.
- The agent no longer writes wiki notes restating a CLI's syntax or flags, which the plugin's skill and `--help` already cover.
- A learned command correction is keyed by the flag or subcommand it is about, without the tool's name, so corrections on the same flag land in the same note.
- The prompts that extract command corrections and facts about the user are in English.
