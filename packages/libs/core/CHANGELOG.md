# @mercury-fw/core

## 0.31.0

### Patch Changes

- 6ae8133: - `mfw local-packages <folder>` makes an app install `@mercury-fw/*` packages from local tarballs (`bun pm pack`) instead of the registry, transitive dependencies included; `--off` goes back to the registry.
  - `mfw e2e` runs end-to-end tests against an app's real model through its REPL: cases of turns with checks on the tool calls and the answer, repeated runs, results kept in `e2e/results/`.
  - Test files declare their cases with `e2e()` from `@mercury-fw/cli/e2e`.
  - A new app's Dockerfile copies `.packs/` when present, and its `.gitignore` leaves out `.packs/` and `e2e/results/`.
  - In the REPL, `/dump` after a confirmation no longer writes the turn before it.
  - @mercury-fw/plugin-types@0.31.0
  - @mercury-fw/channel-types@0.31.0
  - @mercury-fw/cli-engine@0.31.0
  - @mercury-fw/confirm-engine@0.31.0

## 0.30.0

### Patch Changes

- @mercury-fw/plugin-types@0.30.0
- @mercury-fw/channel-types@0.30.0
- @mercury-fw/cli-engine@0.30.0
- @mercury-fw/confirm-engine@0.30.0

## 0.29.4

### Patch Changes

- 63f3da2: - Before writing to the wiki, the agent looks for a document on the same topic and updates it, instead of adding a new one each time.
  - The agent no longer writes wiki notes restating a CLI's syntax or flags, which the plugin's skill and `--help` already cover.
  - A learned command correction is keyed by the flag or subcommand it is about, without the tool's name, so corrections on the same flag land in the same note.
  - The prompts that extract command corrections and facts about the user are in English.
  - @mercury-fw/plugin-types@0.29.4
  - @mercury-fw/channel-types@0.29.4
  - @mercury-fw/cli-engine@0.29.4
  - @mercury-fw/confirm-engine@0.29.4

## 0.29.3

### Patch Changes

- @mercury-fw/plugin-types@0.29.3
- @mercury-fw/channel-types@0.29.3
- @mercury-fw/cli-engine@0.29.3
- @mercury-fw/confirm-engine@0.29.3

## 0.29.2

### Patch Changes

- @mercury-fw/plugin-types@0.29.2
- @mercury-fw/channel-types@0.29.2
- @mercury-fw/cli-engine@0.29.2
- @mercury-fw/confirm-engine@0.29.2

## 0.29.1

### Patch Changes

- 60916cb: - The wiki vault's automated commits are authored as `Mercury <mercury@mercury.local>`. Commits written before keep their old address; `git log --author=Mercury` matches both.
  - The Jira issue-list extractor's docs use a generic example site.
  - @mercury-fw/plugin-types@0.29.1
  - @mercury-fw/channel-types@0.29.1
  - @mercury-fw/cli-engine@0.29.1
  - @mercury-fw/confirm-engine@0.29.1

## 0.29.0

### Patch Changes

- @mercury-fw/plugin-types@0.29.0
- @mercury-fw/channel-types@0.29.0
- @mercury-fw/cli-engine@0.29.0
- @mercury-fw/confirm-engine@0.29.0

## 0.28.4

### Patch Changes

- @mercury-fw/plugin-types@0.28.4
- @mercury-fw/channel-types@0.28.4
- @mercury-fw/cli-engine@0.28.4
- @mercury-fw/confirm-engine@0.28.4

## 0.28.3

### Patch Changes

- @mercury-fw/plugin-types@0.28.3
- @mercury-fw/channel-types@0.28.3
- @mercury-fw/cli-engine@0.28.3
- @mercury-fw/confirm-engine@0.28.3

## 0.28.2

### Patch Changes

- 0c5bb5b: Dependencies at their latest minor: `ai` 7.0.126, `ai-sdk-ollama` 4.4.0, `zod` 4.6.5, `yaml` 2.9.1, `shell-quote` 1.11.0. A new app from `mfw create` runs Qdrant on its `v1` tag, which follows every 1.x release, instead of a fixed 1.19.0, and gets `@types/bun` `^1.4.2`.
  - @mercury-fw/plugin-types@0.28.2
  - @mercury-fw/channel-types@0.28.2
  - @mercury-fw/cli-engine@0.28.2
  - @mercury-fw/confirm-engine@0.28.2

## 0.28.1

### Patch Changes

- @mercury-fw/plugin-types@0.28.1
- @mercury-fw/channel-types@0.28.1
- @mercury-fw/cli-engine@0.28.1
- @mercury-fw/confirm-engine@0.28.1

## 0.28.0

### Patch Changes

- @mercury-fw/plugin-types@0.28.0
- @mercury-fw/channel-types@0.28.0
- @mercury-fw/cli-engine@0.28.0
- @mercury-fw/confirm-engine@0.28.0

## 0.27.1

### Patch Changes

- 2c0e020: The REPL no longer prints the answer a second time, under "risposta corretta rispetto a quanto già mostrato sopra", after a turn that reasoned or called a tool.
  - @mercury-fw/plugin-types@0.27.1
  - @mercury-fw/channel-types@0.27.1
  - @mercury-fw/cli-engine@0.27.1
  - @mercury-fw/confirm-engine@0.27.1

## 0.27.0

### Patch Changes

- @mercury-fw/plugin-types@0.27.0
- @mercury-fw/channel-types@0.27.0
- @mercury-fw/cli-engine@0.27.0
- @mercury-fw/confirm-engine@0.27.0

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

- @mercury-fw/plugin-types@0.26.0
- @mercury-fw/channel-types@0.26.0
- @mercury-fw/cli-engine@0.26.0
- @mercury-fw/confirm-engine@0.26.0

## 0.25.1

### Patch Changes

- 5613e5e: - Mercury starts even when Qdrant isn't answering yet: the memory collections are set up in the background and retried until Qdrant is reachable, instead of crashing the process at startup.
  - A new session's context primer goes on without the last-session recap when Qdrant doesn't answer, instead of failing the turn.
  - The scaffolded app's `docker-compose.yml` restarts the app service unless it was stopped.
  - @mercury-fw/plugin-types@0.25.1
  - @mercury-fw/channel-types@0.25.1
  - @mercury-fw/cli-engine@0.25.1
  - @mercury-fw/confirm-engine@0.25.1

## 0.25.0

### Minor Changes

- c114e34: - Mercury is published on npm as `@mercury-fw/*`: the framework packages move together under one version, plugins and channels have versions of their own.
  - `bun create mercury-agent my-agent` scaffolds an app, and the CLI command is now `mfw` (`@mercury-fw/cli`).
  - Packages ship type declarations, so a new app type-checks against the framework without re-checking its source.
  - External dependencies use version ranges instead of exact pins, so an app shares them with the framework.
  - Every package has its own README, and the repo README describes the framework.
  - MIT license.

### Patch Changes

- @mercury-fw/plugin-types@0.25.0
- @mercury-fw/channel-types@0.25.0
- @mercury-fw/cli-engine@0.25.0
- @mercury-fw/confirm-engine@0.25.0
