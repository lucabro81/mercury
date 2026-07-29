# mercury

## 0.11.0

### Minor Changes

- e3030f1: Tool activity and memory-capture writes on Google Chat now show as a live status card instead of a static one-line message: a collapsed title while the action is running, patched in place to success/failure once it's done — including which file or Qdrant collection a memory write went to. Previously you'd see a single "doing X..." line with no way to tell if or how it finished.
- e3030f1: On Google Chat and in the terminal, Mercury now shows its own reasoning live while it thinks, instead of leaving you waiting in silence for the answer. Each round of thinking gets its own status card/output block that closes once that round is done — a turn that reasons more than once (e.g. before and after a tool call) gets one per round, not a single card that reopens and reuses the same one. Nothing is shown at all for models that don't produce reasoning output.
- 322fe93: Sending a message on Google Chat now gets an immediate acknowledgement card ("Messaggio in ricezione…"), so you're not left wondering if anything happened during the few seconds before the model's own status starts appearing.
- The "Sto pensando…" reasoning card no longer updates while the model is still thinking — you'll see it appear (replacing the acknowledgement card), then it reveals the full reasoning in one go once that round of thinking is done, collapsed by default so you can expand it if you want. Previously it patched live every second or so, which meant expanding it mid-stream would just snap back closed on the next update.
- Status messages about something being saved (a conversation snippet, a correction) are now plainer too: just where it went and what's in it, no arrows or extra symbols.

## 0.10.0

### Minor Changes

- dbf9e74: Add a tool letting Mercury send a Google Chat message to a specific person by email address mid-conversation, e.g. to loop someone else in on request.
- dbf9e74: Introduce a shared Provider interface so every communication channel (terminal, Google Chat, and any future one) runs through the same turn-handling and proactive-notification logic instead of each channel duplicating it.
- 5bb3479: Confirming an irreversible action (like deleting a Jira issue) on Google Chat now shows a card with a confirm button instead of asking you to type a token back. The terminal still uses a typed token.
- dbf9e74: Rebuild the Google Chat integration as a registered Chat app with its own bot identity, replacing the previous connection that acted as a regular Workspace user. Mercury's replies now come from "Mercury" rather than from the person who set it up, and no Workspace admin action is required to connect it to a space.
- b43a256: Removed the "might be stuck" notice on Google Chat for slow replies — it added noise without adding useful information.

### Patch Changes

- 96ef41f: Simplify confirming an action: a confirmation token is now enough on its own — no need to type "conferma" in front of it anymore.
- 4543909: Fix a first-run error on a brand-new deployment: seeding a new conversation with context from your last session could fail with a database error because the episodic memory collection was missing indexes it needed.
- 96ef41f: Fix: after a restart, Mercury could bring up an old, already-resolved confirmation request out of nowhere — sometimes even inventing a confirmation token that was never real. Resolved and abandoned confirmations are now tracked properly and never resurface as if still pending.
- b43a256: Fix: after staging an irreversible action for confirmation, Mercury could still generate a follow-up reply that repeated the confirmation token back to you. It no longer gets the chance to.
- Google Chat messages and confirmation-card clicks now arrive over a persistent push connection instead of being polled every couple of seconds, so replies start noticeably sooner after you send something.

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
