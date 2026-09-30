# Mercury (reference instance)

Comperio's Mercury, the instance this repo runs in production until it moves to its own repo scaffolded with `bun create mercury-agent`: Jira, Bitbucket and atlassian-admin as tool plugins, Google Chat and HTTP as channels. It's also where the framework gets tried out end to end, so its setup is more hands-on than a scaffolded app's (the image builds from the whole monorepo, and the plugins come from the workspaces, not from npm).

For the framework itself, see the [repo README](../../README.md). The HTTP channel's API is documented in [its package](../../packages/channels/channel-http/README.md).

## Table of contents

- [Installation](#installation)
- [Running it](#running-it)
  - [Starting it](#starting-it)
  - [Rebuilding](#rebuilding)
  - [Viewing logs](#viewing-logs)
  - [Using the dev REPL](#using-the-dev-repl)
  - [Getting a shell to test CLIs directly](#getting-a-shell-to-test-clis-directly)
  - [Stopping everything](#stopping-everything)
  - [Wiki vault maintenance](#wiki-vault-maintenance)
  - [Inspecting Qdrant](#inspecting-qdrant)
- [Deploying to a remote host](#deploying-to-a-remote-host)
  - [Setting up the Chat app's Google Cloud project](#setting-up-the-chat-apps-google-cloud-project)
  - [First deploy](#first-deploy)
  - [Redeploying](#redeploying)
  - [CLI credentials without a host installation](#cli-credentials-without-a-host-installation)
  - [Resetting memory](#resetting-memory)
- [Scripts](#scripts)
- [CLIs and service authentication](#clis-and-service-authentication)

## Installation

Prerequisites: Docker + Docker Compose, a reachable Ollama endpoint (local or remote).

> **Run everything below from `apps/mercury/`.** This repo is a monorepo and Mercury is one app in it; its compose files, Dockerfile and scripts live in its own directory rather than at the root, since a future app may have no containers at all. Every path and command in this README is relative to `apps/mercury/`.

```bash
cd apps/mercury
cp .env.example .env
# fill in .env: OLLAMA_HOST, OLLAMA_MODEL, QDRANT_URL, Jira/Google Chat/GitHub credentials
```

Channels are enabled by declaring them in `mercury.config.ts`'s `channels` (declared = active, no env gate). Google Chat and HTTP are channel plugins; the interactive terminal is a dev command (`bun run repl`), not a channel of the running service. A declared channel left unconfigured stays inert, so leaving `GOOGLE_CHAT_PUBSUB_SUBSCRIPTION` empty runs without Google Chat.


## Running it

Two services, both defined in `docker-compose.yml`: `mercury` (the agent itself) and `qdrant` (the vector database backing its episodic memory). You operate them with `mfw`, the Mercury CLI, from this folder or any folder under it (`bun install` at the repo root puts it in `node_modules/.bin`); each command below says which `docker compose` call it makes, in case you need to go around it. `bunx mfw --help` lists them all, and the [CLI's README](../cli/README.md) documents each one.

### Starting it

```bash
bunx mfw start
```

Builds whatever changed and starts both services in the background (`docker compose up -d --build`): the command returns immediately, and both containers keep running after you close the terminal.

---

In development, `docker-compose.override.yml` is applied automatically on top of `docker-compose.yml`: it mounts this app's `src/` and the `@mercury-fw/core` runtime it imports, and reloads on every source change, no rebuild needed for that.

### Restarting and rebuilding

```bash
bunx mfw restart
```

Rebuilds what changed and recreates both containers even when nothing did: a clean restart. An edited `.env` doesn't need it, `bunx mfw start` already recreates what the change touches.

---

CLI binaries are a step further than that: `scripts/install-clis.sh` fetches them once, at image build time, and they're baked into the image from then on. Docker caches that layer by the install script's own content (unchanged), not by whether a new release exists upstream, so a normal rebuild can silently keep serving an old binary. Force a real refetch with `--no-cache` (`docker compose build --no-cache`, then `up -d`):

```bash
bunx mfw restart --no-cache
```

### Viewing logs

```bash
bunx mfw logs
bunx mfw logs mercury
```

Follows every service's logs together, interleaved, or only the one you name (`docker compose logs -f [service]`).

### Using the dev REPL

The interactive terminal is a dev command, not part of the running service. It boots a one-off instance and opens the REPL against it (`docker compose run --rm mercury bun run repl`):

```bash
bunx mfw repl
```

Type a question and Mercury answers, streaming the response as it generates and showing what tool it called along the way (server-side only, never sent to a chat audience). `/dump` writes the last turn's untruncated tool output to a file when the truncated live view isn't enough. The REPL is identity-less by design, so a debug session never writes to per-user memory. `Ctrl+D` (or `Ctrl+C`) ends it and removes the one-off container, leaving a running service untouched.

### Getting a shell to test CLIs directly

The REPL goes through Mercury's model loop, not what you want if you're just checking that a raw command works before wiring it into a plugin's allowlist. For that, open a shell in the container:

```bash
bunx mfw shell
```

It joins the running container (`docker compose exec mercury bash`), or opens a one-off one if the service isn't up (`docker compose run --rm mercury bash`). The CLI binaries are already on `PATH` (baked in at image build time) and their credentials live in the `cli-credentials` volume mounted at `/home/mercury/.config`, so they behave exactly as they would when Mercury itself calls them. `exit` or `Ctrl+D` leaves the shell; a joined container keeps running.

### Stopping everything

```bash
bunx mfw stop
```

Stops and removes both containers (`docker compose down`). The named volumes (wiki vault, Qdrant data, CLI credentials) aren't touched: they survive, and the next start picks up right where it left off. See [Resetting memory](#resetting-memory) for actually wiping one of them.

### Wiki vault maintenance

The wiki vault lives on its own Docker volume, not in this repo, so its maintenance runs in a one-off container on that volume:

```bash
bunx mfw vault list
bunx mfw vault read curated/standards/some-file.md
bunx mfw vault grep "some pattern"
cat note.md | bunx mfw vault write-curated curated/standards/new-file.md --author yourname
```

### Inspecting Qdrant

```bash
bunx mfw memory list
bunx mfw memory read episodic_memory --limit 10
```

`list` prints every collection with its number of points, `read` a collection's points with their payload, newest first where the collection has a timestamp index (episodic memory, the verbatim archive). Read-only. For anything else Qdrant's own REST API is published on `6333` (see `docker-compose.yml`):

```bash
curl -s http://localhost:6333/collections | jq
```

## Deploying to a remote host

Local dev applies `docker-compose.override.yml` automatically: it mounts `src/`, reuses your own host's CLI credentials, and starts an unauthenticated admin panel. None of that belongs on a host reachable by more than one person, so a remote deployment excludes it explicitly:

```
COMPOSE_FILE=docker-compose.yml
```

in `.env` (Compose applies the override by default whenever the file is present, so this line is what turns that off).

### Setting up the Chat app's Google Cloud project

A second (or third) instance needs its own Chat app identity, not a shared one: its own Google Cloud project, Pub/Sub topic and subscription, and service account. Sharing one across instances means either two processes both replying to the same message, or one conversation's events getting split between two processes with no memory of each other's half, depending on how the subscription's set up. Neither is what you want.

Most of it is scriptable:

```bash
PROJECT_ID=<pick one>
BILLING_ACCOUNT_ID=<gcloud billing accounts list>
TOPIC=mercury-chat-events
SUBSCRIPTION=mercury-chat-sub
SA_NAME=mercury-bot

gcloud projects create "$PROJECT_ID" --name="Mercury"
gcloud billing projects link "$PROJECT_ID" --billing-account="$BILLING_ACCOUNT_ID"
gcloud services enable chat.googleapis.com pubsub.googleapis.com iam.googleapis.com --project="$PROJECT_ID"

gcloud pubsub topics create "$TOPIC" --project="$PROJECT_ID"
gcloud pubsub subscriptions create "$SUBSCRIPTION" --topic="$TOPIC" --project="$PROJECT_ID"

# Google's own Chat-publishing service account needs publish rights on the topic
gcloud pubsub topics add-iam-policy-binding "$TOPIC" \
  --project="$PROJECT_ID" \
  --member="serviceAccount:chat-api-push@system.gserviceaccount.com" \
  --role="roles/pubsub.publisher"

gcloud iam service-accounts create "$SA_NAME" --project="$PROJECT_ID" --display-name="Mercury bot"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud pubsub subscriptions add-iam-policy-binding "$SUBSCRIPTION" \
  --project="$PROJECT_ID" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/pubsub.subscriber"

gcloud iam service-accounts keys create key.json --iam-account="$SA_EMAIL"
```

`key.json`'s `client_email`/`private_key` go into `GOOGLE_CHAT_APP_CLIENT_EMAIL`/`GOOGLE_CHAT_APP_PRIVATE_KEY`, and `projects/$PROJECT_ID/subscriptions/$SUBSCRIPTION` into `GOOGLE_CHAT_PUBSUB_SUBSCRIPTION`. Delete `key.json` once you've copied it in.

---

One part has no `gcloud`/API equivalent and has to be done by hand in Cloud Console, at *APIs & Services → Enabled APIs & Services → Google Chat API → Configuration*: set an app name, avatar, and description, turn on interactive features, and under connection settings pick Cloud Pub/Sub with `$TOPIC`'s full name. Add the resulting bot to a space the same way you'd add any Chat app.

### First deploy

```bash
git clone <repo-url> mercury && cd mercury
cp .env.example .env
# fill in .env: OLLAMA_HOST/OLLAMA_MODEL for that host's endpoint, service
# credentials, COMPOSE_FILE above, CLI credentials below
bun install
bunx mfw start
```

`mfw` needs Bun and a `bun install` on the host. Without them, `docker compose up -d --build` is what `mfw start` runs.

### Redeploying

```bash
git pull && bunx mfw restart
```

Add `--no-cache` to also refetch the CLI binaries. Without Bun on the host: `git pull && docker compose up -d --build`.

### CLI credentials without a host installation

The four CLIs (Jira, Bitbucket, Google Chat, atlassian-admin) normally read their auth from `~/.config/<cli-name>` on whatever machine runs them, which is fine in dev where you already use them outside Mercury too. A remote host usually has none of that. Instead, `.env` can carry each CLI's config as a base64-encoded tar (`JIRA_CLI_CONFIG_TAR_B64` and friends, see `.env.example` for how to generate one from a machine that already has valid credentials, or run `scripts/create-credentials.sh <cli-name>` there to copy it straight to the clipboard): `scripts/docker-entrypoint.sh` decodes it into a persistent volume the first time that CLI's own subdirectory is empty, then leaves it alone. A CLI refreshing its own token during a run writes back to that same volume, so the refresh survives a redeploy instead of reverting to the original blob every time.

That "only the first time" check cuts both ways, though: once a CLI's subdirectory exists, even empty or broken from a bad first attempt, the entrypoint never touches it again, silently. Fixing `.env` and redeploying afterward does nothing, since as far as the entrypoint's concerned that CLI's already set up. Clear just that one subdirectory to force a re-materialization on the next start:

```bash
scripts/reset-cli-credentials.sh jira-cli
```

### Resetting memory

```bash
bunx mfw reset memory
bunx mfw reset wiki
```

`memory` deletes every Qdrant collection, `wiki` the whole vault: each wipes its own named volume and brings its service back up on an empty one, useful for clearing out test data without touching the other layer. Both ask you to type the app's name (`mercury`) first, and anything else deletes nothing. After a memory reset a running Mercury is restarted too, since it sets up its Qdrant collections only when it starts.

## Scripts

What's left here until the CLI covers it (credentials: #57), plus what the image runs on its own. Everything else is an `mfw` command.

- **`reset-cli-credentials.sh`** — wipe one CLI's leftover subdirectory in the `cli-credentials` volume after a confirmation prompt, run manually. See [CLI credentials without a host installation](#cli-credentials-without-a-host-installation).
- **`create-credentials.sh`** — bundles one CLI's `~/.config/<cli-name>` into a base64 tar on the clipboard, run manually on a machine that already has valid credentials. See [CLI credentials without a host installation](#cli-credentials-without-a-host-installation).
- **`install-clis.sh`** — fetches the CLI binaries from CLI-monorepo. Runs automatically at image build time, never by hand.
- **`docker-entrypoint.sh`** — the container's actual entrypoint: materializes CLI credentials from `.env` if the volume's still empty, then starts Mercury. Runs automatically at container start. See [CLI credentials without a host installation](#cli-credentials-without-a-host-installation).

## CLIs and service authentication

Every external integration is a plugin (`packages/tools/plugin-*`) that owns its CLI end to end: it ships its own pinned binary, downloaded at `bun install` by the plugin's postinstall, and its own command allowlist (a `<binary>.json` living in the package, validated when the plugin loads). The core no longer knows about any CLI directly, so there's no central config directory to populate. You enable a plugin by declaring it in `mercury.config.ts` and listing its name in `MERCURY_CLIS`.

A plugin can also hand the user a list (Jira does, for `issue search`), and how that list reads is up to the instance: `mercury.config.ts` wraps the plugin with `formatterPlugin` from `@mercury-fw/formatter` and gives one rule per kind of list, the line for each item plus an optional text for an empty list. The kinds come typed from the plugin (`JiraDisplays` for Jira), so a key it doesn't emit fails the typecheck, and a kind left without a rule simply isn't shown (the model still gets the data, and the log says which rule is missing).

Authenticating a CLI stays per-crate and out of this repo: run the crate's own `init` (e.g. `jira init`), or follow its README in [CLI-monorepo](https://github.com/lucabro81/CLI-monorepo), for what subcommands and flags it actually exposes. The binary keeps its credentials under `~/.config/<cli>`, seeded once into the container's `cli-credentials` volume by `scripts/docker-entrypoint.sh` from a base64 tar in `.env` (see `*_CLI_CONFIG_TAR_B64`), or bind-mounted from the host in dev via `docker-compose.override.yml`.
