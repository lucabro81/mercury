# Architecture

## Overview

Mercury is an agent built on a fixed orchestration loop and a pluggable tool layer. Give it the CLI for a service and it can query and act on whatever that CLI exposes. Today that's Jira and Bitbucket, with Confluence and other internal tools coming. Channels work the same way: Google Chat is the primary one right now, with a terminal interface for bootstrap and debugging, but the router isn't wired to either specifically.

Two things shape almost every other decision in this doc. The LLM endpoint is hardware-agnostic: Mercury talks to Ollama through `OLLAMA_HOST` and doesn't know or care where the model runs, in dev or in production. And irreversible actions never get a model's best guess, they get an explicit confirmation step, a button on Chat or a typed token on the terminal.

## Components

- **Backend**: Bun + TypeScript, single process.
- **Tool calling**: Vercel AI SDK, no agent framework on top. The toolset is fixed and known, so custom orchestration is enough.
- **LLM**: an Ollama-compatible endpoint, external to the container, reached through `OLLAMA_HOST`.
- **Vector store**: Qdrant, external service, backs the episodic memory layer.
- **External integrations**: CLI binaries from a separate repo, invoked as subprocesses, never MCP servers.
- **Channels**: Google Chat (primary) and a terminal/stdin interface for bootstrap and debugging, both feeding the same pipeline downstream.

```
┌───────────────────────────────────────────────────────────┐
│               Mercury container                           │
│                                                           │
│  Google Chat webhook ──┐                                  │
│  Terminal / stdin ─────┼─→ Router → Session → Tool loop   │
│                        │                                  │
│              ┌─────────┼─────────┐                        │
│          jira-cli  bitbucket-cli  wiki                    │
└──────────────────┬──────────────────┬─────────────────────┘
                   │                  │
            ┌──────┴──────┐    ┌──────┴───────┐
            │    Ollama   │    │    Qdrant    │
            └─────────────┘    └──────────────┘
```

## Memory model

Three layers, each with a different lifespan and a different cost of being wrong.

**Layer 1, in-context**: the active conversation, a sliding window, lives in process memory and disappears with it.

**Layer 2, LLM Wiki**: operational knowledge the model writes to itself. Karpathy-style: only an index of one-line descriptions sits in the system prompt, the model reads full documents on demand through filesystem tools.

**Layer 3, Qdrant**: episodic memory per user, preferences and past decisions, written when a session closes.

The boundary that matters: Layer 1 is a prerequisite, Mercury doesn't function without it. Layers 2 and 3 are enrichment, Mercury has to work correctly even when they're empty or unreachable.

## Integration layer

Mercury queries services and acts on them through CLI binaries, not MCP. The LLM already knows how to use a command line, discovery happens through `--help` on demand, and nothing gets preloaded into context as a schema.

The CLIs live in a separate repo (CLI-monorepo), one crate per service, distributed as binaries through GitHub releases. Mercury's executor spawns them as subprocesses and parses their JSON output. It only runs fixed, known binaries, never arbitrary shell commands.

Which CLIs end up installed isn't decided at runtime. `scripts/install-clis.sh` lists the crates by name, so adding or dropping one means editing that list and rebuilding the image, then restarting the container. There's no hot-add: a maintainer with shell access to this repo decides what Mercury can talk to, Mercury doesn't grant itself new tools.

## Container and deploy

Single Docker container, Debian base (`oven/bun:1`). It's a stable, well-known image with everything a normal dynamically linked binary expects, which is exactly what the CLI binaries are.

The build is multi-stage. One stage downloads the CLI binaries and needs `curl` and `jq` for that; the final stage doesn't, so those dependencies, and their CVEs, never reach the running container.

Development runs through Docker Compose, not `bun run` on the host. A `docker-compose.override.yml` mounts `src/` and reloads on change, so the dev loop matches the deployment shape instead of diverging from it. `OLLAMA_HOST` in dev points at `host.docker.internal`, since Ollama runs on the host, never inside the container, in dev or in production.

## Current state

The scaffold is in place: dependencies declared, the container builds, the CLI binaries run inside it and have been verified for real, not just on a green build. There's no application logic yet, `src/` holds the module structure and nothing else. Everything from here follows TDD, one module at a time.
