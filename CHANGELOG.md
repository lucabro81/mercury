# mercury

## 0.4.0

### Minor Changes

- Mercury writes to Jira now: creates issues, transitions them, comments on them, deletes them behind an explicit confirmation you have to type back exactly. It also keeps a git-versioned wiki of its own, read and written through its own tools, consulted before a live query or an honest admission it doesn't know.

## 0.3.0

### Minor Changes

- 79d12a9: Add Changesets-based versioning and changelog workflow: a changeset per relevant change, released individually via `bun run release` (version bump, CHANGELOG.md entry, commit, git tag).

## 0.2.0

### Minor Changes

- Wiki (Layer 2): per-user scoped read/write tools for the model, curated vs. inferred notes with structured frontmatter
- Session persistence (Layer 3): idle-timeout summarization stored as episodic memory in Qdrant
- Google Chat: per-sender identity and sessions, heuristic to skip replying when Mercury isn't addressed

## 0.1.0

### Minor Changes

- Jira read-only path: natural language to JQL, issue search/get/transitions/comments via jira-cli
- Terminal REPL and Google Chat channels, both wired to the same session/tool-calling pipeline
- Layer 1 in-context session memory with threshold-based summarization
- CLI execution model: the model proposes a command string, Mercury tokenizes and validates it against a maintainer-authored per-CLI allowlist before running anything
- Docker container (Debian-based), Ollama-backed via a configurable endpoint
