# Mercury

## Table of contents

- [What it is](#what-it-is)
- [What works today](#what-works-today)
- [Installation](#installation)
- [Running it](#running-it)
- [CLIs and service authentication](#clis-and-service-authentication)
- [Architecture](ARCHITECTURE.md)

## What it is

Mercury is an agent built on a fixed orchestration loop and a pluggable tool layer. Give it the CLI for a service and it can query and act on whatever that CLI exposes. Today that's Jira, read-only, with write actions and other services coming. Channels work the same way: a terminal for bootstrap and debugging, Google Chat for actual conversations, both feeding the same loop downstream.

## What works today

Ask Mercury a Jira question in natural language, from the terminal or from a Google Chat space it's a member of, and it queries the real Jira API through `jiraCli` and answers with real data. The model figures out the CLI's flags on its own through `--help`; Mercury only enforces which subcommands are allowed, read-only for now.

Conversation history survives across turns in the same session and summarizes itself once it grows past a size threshold, instead of overflowing the model's context window.

Google Chat works the way every channel will eventually work: Mercury discovers which spaces it's a member of and listens on each one, replying in place when someone writes to it. Ask it directly to join a space and it does so immediately, without waiting for the next discovery round.

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
docker compose up
```

Starts Mercury and Qdrant. In development, `docker-compose.override.yml` is applied automatically: it mounts `src/` and reloads on every change, no manual build required.

The terminal is always on. Type a question and Mercury answers, streaming the response as it generates and showing what tool it called along the way (server-side only, never sent to a chat audience). `/dump` writes the last turn's untruncated tool output to a file when the truncated live view isn't enough.

## CLIs and service authentication

External integrations (Jira, Bitbucket, Google Chat, ...) are independent CLI binaries, downloaded from [CLI-monorepo](https://github.com/lucabro81/CLI-monorepo) via `scripts/install-clis.sh`, not part of this repo's code.

For onboarding and authentication of each service: check the README of the specific crate in CLI-monorepo, or run the `init` command of the corresponding CLI (e.g. `jira init`, `google-chat init`) and follow the on-screen instructions.
