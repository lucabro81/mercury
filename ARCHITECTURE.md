# Architecture

## Overview

Mercury is an agent built on a fixed orchestration loop and a pluggable tool layer. Give it the CLI for a service and it can query and act on whatever that CLI exposes. Today that's Jira, read and write: search and get issues, create them, transition them, comment on them, delete them. Channels work the same way: the terminal is always on, Google Chat turns on when `GOOGLE_CHAT_PUBSUB_TOPIC` is set, both feeding the same loop downstream.

Two things shape almost every other decision in this doc. The LLM endpoint is hardware-agnostic: Mercury talks to Ollama through `OLLAMA_HOST` and doesn't know or care where the model runs, in dev or in production. And irreversible actions never get a model's best guess. They get an explicit confirmation step: a one-time token, which the model is explicitly told never to relay or mention, in any form. The channel shows it instead — a button on the confirmation card Mercury sends as a registered Google Chat app, or the bare token printed after the staged command on the terminal — and only that same token coming back, with no keyword required, actually runs the staged command. Same underlying store and resolution path on both channels, one implementation instead of two.

## Components

- **Backend**: Bun + TypeScript, single process.
- **Tool calling**: Vercel AI SDK, no agent framework on top. The toolset is fixed and known, so custom orchestration is enough.
- **LLM**: an Ollama-compatible endpoint, external to the container, reached through `OLLAMA_HOST`. `runTurn` uses `ai-sdk-ollama`'s `generateText`/`streamText` rather than the plain SDK calls, since the plain versions can return an empty response after a tool call on Ollama specifically.
- **Vector store**: Qdrant, external service, backs Layer 3 episodic memory.
- **Wiki vault**: a separate git repository on its own Docker named volume, backs Layer 2. See "Wiki vault" below.
- **External integrations**: CLI binaries from a separate repo, invoked as subprocesses, never MCP servers.
- **Channels**: a terminal/stdin interface, always on, and Google Chat, conditional on configuration, both calling the same `runTurn` per conversation.

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Mercury container                             │
│                                                                      │
│  Terminal/stdin ───────┐                                             │
│  Google Chat listen ───┼─→ runTurn → Layer 1 history → tools         │
│  (single Pub/Sub sub)  │            confirmation store               │
│                        └──────────────┬──────────────┘               │
│           runCommand, list_files/read_file/grep/write_file,          │
│                           recall_tool_calls                          │
└──────────┬──────────────────────┬────────────────────────┬───────────┘
           │                      │                        │
    ┌──────┴──────┐       ┌───────┴───────┐        ┌───────┴───────┐
    │    Ollama   │       │    Qdrant     │        │  wiki vault   │
    │             │       │  (Layer 3)    │        │  (Layer 2,    │
    │             │       │               │        │  own volume)  │
    └─────────────┘       └───────────────┘        └───────────────┘
```

## Memory model

Three layers, each with a different lifespan and a different cost of being wrong.

**Layer 1, in-context.** The active conversation, one `SessionHistory` per channel/space, kept in process memory. It tracks a running character count and, the moment a single append pushes the total over a threshold, summarizes everything seen so far through the model and replaces the raw messages with that summary. The check runs after every single append, not once per turn, so the threshold is caught precisely regardless of whether it's the user's message or the assistant's reply that tips it over.

**Layer 2, LLM Wiki.** Operational knowledge the model reads and writes through tools (`list_files`, `read_file`, `grep`, `write_file`), not preloaded into the system prompt. Three kinds of note, one git-versioned vault: `curated/` for team knowledge, conventions, standards, project status, written by a maintainer or by the model itself when it learns something worth keeping; `inferred/users/<id>/` for per-user preference facts, written exclusively by a deterministic consolidation process, never by the model's own choice — restricted to a fixed set of categories (team, role, preferred language, tools used), promoted from conversation only once a value repeats often enough across recent occurrences to outweigh whatever was already noted; `inferred/users/<id>/resolved-name.md` for facts fetched straight from an external API rather than inferred from conversation, currently just a Google Chat sender's display name, resolved lazily the first time Mercury sees an unfamiliar id and cached from then on. The same deterministic promotion mechanism also backs `curated/standards/<tool>-<topic>.md`: a corrected CLI command that fixed a failure earlier in the same turn becomes a standing note, so the same mistake doesn't repeat next time. A fourth kind, `inferred/confirmations/<userId>/<token>.md`, sits outside every root the model's own `list_files`/`grep`/`read_file` can reach at all — see Layer 3 below for why. Every write is a commit, under Mercury's own git identity, distinct from any human's, so `git log`/`git blame` tell curated content a maintainer wrote from curated content the model wrote, without needing a separate flag for it. Writes to the same vault serialize through an in-process queue, since concurrent `git commit` calls against one repo race each other.

**Layer 3, Qdrant.** Episodic memory per user. A conversation is mirrored into it periodically as it grows, not only once it finally goes idle, summarized through the model and stored as a dated record — discarding the raw transcript, keeping only the summary and a structured timestamp. Layer 3 is read back into a live conversation exactly once: when a brand-new session opens, it's seeded with the last closed session's own episodic entries (and the wiki facts that session actually reinforced) as a one-time synthetic message — not proactive retrieval on every turn, not an on-demand tool over the whole history; both were considered and explicitly rejected in favor of this narrower, session-scoped seed.

A confirm-required action's own lifecycle is deliberately kept out of that free-text summary. Staging and resolving a token are each written to their own deterministic note (`inferred/confirmations/<userId>/<token>.md`, via `writeConfirmationNote`), not folded into the model-authored episodic summary of the turn — that note lives outside `inferred/users/<id>/`, so it's structurally invisible to the model's own wiki tools, reachable only through the narrow `resolve_reference` tool given the exact token. The session-start seed surfaces only an opaque `[REQ:<token>]` marker for anything still `pending`, never the command or a "still waiting" sentence. This exists because a stale, already-resolved confirmation was found resurfacing verbatim after a restart — in one case with a fabricated token, since the model was still taught a relay convention that no longer matched how confirmation actually works. A confirmation token has a hard 5-minute TTL in the in-process `ConfirmationStore`; free text summarized into Qdrant has no such expiry, so any narrative claiming one is "still pending" goes stale almost immediately, restart or not.

The boundary that matters: Layer 1 is a prerequisite, Mercury doesn't function without it. Layers 2 and 3 are enrichment, Mercury has to work correctly even when they're empty or unreachable.

## Wiki vault

The vault lives on its own Docker named volume, not inside the container's filesystem and not in this repo, so Mercury can be killed and redeployed without losing it. That also means it's not a path you can just open in an editor. `bun run vault -- <command>` runs a maintenance CLI inside a one-off container against the same volume: `list`, `read <path>`, `grep <pattern>`, `write-curated <curated/...path.md> [--author NAME]` with the body read from stdin. It only ever reaches `writeCuratedNote`, never the inferred-notes writer, for the same reason the model's own `write_file` tool doesn't either.

The vault is its own git repository, initialized idempotently at every startup (`src/wiki/vault-init.ts`), so a wiped or brand-new volume never needs manual setup. Every write commits under Mercury's own git identity, passed inline on the git command rather than configured globally, so it works the same in a fresh checkout, in tests, or in any deployment.

Model consultation follows an explicit order set in the system prompt. For a CLI's own syntax, `--help` first, the wiki only for something `--help` doesn't cover, a team convention or a policy. For anything else, the wiki first, a live CLI query only if the wiki doesn't have the answer, honest uncertainty if neither does. `write_file` replaces a document's whole content rather than merging into it, so the model is told to read before overwriting and to prefer a new file over guessing at how to fold something into an existing one.

## Integration layer

Mercury queries services and acts on them through CLI binaries, not MCP. The LLM already knows how to use a command line, discovery happens through `--help` on demand, and nothing gets preloaded into context as a schema. `runCommand` is one tool, not one tool per CLI or subcommand: the model writes the entire invocation as a single command-line string, exactly as it would type it in a terminal (e.g. `jira issue search --jql "project = KAN"`), and Mercury tokenizes that string into an argv array itself (`src/tools/command-parser.ts`) before checking it against that binary's allowlist. The model never populates a pre-tokenized args array, and the string never reaches a real shell. A command outside that allowlist (unknown binary, or a subcommand shape that isn't allowed) gets rejected with a message that tells the model which prefixes are valid, not just that it failed.

A shape that's recognized but marked `confirm: true` (today, only `jira issue delete`) doesn't run either, but it doesn't get flatly rejected: Mercury stages the exact command in an in-process store, keyed to that session, and hands back a one-time token — one the model is told never to mention in its reply, in any form. The channel shows it instead: a button on the confirmation card Mercury sends on Google Chat, or the bare token printed after the staged command on the terminal. Confirming needs no keyword, just the token itself back: a shape check (two four-character groups joined by a fixed hyphen — that fixed hyphen position is what tells a token apart from ordinary text, not a restricted character set) tells the intercepting code whether an incoming message is a confirmation attempt at all, before it ever touches `ConfirmationStore`. Only a reply that's both shaped like a token and actually staged for that exact session, intercepted before the model ever sees it, runs the staged command, and it works once. That interception (`src/router/confirm-flow.ts`) lives at the channel layer, called from both the terminal loop and Google Chat's event handler, never inside a tool call, since running a previously-approved mutation can't depend on the model relaying anything faithfully.

`confirm` isn't the only flag a command carries. `mutating` tracks something different: whether a command changes state on the external service at all, independent of whether it needs confirmation. `issue create` is `confirm: false` (it runs immediately) but `mutating: true` (it still writes to Jira), a distinction that matters for anything that needs to know whether a turn has done something irreversible-in-spirit even without asking permission first.

That per-binary allowlist itself is not TypeScript. It's a maintainer-authored JSON file (`cli-configs/<binary>.json`, e.g. `cli-configs/jira.json`), read at container startup by `src/tools/cli-config-loader.ts`, not baked into the image (bind-mounted in `docker-compose.override.yml`, so editing it only needs a restart, not a rebuild). Its schema (`src/tools/cli-config-schema.ts`): `commands`, each an allowed `prefix` plus `confirm` and `mutating`; an optional `globalFlags` list (flags that can appear anywhere in argv, like jira's `--select`, stripped generically before prefix-matching, see `stripGlobalFlags`); an optional `minVersion`, checked against the real installed binary's `--version` output (`src/tools/cli-version-check.ts`) before that CLI is ever activated. The CLI-monorepo's own README isn't consulted automatically by Mercury, it's just the maintainer's reference for what a given CLI's subcommands/flags actually are, since the maintainer who sets `MERCURY_CLIS` already has full install-time authority over the machine (same trust tier as bind-mounting `~/.config/jira-cli` credentials).

The CLIs live in a separate repo (CLI-monorepo), one crate per service. Mercury's executor (`src/tools/cli-executor.ts`) spawns them as subprocesses (`Bun.spawn` with an argv array, never `sh -c`) and parses their JSON output. It only runs fixed, known binaries. The model writes a command as free text, but that text is tokenized and validated by Mercury before anything is spawned, never handed to a real shell. Exit code decides success or failure; if stdout isn't JSON on a clean exit (`--help` output, for instance), that's not an error, the raw text becomes the result.

Installation and activation are two separate decisions. Which CLIs end up *installed* isn't decided at runtime: `scripts/install-clis.sh` lists the crates by name, so adding or dropping one means editing that list and rebuilding the image, then restarting the container. No hot-add, a maintainer with shell access to this repo decides. Which of the installed CLIs are *active* is decided at startup instead, from `MERCURY_CLIS` and whichever config files actually exist and pass validation in `MERCURY_CLI_CONFIG_DIR`. A binary can be installed and still never reach `runCommand` if it has no config file, a malformed one, or an installed version below its `minVersion`.

## Google Chat channel

Mercury is a registered Chat app, not an impersonated Workspace user: a service-account JWT-bearer flow (`google-chat-app-client.ts`, `chat.bot` scope) authenticates it under its own bot identity, and event delivery comes through a single Pub/Sub subscription for the whole app, not one per space, consumed via StreamingPull (`@google-cloud/pubsub`, `google-chat-pubsub-stream.ts`). Joining a space is still a human action, the same as adding any other Chat app — once added, that space's events arrive on the same shared subscription with no further setup. A self-join tool (`joinSpace`/`ensureChannel`) existed for a while as an unverified Members-API call that had never actually been exercised against a real space; removed rather than left half-built, since calling it did nothing but log and claim success.

Two event kinds arrive on that one subscription: a `MESSAGE` event and a `CARD_CLICKED` event (the confirmation card's button). Mercury acks each message immediately, before `handleTurn` or the card-click handler ever runs — a real multi-step turn routinely outlasts Pub/Sub's ack deadline, and acking only after processing finished would risk a concurrent redelivery mid-turn; a hard crash mid-turn loses that one message instead of risking an endless redelivery loop. Turns for the same session (`space:sender`) are serialized through an in-process queue, so two messages arriving close together never race on the same `SessionHistory` — a session already mid-turn queues the next event instead of starting a second one concurrently.

Mercury tracks the names of messages it sent during the current process and skips any incoming event that matches one, since it's a member of every space it's in and would otherwise see its own replies as new messages.

A stream error the SDK gives up retrying gets logged and doesn't take the rest of Mercury down with it, same convention every other channel/poller loop in this project follows.

Tool calls and reasoning rounds show up as Cards v2 status cards (`google-chat-provider.ts`), not plain text: sent once as "loading", patched in place to a final state, never a second message for the same event. Google Chat's own collapsible section state is client-side only and resets to collapsed on every PATCH, which only matters for a card patched more than once. A tool card is patched exactly twice, loading then done, so the native accordion works fine there. A reasoning card used to patch every second or so while the model streamed, and expanding it mid-stream just snapped it shut again on the next patch; now it patches only once, at the end, revealing everything accumulated with the accordion collapsed by default, so nothing patches it again afterward and there's nothing left to reset.

A turn also sends an acknowledgement card the instant it starts, before the model has produced anything, covering Ollama's own prompt-prefill or model-load time (confirmed live, on the order of ten seconds, with no way to observe it more precisely: neither `/api/generate` nor `/api/chat` expose an intermediate loading event, only a final response object carrying `load_duration`/`prompt_eval_duration`/`eval_duration` after the fact). If the turn ends up reasoning, the first chunk replaces that card in place instead of sending a second one; if it never reasons, the card is simply left as the last status before the real answer.

## Container and deploy

Single Docker container, Debian base (`oven/bun:1`). It's a stable, well-known image with everything a normal dynamically linked binary expects, which is exactly what the CLI binaries are.

The build is multi-stage. One stage downloads the CLI binaries and needs `curl` and `jq` for that; the final stage doesn't, so those dependencies, and their CVEs, never reach the running container. The final stage does need `ca-certificates`, though: the CLI binaries verify TLS against the OS trust store, unlike Bun's own `fetch`, which bundles its own roots and works without it.

Development runs through Docker Compose, not `bun run` on the host. A `docker-compose.override.yml` mounts `src/` and reloads on change, so the dev loop matches the deployment shape instead of diverging from it. `OLLAMA_HOST` in dev points at `host.docker.internal`, since Ollama runs on the host, never inside the container, in dev or in production.

## Current state

The Jira read and write paths, all three memory layers, the terminal channel, and the Google Chat channel are implemented and verified live, not just passing unit tests against a fake model. Both channels have answered real questions with real Jira data and executed real writes, on a small local model and on the larger one targeted for production.

The terminal channel carries the debugging affordances the others don't need: streamed responses, a live token-usage indicator next to the prompt (real figures from Ollama, not an estimate), and per-tool-call visibility written to stderr. Google Chat gets the same tool-call visibility on the server side, never in the chat itself.

What's confirmed as a real limitation, not a bug: at the model sizes tested so far, instruction-following quality is the bottleneck, not context budget. Measured context usage during a degraded answer was a small fraction of what was available. Model selection for production is still open.

Two known gaps going forward. A Google Chat user who fires off several messages in quick succession gets a separate reply to each instead of one coherent answer to the last, since coalescing them safely means being able to abort a turn that's already run a mutating tool call, which isn't built yet. And a vault write whose git commit fails after the file already landed on disk throws to whoever called it, but nothing watches for that state independently, so it could sit uncommitted for a while unnoticed.
