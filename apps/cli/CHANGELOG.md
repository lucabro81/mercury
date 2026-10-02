# @mercury-fw/cli

## 0.29.2

### Patch Changes

- cc31536: - `mfw create` ends by saying that, without a global `mfw`, the app's commands run as `bunx mfw <command>`, and lists the global install as an optional step.
  - @mercury-fw/core@0.29.2

## 0.29.1

### Patch Changes

- Updated dependencies [60916cb]
  - @mercury-fw/core@0.29.1

## 0.29.0

### Minor Changes

- e498dad: `mfw` is meant to be installed globally (`bun add -g @mercury-fw/cli`) and used as a plain command. Inside an app, a global `mfw` at another version hands the command over to the app's own CLI, so the app's commands always match its framework. `mfw upgrade` installs the registry's latest globally, and `mfw create` run by a stale `mfw` says to. The CLI's messages, the generated app and the docs say `mfw` instead of `bunx mfw`.

### Patch Changes

- @mercury-fw/core@0.29.0

## 0.28.4

### Patch Changes

- 65e78fe: `mfw create` (and `bun create mercury-agent`) checks the registry for a newer `@mercury-fw/cli` first, and when it's behind, as a copy left in Bun's bunx cache can be, it runs the same command through the newer version instead of writing an outdated app.
  - @mercury-fw/core@0.28.4

## 0.28.3

### Patch Changes

- 5175e10: An app created with the HTTP channel publishes the surface's port on the host (`HTTP_SURFACE_PORT`, 4100 when unset), so it's reachable from outside the container; its README says where it listens and that it has no authentication.
  - @mercury-fw/core@0.28.3

## 0.28.2

### Patch Changes

- 0c5bb5b: Dependencies at their latest minor: `ai` 7.0.126, `ai-sdk-ollama` 4.4.0, `zod` 4.6.5, `yaml` 2.9.1, `shell-quote` 1.11.0. A new app from `mfw create` runs Qdrant on its `v1` tag, which follows every 1.x release, instead of a fixed 1.19.0, and gets `@types/bun` `^1.4.2`.
- Updated dependencies [0c5bb5b]
  - @mercury-fw/core@0.28.2

## 0.28.1

### Patch Changes

- ab52977: An app created with the Google Chat channel trusts `protobufjs` in `trustedDependencies`, so its install no longer reports that package's postinstall as blocked. The channel's README says to do the same when adding it by hand.
  - @mercury-fw/core@0.28.1

## 0.28.0

### Minor Changes

- 51bd439: `mfw google-chat set-key <key-file> [--subscription <name>]` writes the Google Chat channel's service account key (and its subscription) into the app's env file, the key on one line the way the channel reads it and never printed. The channel's setup uses it in place of the hand-written `sed`/`printf` step.

### Patch Changes

- @mercury-fw/core@0.28.0

## 0.27.1

### Patch Changes

- Updated dependencies [2c0e020]
  - @mercury-fw/core@0.27.1

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
