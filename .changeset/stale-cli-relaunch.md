---
"@mercury-fw/cli": patch
---

`mfw create` (and `bun create mercury-agent`) checks the registry for a newer `@mercury-fw/cli` first, and when it's behind, as a copy left in Bun's bunx cache can be, it runs the same command through the newer version instead of writing an outdated app.
