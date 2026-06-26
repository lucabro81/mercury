# Mercury

## Table of contents

- [What it is](#what-it-is)
- [Installation](#installation)
- [Running it](#running-it)
- [CLIs and service authentication](#clis-and-service-authentication)
- [Architecture](ARCHITECTURE.md)

## What it is

Mercury is an agent built on a fixed orchestration loop and a pluggable tool layer. Give it the CLI for a service and it can query and act on whatever that CLI exposes. Today that's Jira and Bitbucket, with Confluence and other internal tools coming. Channels work the same way: Google Chat is the primary one right now, with a terminal interface for bootstrap and debugging, but the router isn't wired to either specifically.

## Installation

Prerequisites: Docker + Docker Compose, a reachable Ollama endpoint (local or remote).

```bash
cp .env.example .env
# fill in .env: OLLAMA_HOST, QDRANT_URL, Jira/Google Chat/GitHub credentials
```

## Running it

```bash
docker compose up
```

Starts Mercury and Qdrant. In development, `docker-compose.override.yml` is applied automatically: it mounts `src/` and reloads on every change, no manual build required.

## CLIs and service authentication

External integrations (Jira, Bitbucket, ...) are independent CLI binaries, downloaded from [CLI-monorepo](https://github.com/lucabro81/CLI-monorepo) via `scripts/install-clis.sh` — they are not part of this repo's code.

For onboarding and authentication of each service: check the README of the specific crate in CLI-monorepo, or run the `init` command of the corresponding CLI (e.g. `jira init`) and follow the on-screen instructions.
