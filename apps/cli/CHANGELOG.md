# @mercury-fw/cli

## 0.27.0

### Minor Changes

- d2a6be5: - A scaffolded app with tool plugins gets a `docker-entrypoint.sh`: at the first start without a CLI's config folder on the credentials volume, it unpacks that CLI's variable from the env file there, then starts the service. What the CLI refreshes afterwards stays on the volume.
  - The scaffolded env example lists each tool plugin's credentials variable, and the README explains the flow.
  - `mfw credentials set <plugin>` packs a CLI's config folder (`~/.config/<cli>`, or `--from <dir>`) into its variable in the app's env file, never printing it; `--print` prints the line to paste elsewhere.
  - `mfw credentials reset <plugin>` clears a CLI's folder from the credentials volume after you type the plugin's name, so a corrected variable is unpacked at the next start.

### Patch Changes

- @mercury-fw/core@0.27.0

## 0.26.0

### Minor Changes

- 8b92abb: - `mfw` operates an app from inside its folder: `start`, `stop` and `restart` (with `--no-cache`), `logs`, `repl`, `shell`, all as `docker compose` calls.
  - `mfw vault` maintains the wiki vault (`list`, `read`, `grep`, `write-curated`, `write-raw`) in a one-off container.
  - `mfw memory list` and `mfw memory read <collection>` read the memory on Qdrant, newest first where the collection has a timestamp index.
  - `mfw reset memory` and `mfw reset wiki` delete a memory volume after you type the app's name, then bring the service back up empty; after a memory reset a running app is restarted, so it sets up its collections again.
  - The command line is declared with commander: `--help` at every level, a suggestion for a mistyped command, and every argument checked before anything runs.
  - A scaffolded app lists `@mercury-fw/cli` among its devDependencies, at the framework's version, and its README runs it through `bunx mfw`.
  - A scaffolded app's `@types/bun` and `typescript` use caret ranges instead of exact versions.
  - The core ships a read-only memory CLI (`src/memory/memory-cli.ts`) next to the vault one, which is what `mfw memory` runs.
  - The vault CLI says so when asked to read a note that doesn't exist, instead of printing a stack trace.

### Patch Changes

- Updated dependencies [8b92abb]
  - @mercury-fw/core@0.26.0

## 0.25.1

### Patch Changes

- 5613e5e: - Mercury starts even when Qdrant isn't answering yet: the memory collections are set up in the background and retried until Qdrant is reachable, instead of crashing the process at startup.
  - A new session's context primer goes on without the last-session recap when Qdrant doesn't answer, instead of failing the turn.
  - The scaffolded app's `docker-compose.yml` restarts the app service unless it was stopped.
- Updated dependencies [5613e5e]
  - @mercury-fw/core@0.25.1

## 0.25.0

### Patch Changes

- Updated dependencies [c114e34]
  - @mercury-fw/core@0.25.0
