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
- Container: Docker, single container, Alpine base

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
- `scripts/install-clis.sh` always resolves the latest release **per crate** via the GitHub API (independent releases per CLI, not a single repo-wide "latest") — runs at build-time in the Dockerfile, not by hand
- **The downloaded Rust CLIs are dynamically linked glibc binaries, not static** — Alpine needs `gcompat`, but even with `gcompat` some glibc symbols (e.g. `__res_init`, DNS resolver) can be missing and still break the binary. Always verify with a real run inside the container, not just a passing build
- `apk upgrade --no-cache` before `apk add` in the Dockerfile — base Alpine images don't always include the latest security patches already available in the repos; verifiable with `trivy image` (offline scanner via `brew install trivy`, no login required unlike `docker scout`)
- `env_file: - path: .env / required: false` in compose prevents `docker compose config` from failing when `.env` doesn't exist yet (only `.env.example` is versioned)
