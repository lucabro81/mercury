# @mercury-fw/cli

`mfw`, the command-line tool of [Mercury](https://github.com/lucabro81/mercury-fw): it creates an app, then runs it. Every command except `create` works from inside an app, meaning its folder or any folder under it (the one holding `mercury.config.ts`), and wraps the `docker compose` calls that app needs, so you don't have to remember them; each section below says which calls those are. New commands get documented here as they're added.

## Table of contents

- [Getting it](#getting-it)
- [Usage](#usage)
  - [`mfw create <folder>`](#mfw-create-folder)
  - [`mfw start [--no-cache]`](#mfw-start---no-cache)
  - [`mfw stop`](#mfw-stop)
  - [`mfw restart [--no-cache]`](#mfw-restart---no-cache)
  - [`mfw logs [service]`](#mfw-logs-service)
  - [`mfw repl`](#mfw-repl)
  - [`mfw shell`](#mfw-shell)
  - [`mfw vault <command>`](#mfw-vault-command)
  - [`mfw memory list`](#mfw-memory-list)
  - [`mfw memory read <collection> [--limit N]`](#mfw-memory-read-collection---limit-n)
  - [`mfw reset <memory|wiki>`](#mfw-reset-memorywiki)
  - [`mfw credentials set <plugin> [--from <dir>] [--print]`](#mfw-credentials-set-plugin---from-dir---print)
  - [`mfw credentials reset <plugin>`](#mfw-credentials-reset-plugin)
  - [`mfw google-chat set-key <key-file> [--subscription <name>]`](#mfw-google-chat-set-key-key-file---subscription-name)
- [Help](#help)

## Getting it

A new app comes from `bun create mercury-agent`, which is `mfw create` under the `create` convention:

```bash
bun create mercury-agent my-agent
```

The app it writes lists `@mercury-fw/cli` among its devDependencies, at the same version as the framework it depends on, so after `bun install` in the app every other command runs as `bunx mfw <command>`, with no global install.

## Usage

### `mfw create <folder>`

Writes a new Mercury app into `<folder>`, which has to be missing or empty; the folder's own name is turned into kebab case (`My Agent` becomes `my-agent`, the path above it stays as typed). Without flags it asks:

- the app name (the `name` in `package.json`, defaulting to the folder's);
- the assistant's name and role, which become `persona/identity.md` ("You are Hermes, the platform team's release assistant.") next to a `persona/tone.md` to edit;
- which channels and which tool plugins to include (none is fine: the REPL always works).

It writes the `mercury.config.ts` for that selection, the persona, the service and REPL entrypoints, a Dockerfile, a compose file with Qdrant, and an env example listing every variable the chosen pieces read. A plugin that hands over lists comes wrapped in the formatter with a starting rule, yours to change. Nothing is installed: run `bun install` in the new app.

| Flag | |
|---|---|
| `--name <name>` | The app name. |
| `--assistant-name <name>` | The assistant's name (default `Mercury`). |
| `--role <text>` | Completes "You are <name>, …" (default `an internal assistant`). |
| `--channels <ids>` | Comma-separated: `google-chat`, `http`. |
| `--plugins <ids>` | Comma-separated: `jira`, `bitbucket`, `atlassian-admin`. |
| `-y`, `--yes` | No questions: the flags, and the defaults for the rest. |

```bash
bun create mercury-agent my-agent
bunx @mercury-fw/cli create my-agent --assistant-name Hermes --channels http --plugins jira --yes
```

The framework packages get the CLI's own version (they're released together); each chosen plugin or channel gets its latest version on the registry, `https://registry.npmjs.org` unless `MFW_REGISTRY` names another.

### `mfw start [--no-cache]`

Builds the app's image and starts the app and Qdrant in the background (`docker compose up -d --build`). Docker's cache means only what changed gets rebuilt, and a running container is recreated only if its image or configuration changed, so it's also the command to run after changing a dependency, the Dockerfile or `.env`. `--no-cache` rebuilds everything from scratch (`docker compose build --no-cache`, then `up -d`), which is what refetches a tool plugin's CLI binary when a new release is out: a normal build keeps the cached one.

```bash
bunx mfw start
bunx mfw start --no-cache
```

### `mfw stop`

Stops the app and Qdrant and removes their containers (`docker compose down`). The volumes stay, so memory, the wiki and the CLI credentials are all there on the next start.

```bash
bunx mfw stop
```

### `mfw restart [--no-cache]`

Like `start`, but recreates the containers even when nothing changed (`--force-recreate`): a clean restart, for a process that got stuck. A changed `.env` doesn't need it, `start` already recreates what the change touches. `--no-cache` as in `start`.

```bash
bunx mfw restart
bunx mfw restart --no-cache
```

### `mfw logs [service]`

Follows the logs of every service, interleaved, or only of the one you name, `mercury` or `qdrant` (`docker compose logs -f`). One service at most. `Ctrl+C` stops following, the app keeps running.

```bash
bunx mfw logs
bunx mfw logs mercury
```

### `mfw repl`

Opens the dev REPL, a conversation with the assistant in the terminal, in a one-off container (`docker compose run --rm mercury bun run repl`). The REPL has no user identity by design, so what you try there never lands in anyone's memory; ending it (`Ctrl+D`) removes the one-off container and leaves a running app alone.

```bash
bunx mfw repl
```

### `mfw shell`

Opens a shell in the app's container: the running one if the app is up (`docker compose exec mercury bash`), a one-off one otherwise (`docker compose run --rm mercury bash`). The tool plugins' CLIs are on `PATH` there with their credentials, so it's where you check that a command works before blaming the model.

```bash
bunx mfw shell
```

### `mfw vault <command>`

Maintains the wiki vault, which lives on a Docker volume and not in the app's folder, so every command runs in a one-off container on that volume (`docker compose run --rm -T mercury bun …`). Paths are vault-relative, the way `list` prints them, `curated/` or `raw/` included.

| Command | |
|---|---|
| `list` | Every note. |
| `read <path>` | One note (a path that isn't one says so, exit 1). |
| `grep <pattern>` | Every line matching `<pattern>`, a regular expression, as `path:line:text`. A pattern starting with `-` goes after `--` (`mfw vault grep -- -h`). |
| `write-curated <path> [--author NAME]` | Writes a curated note, the body read from stdin. |
| `write-raw <path>` | Writes raw material for the nightly review to triage, the body read from stdin. |

```bash
bunx mfw vault list
bunx mfw vault read curated/standards/jira-fields.md
bunx mfw vault grep "story points"
cat note.md | bunx mfw vault write-curated curated/standards/new-note.md --author luca
```

There's no command writing inferred notes on purpose: those are the agent's own, written only by its consolidation.

### `mfw memory list`

Lists the collections of the memory on Qdrant with how many points each holds, in a one-off container that reaches Qdrant the way the app does. Read-only.

```bash
bunx mfw memory list
```

```
episodic_memory  25 points
semantic_facts  20 points
tool_corrections  37 points
verbatim_archive  0 points
```

### `mfw memory read <collection> [--limit N]`

Prints a collection's points, each as its id followed by one line per payload field. Newest first where the collection has a timestamp index (episodic memory and the verbatim archive do); in Qdrant's own order otherwise, and it says so. `--limit` defaults to 20. Read-only.

```bash
bunx mfw memory read episodic_memory
bunx mfw memory read semantic_facts --limit 5
```

### `mfw reset <memory|wiki>`

Deletes for good what the assistant remembers: `memory` is every collection on Qdrant, `wiki` the whole vault. It reads the volume's real name from the compose file, tells you which one is about to go, and asks you to type the app's name (the `name` in `package.json`); anything else, an empty answer, a `y` or closing the input included, deletes nothing and exits 1. Once confirmed it stops the service using the volume, removes its container and the volume, and starts the service again on an empty one (`docker compose stop`, `rm -f`, `docker volume rm`, `up -d`). After `memory`, a running app is restarted too (`docker compose restart mercury`), since it sets up its collections only when it starts.

If a step fails once the service is stopped (the volume still in use by a one-off container, say), it stops there and says the service is down: `bunx mfw start` brings it back.

```bash
bunx mfw reset memory
bunx mfw reset wiki
```

Useful for clearing out test data; the other layer isn't touched.

### `mfw credentials set <plugin> [--from <dir>] [--print]`

Hands a tool plugin's CLI its login. Every such CLI keeps it in a config folder of its own (`jira-cli`, `bitbucket-cli`, `atlassian-admin-cli`); log in with the CLI on your machine first, then this packs that folder (`~/.config/<cli>`, or `--from` when it lives elsewhere) into a base64 tar.gz and writes it as the plugin's variable in the app's `.env` (`JIRA_CLI_CONFIG_TAR_B64` and so on), replacing an older value and leaving the other lines alone. The value is never printed; `--print` prints the whole line instead and leaves `.env` alone, for pasting it into another host's.

When the container starts, the app's `docker-entrypoint.sh` unpacks the variable onto the credentials volume, but only if that CLI's folder isn't there yet: what the CLI writes back while running, like a refreshed token, stays on the volume across redeploys, and an older value in `.env` never overwrites it. `<plugin>` has to be a tool plugin the app depends on.

```bash
bunx mfw credentials set jira
bunx mfw credentials set bitbucket --from ~/work/bitbucket-login
bunx mfw credentials set jira --print
```

### `mfw credentials reset <plugin>`

Deletes the plugin's CLI folder from the credentials volume, so the variable in `.env` is unpacked again at the next start: what to run after correcting a variable whose folder is already on the volume, since the entrypoint never touches an existing folder. It asks you to type the plugin's name first, because a token the CLI refreshed on the volume goes too (and with a CLI that rotates its refresh token, the one in `.env` may no longer work). Once confirmed it stops the app, removes the folder in a one-off container of the app's own image, and starts the app again (`docker compose stop mercury`, `run --rm --no-deps -T mercury rm -rf …`, `up -d mercury`).

```bash
bunx mfw credentials reset jira
```

### `mfw google-chat set-key <key-file> [--subscription <name>]`

Writes the Google Chat channel's credentials into the app's `.env`, from the service account's JSON key (the file `gcloud iam service-accounts keys create` writes): `GOOGLE_CHAT_APP_CLIENT_EMAIL`, and `GOOGLE_CHAT_APP_PRIVATE_KEY` on one line with literal `\n`, the way the channel reads it. With `--subscription` (`projects/<project>/subscriptions/<name>`) it sets `GOOGLE_CHAT_PUBSUB_SUBSCRIPTION` too; without it, that line stays as it is, which is what you want when only the key changes. Older values and the empty lines `mfw create` leaves are replaced, the other lines stay alone, and the key is never printed.

It checks everything before writing: the app has to depend on `@mercury-fw/channel-google-chat`, the file has to be a service account key and the subscription has to have that shape, otherwise it exits 1 saying why and `.env` stays as it was. Delete the key file afterwards; `bunx mfw start` applies the change to a running app. The whole setup of the Chat app is in the [channel's README](https://github.com/lucabro81/mercury-fw/tree/main/packages/channels/channel-google-chat#setting-up-the-chat-app).

```bash
bunx mfw google-chat set-key key.json --subscription projects/my-project/subscriptions/mercury-chat-sub
bunx mfw google-chat set-key new-key.json
```

## Help

`mfw --help` lists every command, and `--help` after any of them describes it, down to the subcommands (`mfw vault write-curated --help`). A mistyped command gets a suggestion (`mfw strat` → "Did you mean start?"). Every argument is checked before anything runs: a wrong one exits 1 saying why, with no container started.

MIT
