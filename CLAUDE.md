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
- Container: Docker, single container, Debian base (`oven/bun:1`) — not Alpine, see M0 scaffold notes below

## Non-negotiable principles

1. **CLI, not MCP.** Every external integration is a CLI binary, discovered via `--help`, never a schema preloaded into context.
2. **No agent framework.** Custom orchestration on top of Vercel AI SDK only.
3. **Memory layers have boundaries.** In-context history is a prerequisite for basic functionality. Any external memory/knowledge store is an enrichment — the system must work correctly even when it's empty or unreachable.
4. **Stateless container.** Anything that must survive a restart lives on an explicit external volume, never only in-process.
5. **No infrastructure before measured need.** Don't add code, caches, classifiers, or abstractions for a hypothetical problem. If something seems to be missing, say so — don't build around it silently.
6. **Irreversible actions require explicit confirmation.** A button or an explicitly typed token — never a "probably fine" inferred by the model.

## What NOT to do

- Don't add heavy dependencies (frameworks, alternative vector stores, message brokers) without flagging it first
- Don't let the CLI executor run arbitrary shell commands — only fixed, known binaries
- Don't assume where the LLM endpoint runs — always via `OLLAMA_HOST`

## Repo structure

```
mercury/
├── CLAUDE.md
├── docs/
│   ...
├── scripts/
│   └── install-clis.sh     
├── src/
│   ├── router/             
│   │   └── channels/
│   ├── session/            
│   ├── memory/              
│   ├── wiki/                
│   ├── tools/               
│   ├── cron/                
│   └── model/               
├── Dockerfile
├── docker-compose.yml          
├── docker-compose.override.yml 
├── .env.example
└── package.json
```

The directories under `src/` are still empty (only `.gitkeep`) — no application logic written until TDD is followed for each module.

## M0 scaffold — operational notes

- **Develop via Docker, not on the host**: `docker compose up` is the normal workflow, not just deployment. `docker-compose.override.yml` mounts `src/` and uses `bun run --watch`, applied automatically by Compose with no extra flags
- `OLLAMA_HOST` in dev points to `http://host.docker.internal:11434` (Ollama runs on the host, never inside the container)
- Bun executes `.ts` natively (transpiles at runtime, zero build step) — `tsconfig.json` has `noEmit: true` on purpose. `bun run typecheck` (`tsc --noEmit`) is the separate gate for type validation, which Bun doesn't do at runtime
- `scripts/install-clis.sh` always resolves the latest release **per crate** via the GitHub API (independent releases per CLI, not a single repo-wide "latest"), and picks the right asset for the current OS/arch (`linux-x86_64`, `linux-arm64`, `macos-arm64`) — runs at build-time in the Dockerfile, not by hand
- **Base image is Debian (`oven/bun:1`), not Alpine — reopens D-13.** The CLI binaries are dynamically linked glibc binaries, not static. Verified twice (x86_64 and arm64 builds): Alpine's `gcompat` shim doesn't implement the full glibc resolver (`__res_init` missing) — the CLIs fail to run on Alpine even with `gcompat` installed, regardless of matching architecture. Confirmed the CLIs run natively on Debian with zero compatibility layer. Image size difference is small (~330MB base vs ~290MB Alpine) since the Bun runtime itself dominates the size, not the OS base — not worth the fragility of chasing partial glibc shims
- Dockerfile is multi-stage: `curl`/`jq` (needed only to download the CLI binaries) live in a separate `clis` build stage, never in the final image — keeps their CVEs out of the running container
- `apt-get upgrade` after `apt-get update` in the Dockerfile applies security patches already available in the Debian repos but not yet baked into the base image; some CVEs in `oven/bun:1` currently have no fix published yet (e.g. in `libsqlite3`, `ncurses`, `perl-base`) — checked with `trivy image` (offline scanner via `brew install trivy`, no login required unlike `docker scout`), not exploitable through anything Mercury actually uses
- **Don't `RUN chown -R` on a directory across a separate layer from where its files were created** — it duplicates all that data in the new layer (observed: +65MB for a chown that touched already-copied `node_modules`). Use `COPY --chown=user:group` on each copy, and append `&& chown -R user:group <dir>` to the same `RUN` that creates the files (e.g. `bun install`), not a separate step
- `env_file: - path: .env / required: false` in compose prevents `docker compose config` from failing when `.env` doesn't exist yet (only `.env.example` is versioned)
