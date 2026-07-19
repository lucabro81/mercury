## Working protocol

Before working in this repo, read `CLAUDE.local.md` (not committed, gitignored). It contains the current development plan, specs, and the history of architectural decisions. This file covers only stack and conventions — it does not summarize or duplicate project planning.

If `CLAUDE.local.md` is missing or unreadable, stop and ask — don't guess scope, architecture, or what to build.

## What it is

Mercury is an internal AI agent for Comperio: answers natural-language Jira queries, performs actions (create/transition/comment/delete) behind explicit confirmation when irreversible, keeps memory across three layers, proactively watches stalled PRs and tickets. Google Chat bot, with a terminal interface for bootstrap and debugging.

## Stack

- Runtime: Bun + TypeScript
- Tool calling: Vercel AI SDK — no agent framework on top (no LangChain, LlamaIndex, Mastra, etc.)
- LLM: Ollama-compatible endpoint, always via `OLLAMA_HOST`, never hardcoded
- Vector store: Qdrant
- External integrations: dedicated CLI binaries per service (separate repo), invoked as subprocesses — never MCP
- Container: Docker, single container, Debian base (`oven/bun:1`) — not Alpine, see Operational notes below

## Non-negotiable principles

1. **CLI, not MCP.** Every external integration is a CLI binary, discovered via `--help`, never a schema preloaded into context. The model expresses which command to run as a single command-line string, the way it would type it in a terminal — Mercury parses and validates that string before ever executing it, never handing it to a real shell.
2. **No agent framework.** Custom orchestration on top of Vercel AI SDK only.
3. **Memory layers have boundaries.** In-context history is a prerequisite for basic functionality. Any external memory/knowledge store is an enrichment — the system must work correctly even when it's empty or unreachable.
4. **Stateless container.** Anything that must survive a restart lives on an explicit external volume, never only in-process.
5. **No infrastructure before measured need.** Don't add code, caches, classifiers, or abstractions for a hypothetical problem. If something seems to be missing, say so — don't build around it silently.
6. **Irreversible actions require explicit confirmation.** An explicitly typed token the user has to send back — never a "probably fine" inferred by the model. No interactive buttons on Google Chat: Mercury impersonates a plain Workspace user there, not a registered Chat app, so the card/button machinery real apps get isn't available to it — see ARCHITECTURE.md.

## What NOT to do

- Don't add heavy dependencies (frameworks, alternative vector stores, message brokers) without flagging it first
- Don't let the CLI executor run a real shell (`sh -c`, pipes, redirects, chaining) — the model writes a command as free text, but Mercury tokenizes it into an argv array itself (`src/tools/command-parser.ts`) before spawning, and only binaries with a maintainer-authored, schema-valid, version-checked config file (`cli-configs/*.json`, loaded at startup by `src/tools/cli-config-loader.ts`) whose argv matches an allowed prefix ever execute — a prefix marked `confirm: true` in that file is staged instead of run directly, and only executes once the exact token Mercury hands back comes in as `conferma <token>` (see ARCHITECTURE.md § Integration layer)
- Don't assume where the LLM endpoint runs — always via `OLLAMA_HOST`

## Repo structure

```
mercury/
├── CLAUDE.md
├── docs/
│   ...
├── scripts/
│   └── install-clis.sh
├── cli-configs/               # maintainer-authored per-CLI allowlist config (reference: jira.json)
├── src/
│   ├── index.ts              # composition root — wires model/tools/channels
│   ├── model/                # Ollama provider, real context-window lookup
│   ├── session/               # Layer 1 history + summarizer + agent-turn loop
│   ├── tools/                 # CLI executor + command parser/allowlist (cli-tool.ts) + config schema/loader/version-check
│   ├── router/
│   │   ├── terminal.ts         # REPL channel
│   │   ├── tool-log.ts         # terminal-only debug visibility helpers
│   │   └── channels/           # Google Chat channel (discovery + per-space listen)
│   ├── memory/                # Layer 3 — episodic store (Qdrant)
│   ├── wiki/                  # Layer 2 — vault init/read/write + vault-cli.ts (maintenance CLI, see Operational notes)
│   └── cron/                  # idle-session scanner
├── Dockerfile
├── docker-compose.yml
├── docker-compose.override.yml
├── .env.example
└── package.json
```

M1 (Jira read-only path, Layer 1 memory, terminal channel, Google Chat channel) is implemented and verified live on both channels — see `CLAUDE.local.md` for current milestone status and what M2 adds. `memory/`, `wiki/`, `cron/` stay empty (`.gitkeep` only) until then.

## Versioning & changelog

SemVer via [Changesets](https://github.com/changesets/changesets), `CHANGELOG.md` is public — same audience as README/ARCHITECTURE.md.

- Every relevant change gets a changeset: `bun run changeset`, describe it, pick the bump type.
- Changeset descriptions are public text: no `D-XX`/`S-XX`/milestone references, no internal-only context — same rule as any other public doc in this repo.
- No batching: each changeset is consumed on its own via `bun run release` (`changeset version` + commit + `git tag vX.Y.Z`, see `scripts/tag-release.sh`), right after the change it documents.

## Operational notes

- **Develop via Docker, not on the host**: `docker compose up` is the normal workflow, not just deployment. `docker-compose.override.yml` mounts `src/` and uses `bun run --watch`, applied automatically by Compose with no extra flags
- `OLLAMA_HOST` in dev points to `http://host.docker.internal:11434` (Ollama runs on the host, never inside the container)
- Bun executes `.ts` natively (transpiles at runtime, zero build step) — `tsconfig.json` has `noEmit: true` on purpose. `bun run typecheck` (`tsc --noEmit`) is the separate gate for type validation, which Bun doesn't do at runtime
- `scripts/install-clis.sh` always resolves the latest release **per crate** via the GitHub API (independent releases per CLI, not a single repo-wide "latest"), and picks the right asset for the current OS/arch (`linux-x86_64`, `linux-arm64`, `macos-arm64`) — runs at build-time in the Dockerfile, not by hand
- **Base image is Debian (`oven/bun:1`), not Alpine — reopens D-13.** The CLI binaries are dynamically linked glibc binaries, not static. Verified twice (x86_64 and arm64 builds): Alpine's `gcompat` shim doesn't implement the full glibc resolver (`__res_init` missing) — the CLIs fail to run on Alpine even with `gcompat` installed, regardless of matching architecture. Confirmed the CLIs run natively on Debian with zero compatibility layer. Image size difference is small (~330MB base vs ~290MB Alpine) since the Bun runtime itself dominates the size, not the OS base — not worth the fragility of chasing partial glibc shims
- Dockerfile is multi-stage: `curl`/`jq` (needed only to download the CLI binaries) live in a separate `clis` build stage, never in the final image — keeps their CVEs out of the running container
- `apt-get upgrade` after `apt-get update` in the Dockerfile applies security patches already available in the Debian repos but not yet baked into the base image; some CVEs in `oven/bun:1` currently have no fix published yet (e.g. in `libsqlite3`, `ncurses`, `perl-base`) — checked with `trivy image` (offline scanner via `brew install trivy`, no login required unlike `docker scout`), not exploitable through anything Mercury actually uses
- **Don't `RUN chown -R` on a directory across a separate layer from where its files were created** — it duplicates all that data in the new layer (observed: +65MB for a chown that touched already-copied `node_modules`). Use `COPY --chown=user:group` on each copy, and append `&& chown -R user:group <dir>` to the same `RUN` that creates the files (e.g. `bun install`), not a separate step
- `env_file: - path: .env / required: false` in compose prevents `docker compose config` from failing when `.env` doesn't exist yet (only `.env.example` is versioned)
- **Wiki vault maintenance**: `bun run vault -- <command>` (wrapper: `scripts/vault.sh`). The vault is a Docker named volume (`WIKI_VAULT_PATH`), not a host path — there's nothing to `cd` into or open in an editor directly, every command runs through a one-off `docker compose run --rm -T mercury bun run src/wiki/vault-cli.ts` against the same volume the real service uses. Commands: `list`, `read <path>`, `grep <pattern>` (paths are always vault-relative, including the leading `curated/` — matches what `list` prints), `write-curated <curated/...path.md> [--author NAME]` (body read from stdin, e.g. `cat note.md | bun run vault -- write-curated curated/standards/x.md`). Thin routing only, no new write/read logic — reuses `wiki-note.ts`/`vault-init.ts` as-is. Deliberately does not expose `writeInferredNote`: that writer is reserved for the deterministic D-22 consolidation engine (see its own docstring), a manual CLI writing "agent-sourced" notes by hand would defeat that guarantee

## Hard-won conventions (from M1, apply going forward)

- **An unhandled rejection in an un-awaited async loop kills the whole process**, not just the feature it belongs to — every channel/poller's loop body must be wrapped in try/catch and log on failure, never let one bad tick take down the rest of Mercury (observed live: a Google Chat discovery failure took the terminal REPL down with it, since both run in the same process)
- **A long-running spawned process (`spawnLines`) must surface its own exit code and stderr** — a process that crashes on its own, silently, looks identical to a clean exit unless you check; `exited` must reject when the exit wasn't caused by the caller's own abort signal
- **Exit 0 with non-JSON stdout is success, not a parse failure** (`runCli`) — `--help` output is exactly this shape; treating it as an error sent a model into a confused retry spiral on every session that started with `--help` discovery
- **`readline`'s `output` option (needed for arrow-key/history support) must be gated on `stdin.isTTY` alone, not on whether `io.input` was injected** — passing it against a non-TTY-but-real stdin (e.g. a piped exec session) breaks normal input; passing it against a fully detached/closed stdin (a backgrounded container) crashes the process outright
- **A Pub/Sub topic shared across multiple subscriptions delivers every message to every subscriber** — there's no built-in "this subscription only gets its own events" behavior; a per-space pull-subscription *name* is bookkeeping, not isolation. Application code must filter by the event's actual target, or rely on a subscription-level message filter set at creation time (not yet exposed by the CLI as of M1 — see M2's tech-debt list)

## **IMPORTANT**

Never add Co-Authored-By lines to commits