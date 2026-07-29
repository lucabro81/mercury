# Mercury

## Table of contents

- [What it is](#what-it-is)
- [What works today](#what-works-today)
- [Installation](#installation)
- [Running it](#running-it)
- [CLIs and service authentication](#clis-and-service-authentication)
- [Architecture](ARCHITECTURE.md)

## What it is

Mercury is an agent built on a fixed orchestration loop and a pluggable tool layer. Give it the CLI for a service and it can query and act on whatever that CLI exposes. Today that's Jira: search and get issues, create them, transition them, comment on them, delete them behind an explicit confirmation. Channels work the same way: a terminal for bootstrap and debugging, Google Chat for actual conversations, both feeding the same loop downstream.

## What works today

Ask Mercury a Jira question in natural language, from the terminal or from a Google Chat space it's a member of, and it queries the real Jira API through `runCommand` and answers with real data. Ask it to create a ticket, move one to a different status, or add a comment, and it does that directly. Ask it to delete one and it won't run that on its own: it stages the delete and hands back a one-time token. Confirming it never means typing a magic word — on Google Chat it's a button click on the card Mercury sends, on the terminal it's pasting that token back as-is. The model figures out a CLI's flags on its own through `--help`; Mercury only enforces which subcommands are allowed and which ones need that confirmation step first.

Mercury also keeps a wiki, a git-versioned knowledge base it reads and writes through its own tools, consulted before falling back to a live CLI query or admitting it doesn't know something.

Conversation history survives across turns in the same session and summarizes itself once it grows past a size threshold, instead of overflowing the model's context window. A session idle long enough gets summarized again and stored as episodic memory in Qdrant, then dropped from active memory.

Google Chat works the way every channel will eventually work: Mercury is a registered Chat app with its own bot identity, replying in place wherever someone messages it. Joining a new space today still means adding it as a member yourself in Google Chat; a self-join tool exists but isn't verified against a real space yet.

On Google Chat, a tool call or a round of reasoning shows up as its own status card instead of silence: sent the moment it starts, patched in place once it finishes. A reasoning card stays closed until that round is actually done, since Google Chat resets a card's own expand state on every patch, and one patched every second while streaming would keep snapping shut. An acknowledgement card covers the gap before any of that, while Ollama is still loading the model or working through the prompt.

Both channels are verified against a real Ollama model, not just unit tests with a fake one.

## Installation

Prerequisites: Docker + Docker Compose, a reachable Ollama endpoint (local or remote).

```bash
cp .env.example .env
# fill in .env: OLLAMA_HOST, OLLAMA_MODEL, QDRANT_URL, Jira/Google Chat/GitHub credentials
```

Leave `GOOGLE_CHAT_PUBSUB_TOPIC` empty to run with the terminal channel only.

## Running it

```bash
docker compose up -d
```

Starts Mercury and Qdrant in the background. In development, `docker-compose.override.yml` is applied automatically: it mounts `src/` and reloads on every change, no manual build required — for source changes.

CLI binaries are the exception: `scripts/install-clis.sh` fetches them once, at image build time, and they're baked into the image from then on — the `src/` bind mount doesn't touch them. A new release on CLI-monorepo doesn't reach the running container until you rebuild — and a plain `--build` isn't enough to guarantee that: Docker caches the `RUN ./scripts/install-clis.sh` layer by its inputs (the script's own content, unchanged), not by whether something changed on GitHub, so a normal rebuild can silently keep serving an old binary. Force it with `--no-cache`:

```bash
docker compose build --no-cache mercury
docker compose up -d
```

**Using the terminal REPL**

The terminal is always on. To attach to it interactively:

```bash
docker compose run --rm mercury
```

Type a question and Mercury answers, streaming the response as it generates and showing what tool it called along the way (server-side only, never sent to a chat audience). `/dump` writes the last turn's untruncated tool output to a file when the truncated live view isn't enough.

`Ctrl+C` exits the REPL and stops the container. To follow logs without attaching to the REPL:

```bash
docker compose logs -f mercury
```

**Stopping everything**

```bash
docker compose down
```

**Wiki vault maintenance**

The wiki vault lives on its own Docker volume, not in this repo, so there's a small maintenance CLI for it:

```bash
bun run vault -- list
bun run vault -- read curated/standards/some-file.md
bun run vault -- grep "some pattern"
cat note.md | bun run vault -- write-curated curated/standards/new-file.md --author yourname
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for what the vault is and how Mercury itself uses it.

## CLIs and service authentication

External integrations (Jira, Bitbucket, Google Chat, ...) are independent CLI binaries, downloaded from [CLI-monorepo](https://github.com/lucabro81/CLI-monorepo) via `scripts/install-clis.sh`, not part of this repo's code.

For onboarding and authentication of each service: check the README of the specific crate in CLI-monorepo, or run the `init` command of the corresponding CLI (e.g. `jira init`, `google-chat init`) and follow the on-screen instructions.

A CLI being installed and authenticated isn't enough on its own for the model to use it: each active CLI also needs a maintainer-authored allowlist config at `MERCURY_CLI_CONFIG_DIR` (default `/app/cli-config`, bind-mounted from `./cli-configs` in dev — see `cli-configs/jira.json` for the reference example, and the CLI's own README in CLI-monorepo for what subcommands/flags it actually has). Editing a config file only needs a container restart, no rebuild.
