# Mercury

## Table of contents

- [What it is](#what-it-is)
- [Installation](#installation)
- [Running it](#running-it)
  - [Starting it](#starting-it)
  - [Rebuilding](#rebuilding)
  - [Viewing logs](#viewing-logs)
  - [Using the terminal REPL](#using-the-terminal-repl)
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
- [Architecture](ARCHITECTURE.md)

## What it is

Mercury is an agent built on a fixed orchestration loop and a pluggable tool layer. Give it the CLI for a service and it can query and act on whatever that CLI exposes. Today that's Jira: search and get issues, create them, transition them, comment on them, delete them behind an explicit confirmation. Channels work the same way: a terminal for bootstrap and debugging, Google Chat app for actual conversations, both feeding the same loop downstream.

## Installation

Prerequisites: Docker + Docker Compose, a reachable Ollama endpoint (local or remote).

```bash
cp .env.example .env
# fill in .env: OLLAMA_HOST, OLLAMA_MODEL, QDRANT_URL, Jira/Google Chat/GitHub credentials
```

Leave `GOOGLE_CHAT_PUBSUB_SUBSCRIPTION` empty to run with the terminal channel only.

## Running it

Two services, both defined in `docker-compose.yml`: `mercury` (the agent itself) and `qdrant` (the vector database backing its episodic memory, see [ARCHITECTURE.md](ARCHITECTURE.md)). `docker compose` starts, stops, and rebuilds both together.

### Starting it

```bash
docker compose up -d
```

`-d` (detached) runs it in the background: the command returns immediately, and both containers keep running after you close the terminal. Drop it to run attached, in the foreground, with every service's output printed live and `Ctrl+C` stopping everything:

```bash
docker compose up
```

---

In development, `docker-compose.override.yml` is applied automatically on top of `docker-compose.yml`: it mounts `src/` and reloads on every source change, no rebuild needed for that.

### Rebuilding

Plain `docker compose up -d` doesn't rebuild anything if an image already exists. Add `--build` whenever something outside `src/` changed (dependencies, the Dockerfile itself):

```bash
docker compose up -d --build
```

---

CLI binaries are a step further than that: `scripts/install-clis.sh` fetches them once, at image build time, and they're baked into the image from then on — the `src/` bind mount doesn't touch them, and neither does a normal `--build`. Docker caches that layer by the install script's own content (unchanged), not by whether a new release exists upstream, so a plain rebuild can silently keep serving an old binary. Force a real refetch with `--no-cache`:

```bash
docker compose build --no-cache mercury
docker compose up -d
```

### Viewing logs

```bash
docker compose logs -f
```

Follows every service's logs together, interleaved — the same thing you'd see running `docker compose up` in the foreground.

---

Name a service to follow only that one:

```bash
docker compose logs -f mercury
docker compose logs -f qdrant
```

### Using the terminal REPL

The terminal is always on. To attach to it interactively:

```bash
docker compose run --rm mercury
```

Type a question and Mercury answers, streaming the response as it generates and showing what tool it called along the way (server-side only, never sent to a chat audience). `/dump` writes the last turn's untruncated tool output to a file when the truncated live view isn't enough.

---

`Ctrl+C` exits the REPL and stops the container. To follow logs without attaching to the REPL:

```bash
docker compose logs -f mercury
```

### Getting a shell to test CLIs directly

The REPL goes through Mercury's model loop, not what you want if you're just checking that a raw command works before wiring it into a `cli-configs/*.json` allowlist. For that, open a shell in the running container instead:

```bash
docker compose exec mercury bash
```

The CLI binaries are already on `PATH` (baked in at image build time) and their credentials live in the `cli-credentials` volume mounted at `/home/mercury/.config`, so they behave exactly as they would when Mercury itself calls them.

`exit` or `Ctrl+D` leaves the shell and drops you back on the host. The container keeps running, since `exec` just attaches a second process to it, unlike the REPL's `Ctrl+C`, which stops the whole thing.

If the container isn't up yet, `docker compose run --rm mercury bash` opens one instead, and exiting it removes that one-off container without touching anything else.

### Stopping everything

```bash
docker compose down
```

Stops and removes both containers. The named volumes (wiki vault, Qdrant data, CLI credentials) aren't touched — they survive, and the next `up` picks up right where it left off. See [Resetting memory](#resetting-memory) for actually wiping one of them.

### Wiki vault maintenance

The wiki vault lives on its own Docker volume, not in this repo, so there's a small maintenance CLI for it:

```bash
scripts/vault.sh list
scripts/vault.sh read curated/standards/some-file.md
scripts/vault.sh grep "some pattern"
cat note.md | scripts/vault.sh write-curated curated/standards/new-file.md --author yourname
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for what the vault is and how Mercury itself uses it.

### Inspecting Qdrant

No dedicated CLI for this one: Qdrant's own REST API is already published on `6333` (see `docker-compose.yml`), so plain `curl` reaches it directly, container running or not.

```bash
curl -s http://localhost:6333/collections | jq
```

---

```bash
curl -s http://localhost:6333/collections/episodic_memory | jq '.result.points_count'
```

---

```bash
curl -s -X POST http://localhost:6333/collections/episodic_memory/points/scroll \
  -H "Content-Type: application/json" \
  -d '{"limit": 10, "with_payload": true}' | jq
```

Swap `episodic_memory` for `semantic_facts` or `tool_corrections` to inspect the other two collections. Drop `| jq` if it isn't installed, the raw JSON still prints fine.

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
docker compose up -d --build
```

### Redeploying

```bash
git pull && docker compose up -d --build
```

### CLI credentials without a host installation

The four CLIs (Jira, Bitbucket, Google Chat, atlassian-admin) normally read their auth from `~/.config/<cli-name>` on whatever machine runs them, which is fine in dev where you already use them outside Mercury too. A remote host usually has none of that. Instead, `.env` can carry each CLI's config as a base64-encoded tar (`JIRA_CLI_CONFIG_TAR_B64` and friends, see `.env.example` for how to generate one from a machine that already has valid credentials): `scripts/docker-entrypoint.sh` decodes it into a persistent volume the first time that volume is empty, then leaves it alone. A CLI refreshing its own token during a run writes back to that same volume, so the refresh survives a redeploy instead of reverting to the original blob every time.

### Resetting memory

```bash
scripts/reset-qdrant.sh
scripts/reset-wiki.sh
```

Each wipes its own named volume and lets Mercury reinitialize it empty on the next start, useful for clearing out test data without touching the other layer.

## Scripts

- **`vault.sh`** — maintenance CLI for the wiki vault, run manually. See [Wiki vault maintenance](#wiki-vault-maintenance).
- **`reset-qdrant.sh`** / **`reset-wiki.sh`** — wipe one memory layer after a confirmation prompt, run manually. See [Resetting memory](#resetting-memory).
- **`redeploy-gb10.sh`** — `git pull` then `docker compose up -d --build`, run manually on a remote deployment. See [Redeploying](#redeploying).
- **`install-clis.sh`** — fetches the CLI binaries from CLI-monorepo. Runs automatically at image build time, never by hand.
- **`docker-entrypoint.sh`** — the container's actual entrypoint: materializes CLI credentials from `.env` if the volume's still empty, then starts Mercury. Runs automatically at container start. See [CLI credentials without a host installation](#cli-credentials-without-a-host-installation).
- **`tag-release.sh`** — tags the version `changeset version` just bumped. Runs as part of `bun run release`, not standalone.

## CLIs and service authentication

External integrations (Jira, Bitbucket, Google Chat, ...) are independent CLI binaries, downloaded from [CLI-monorepo](https://github.com/lucabro81/CLI-monorepo) via `scripts/install-clis.sh`, not part of this repo's code.

For onboarding and authentication of each service: check the README of the specific crate in CLI-monorepo, or run the `init` command of the corresponding CLI (e.g. `jira init`, `google-chat init`) and follow the on-screen instructions.

A CLI being installed and authenticated isn't enough on its own for the model to use it: each active CLI also needs a maintainer-authored allowlist config at `MERCURY_CLI_CONFIG_DIR` (default `/app/cli-config`, bind-mounted from `./cli-configs` in dev — see `cli-configs/jira.json` for the reference example, and the CLI's own README in CLI-monorepo for what subcommands/flags it actually has). Editing a config file only needs a container restart, no rebuild.
