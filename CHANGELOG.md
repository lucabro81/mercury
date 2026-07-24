# mercury

## 0.7.0

### Minor Changes

- Google Chat replies now stream in as they're generated instead of arriving as one message at the end: the answer is split into several messages at sentence boundaries, a message shows which tool is currently running, and a one-time note appears if too much time passes with no activity. The terminal channel now shows which tool is running as soon as it starts, instead of only after it finishes. Also raises the model's tool-call budget so multi-step answers aren't cut short, with an explicit message if a turn still comes back empty.

## 0.6.0

### Minor Changes

- Fixed the Google Chat channel failing to start after a restart — subscription handling now reuses an existing active subscription instead of erroring.
- Fixed a crash when listening on a space with no subscription history yet.
- Mercury can now run `google-chat` CLI commands directly, including a confirm-gated message delete.
- Mercury can now recall its own past tool calls when asked what it actually did, instead of reconstructing them from memory.

## 0.5.0

### Minor Changes

- Mercury now watches for Jira tickets and Bitbucket pull requests that have stalled (no movement, or a reviewer who hasn't approved yet) and reaches out directly — a message composed fresh each time, aware of what it's already said, never a fixed template. You can ask it to stop notifying about something specific, and it will, once you confirm. Which items count as stale, and which Bitbucket repositories to watch, live in a document Mercury itself updates when you ask it to in conversation.
- Mercury also runs a nightly self-review of its own wiki: triaging notes, checking the index for orphaned pages, and flagging contradictions, so the wiki stays healthy without someone doing that by hand.
- Its memory starts consolidating too: facts that repeat across separate conversations (a stated preference, recurring context) get promoted into a standing note about you, instead of only being remembered inside whichever conversation they came up in.

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
