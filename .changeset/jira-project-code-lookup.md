---
"mercury": patch
---

Mercury now checks its wiki for a known mapping from an informal project name (e.g. "the monorepo") to its Jira project key before guessing or falling back to a keyword search — and records the mapping there once it learns it, instead of only remembering it for the current conversation. Previously it could end up re-discovering (or being told) the same mapping again in a later session.
