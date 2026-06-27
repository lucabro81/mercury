# Architecture

## Overview

Mercury is an agent built on a fixed orchestration loop and a pluggable tool layer. Give it the CLI for a service and it can query and act on whatever that CLI exposes. Today that's Jira, read-only, with write actions and other services coming. Channels work the same way: the terminal is always on, Google Chat turns on when `GOOGLE_CHAT_PUBSUB_TOPIC` is set, both feeding the same loop downstream.

Two things shape almost every other decision in this doc. The LLM endpoint is hardware-agnostic: Mercury talks to Ollama through `OLLAMA_HOST` and doesn't know or care where the model runs, in dev or in production. And irreversible actions never get a model's best guess, they get an explicit confirmation step, a button on Chat or a typed token on the terminal (not built yet, since there's nothing irreversible to confirm until the write path lands).

## Components

- **Backend**: Bun + TypeScript, single process.
- **Tool calling**: Vercel AI SDK, no agent framework on top. The toolset is fixed and known, so custom orchestration is enough.
- **LLM**: an Ollama-compatible endpoint, external to the container, reached through `OLLAMA_HOST`. `runTurn` uses `ai-sdk-ollama`'s `generateText`/`streamText` rather than the plain SDK calls, since the plain versions can return an empty response after a tool call on Ollama specifically.
- **Vector store**: Qdrant, external service, will back the episodic memory layer once Layer 3 lands.
- **External integrations**: CLI binaries from a separate repo, invoked as subprocesses, never MCP servers.
- **Channels**: a terminal/stdin interface, always on, and Google Chat, conditional on configuration, both calling the same `runTurn` per conversation.

```
┌────────────────────────────────────────────────────────────────┐
│                     Mercury container                          │
│                                                                │
│  Terminal/stdin ───────┐                                       │
│  Google Chat listen ───┼─→ runTurn → Layer 1 history → tools   │
│  (per joined space)    │                                       │
│                        └────────────┬─────────────┘            │
│                              jiraCli, joinSpace                │
└────────────────────┬───────────────────────────────────────────┘
                     │
              ┌──────┴──────┐
              │    Ollama   │
              └─────────────┘
```

Qdrant isn't in the diagram yet. It's provisioned in `docker-compose.yml` but nothing writes to it until Layer 3 exists.

## Memory model

Three layers, each with a different lifespan and a different cost of being wrong.

**Layer 1, in-context.** The active conversation, one `SessionHistory` per channel/space, kept in process memory. It tracks a running character count and, the moment a single append pushes the total over a threshold, summarizes everything seen so far through the model and replaces the raw messages with that summary. The check runs after every single append, not once per turn, so the threshold is caught precisely regardless of whether it's the user's message or the assistant's reply that tips it over.

**Layer 2, LLM Wiki.** Operational knowledge the model writes to itself. Karpathy-style: only an index of one-line descriptions sits in the system prompt, the model reads full documents on demand through filesystem tools. Not built yet, lands in M2.

**Layer 3, Qdrant.** Episodic memory per user, preferences and past decisions, written when a session closes. Not built yet, lands in M2.

The boundary that matters: Layer 1 is a prerequisite, Mercury doesn't function without it. Layers 2 and 3 are enrichment, Mercury has to work correctly even when they're empty or unreachable, and does today since they don't exist yet.

## Integration layer

Mercury queries services and acts on them through CLI binaries, not MCP. The LLM already knows how to use a command line, discovery happens through `--help` on demand, and nothing gets preloaded into context as a schema. `jiraCli` is one tool, not one tool per subcommand: the model picks the args, Mercury only checks them against a read-only allowlist before running anything. A command outside that allowlist gets rejected with a message that tells the model which prefixes are valid, not just that it failed.

The CLIs live in a separate repo (CLI-monorepo), one crate per service. Mercury's executor (`src/tools/cli-executor.ts`) spawns them as subprocesses and parses their JSON output. It only runs fixed, known binaries, never arbitrary shell commands. Exit code decides success or failure; if stdout isn't JSON on a clean exit (`--help` output, for instance), that's not an error, the raw text becomes the result.

Which CLIs end up installed isn't decided at runtime. `scripts/install-clis.sh` lists the crates by name, so adding or dropping one means editing that list and rebuilding the image, then restarting the container. There's no hot-add: a maintainer with shell access to this repo decides what Mercury can talk to, Mercury doesn't grant itself new tools.

## Google Chat channel

Mercury doesn't keep a hand-maintained list of which spaces to listen to. It polls `google-chat spaces list` on an interval, starts a `google-chat listen` process for every space it finds itself a member of, and stops the ones for spaces it's no longer in. Asking Mercury directly to join a space (the `joinSpace` tool) attaches immediately, without waiting for the next poll, idempotently if the channel is already running.

Every space's Workspace Events subscription publishes to the same shared Pub/Sub topic, so a channel listening for one space receives every other space's events too. Mercury filters by the event's actual target space before acting on anything, since the per-space pull-subscription name on its own is bookkeeping, not isolation. A subscription-level message filter set at creation time would do this at the infrastructure level instead, but the CLI doesn't expose that option yet (tracked as tech debt for M2).

Mercury tracks the names of messages it sent during the current process and skips any incoming event that matches one, since it's a member of the spaces it listens to and would otherwise see its own replies as new messages.

A failed discovery poll (expired credentials, a transient API error) gets logged and the loop keeps going. A channel that fails after starting (subscription rejected, the `listen` process dying on its own) gets logged too, not silently dropped, since nothing else here waits on that promise to know it failed.

## Container and deploy

Single Docker container, Debian base (`oven/bun:1`). It's a stable, well-known image with everything a normal dynamically linked binary expects, which is exactly what the CLI binaries are.

The build is multi-stage. One stage downloads the CLI binaries and needs `curl` and `jq` for that; the final stage doesn't, so those dependencies, and their CVEs, never reach the running container. The final stage does need `ca-certificates`, though: the CLI binaries verify TLS against the OS trust store, unlike Bun's own `fetch`, which bundles its own roots and works without it.

Development runs through Docker Compose, not `bun run` on the host. A `docker-compose.override.yml` mounts `src/` and reloads on change, so the dev loop matches the deployment shape instead of diverging from it. `OLLAMA_HOST` in dev points at `host.docker.internal`, since Ollama runs on the host, never inside the container, in dev or in production.

## Current state

M1 is done: the Jira read path, Layer 1 memory, the terminal channel, and the Google Chat channel are all implemented and verified live, not just passing unit tests against a fake model. Both channels have answered real questions with real Jira data, on a small local model and on the larger one targeted for production.

The terminal channel carries the debugging affordances the others don't need: streamed responses, a live token-usage indicator next to the prompt (real figures from Ollama, not an estimate), and per-tool-call visibility written to stderr. Google Chat gets the same tool-call visibility on the server side, never in the chat itself.

What's confirmed as a real limitation, not a bug: at the model sizes tested so far, instruction-following quality is the bottleneck, not context budget. Measured context usage during a degraded answer was a small fraction of what was available. Model selection for production is still open.

`src/memory/`, `src/wiki/`, and `src/cron/` stay empty until M2, which adds Layer 2 and Layer 3 on top of the Jira queries already working.
