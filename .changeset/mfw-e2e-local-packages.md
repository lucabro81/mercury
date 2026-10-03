---
"@mercury-fw/cli": minor
"@mercury-fw/core": patch
---

- `mfw local-packages <folder>` makes an app install `@mercury-fw/*` packages from local tarballs (`bun pm pack`) instead of the registry, transitive dependencies included; `--off` goes back to the registry.
- `mfw e2e` runs end-to-end tests against an app's real model through its REPL: cases of turns with checks on the tool calls and the answer, repeated runs, results kept in `e2e/results/`.
- Test files declare their cases with `e2e()` from `@mercury-fw/cli/e2e`.
- A new app's Dockerfile copies `.packs/` when present, and its `.gitignore` leaves out `.packs/` and `e2e/results/`.
- In the REPL, `/dump` after a confirmation no longer writes the turn before it.
