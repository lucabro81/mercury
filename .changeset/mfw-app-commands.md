---
"@mercury-fw/cli": minor
"@mercury-fw/core": minor
---

- `mfw` operates an app from inside its folder: `start`, `stop` and `restart` (with `--no-cache`), `logs`, `repl`, `shell`, all as `docker compose` calls.
- `mfw vault` maintains the wiki vault (`list`, `read`, `grep`, `write-curated`, `write-raw`) in a one-off container.
- `mfw memory list` and `mfw memory read <collection>` read the memory on Qdrant, newest first where the collection has a timestamp index.
- `mfw reset memory` and `mfw reset wiki` delete a memory volume after you type the app's name, then bring the service back up empty; after a memory reset a running app is restarted, so it sets up its collections again.
- The command line is declared with commander: `--help` at every level, a suggestion for a mistyped command, and every argument checked before anything runs.
- A scaffolded app lists `@mercury-fw/cli` among its devDependencies, at the framework's version, and its README runs it through `bunx mfw`.
- A scaffolded app's `@types/bun` and `typescript` use caret ranges instead of exact versions.
- The core ships a read-only memory CLI (`src/memory/memory-cli.ts`) next to the vault one, which is what `mfw memory` runs.
- The vault CLI says so when asked to read a note that doesn't exist, instead of printing a stack trace.
