# mercury

## 0.9.0

### Minor Changes

- A new Google Chat session now starts with a short recap of the user's last session instead of a blank slate: the wiki facts that session reinforced, plus its own episodic summary.

## 0.8.0

### Minor Changes

- Episodic memory summaries no longer invent a date inside the text — the model was guessing (sometimes wrong) since it has no reliable notion of "today"; the real date is tracked in a separate, structured field instead.
- Conversations are now mirrored to episodic/semantic memory periodically during a long session, not only once it finally goes idle.
- Facts extracted about a user during a conversation are now limited to a fixed set of categories (team, role, preferred language, tools used), and no longer include the user's identity/name — that's already tracked separately, from a more reliable source.
- Mercury can now learn from its own corrected mistakes: when a tool command fails and a corrected version succeeds in the same turn, it can write a standing note about the fix for future use.
- Fixed a bug where a user's learned-preference notes could silently fail to be saved.
- Google Chat replies now arrive as a single message instead of being split into several messages at sentence boundaries — the per-tool status messages during a reply are unaffected.
- Raised the model's tool-call budget further, to allow longer multi-step research tasks to complete.

## 0.7.0

### Minor Changes

- Google Chat replies now stream in as they're generated, split into several messages at sentence boundaries, instead of arriving as one message at the end.
- A message shows which tool is currently running during a Google Chat conversation.
- A one-time note appears if too much time passes with no activity and no answer yet.
- The terminal channel now shows which tool is running as soon as it starts, instead of only after it finishes.
- Raised the model's tool-call budget so multi-step answers aren't cut short.
- A turn that still comes back with no answer now gets an explicit message instead of silence.

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
