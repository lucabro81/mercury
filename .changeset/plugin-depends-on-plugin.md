---
"mercury": minor
---

- Let a plugin declare `dependsOn` other plugins: the loader loads dependencies first and skips a plugin fail-soft, with a logged reason, when a declared dependency is absent, failed, or forms a cycle — leaving every other plugin and the process unaffected.
