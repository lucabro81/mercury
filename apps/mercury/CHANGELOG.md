# mercury

## 0.17.0

### Minor Changes

- 67bc076: CLI execution is now plugin-owned. The mechanism for running a CLI command against an allowlist lives in `@mercury/cli-engine`, a library that a CLI-based plugin depends on and uses to build its own tool from its own allowlist — the core composes nothing CLI-specific and validates no allowlists itself. An instance with no CLI plugin exposes no CLI tool at all.

  Each CLI-based plugin now contributes its own model-facing tool, named for the service (`jiraCommand`, `bitbucketCommand`), instead of a single shared `runCommand`. The command is still written as a full terminal string. File-based CLIs with no owning plugin keep a residual `runCommand` built at composition.

  The plugin contract drops `cliConfig` (a plugin owns and validates its allowlist), a plugin contributes its tools via `sessionTools` and their status labels via `toolStatusDescribers`, and the plugin apiVersion is bumped accordingly.

- 6e20e7f: - Make output formatting a composition-time decorator: `formatterPlugin(dataPlugin, handler)` wraps a plugin and renders the structured `display` its post-processors emit, with the render handler supplied in `mercury.config.ts`. Data plugins now emit structured records only, the render logic lives in the handler, and the core no longer holds any format-specific rendering.
- 797b1a8: - A new opt-in HTTP channel: `POST /turn` runs a conversation and streams the reply back as Server-Sent Events (reasoning, tool activity, text, and the confirmation token when an irreversible action is staged), resolving a confirmation through the same path every channel uses. Off by default, no authentication, and meant to stay unreachable from outside the container network — the same posture as the admin panel.
  - Read-only HTTP introspection on the same server: a manifest of the loaded plugins, their apiVersion and skills, and the active CLIs; the currently staged confirm-required actions with their tokens redacted; and the wiki, episodic/semantic memory, tool log, and health, reusing the admin panel's own functions.
- 5aab9aa: - Jira is now a standalone package, `@mercury/plugin-jira`, instead of being wired into the core.
  - Its command allowlist, its system-prompt block, and its issue-list formatting and correction all travel with the package.
  - Its CLI binary is pinned to a specific version and fetched by the package's own postinstall, so image builds are reproducible — previously the binary was resolved to "latest" at build time and two builds could differ.
  - The core loads plugins through a generic, fail-soft loader: a plugin that fails to load degrades only itself, and the core no longer names any integration at build time.
  - No change to behaviour: the same tools, prompts, and output as before.
- 2729ae0: - Add a `mercury.config.ts` composition entrypoint and a `defineMercuryConfig` helper: an instance now declares its plugin set in one app-root config file (`defineConfig`-style) instead of inline in the composition root, with no change to which plugins load or how.
- 2495c7a: - A shared plugin contract (`@mercury/plugin-types`) that the core and every plugin build against, with a required `apiVersion` so a core and a plugin built separately can detect a version mismatch instead of failing obscurely.
  - Bitbucket is now its own plugin package, extracted with the same contract as Jira and no widening of it — a second plugin that keeps the contract honest.
  - The shared CLI-binary provisioning is factored into `@mercury/utils`, so each plugin's postinstall pins and fetches its binary through one dependency-free helper.
  - The status line shown while a command runs now comes from its plugin (defaulting to "esecuzione <binary> <subcommand>") rather than the core classifying it as a read or a write.
  - Plugins can ship Agent Skills (`SKILL.md`): a skill's name and one-line description stay in the system prompt, and its full instructions load on demand via a `read_skill` tool — instead of every plugin's instructions sitting in the prompt on every turn. Jira's guidance moved to a skill.
- e930bbb: - Let a plugin declare `dependsOn` other plugins: the loader loads dependencies first and skips a plugin fail-soft, with a logged reason, when a declared dependency is absent, failed, or forms a cycle — leaving every other plugin and the process unaffected.
- df9f0a9: - Show a formatted list only when the model asks to. A tool's rendered display artifact is now stashed in a session-scoped store and the model receives only a `displayRef`; it surfaces the artifact by calling the new `present` tool. At finalize only what was presented is appended to the reply — a prose answer ("how many are open?") no longer drags the full list along. The old unconditional list-splicing is gone; when a list is shown it is always the deterministic artifact.
- f021b4e: - Retire the model-backed issue-list corrector. Now that a formatted list reaches the user only when the model surfaces it via `present`, the extra per-turn inference that rewrote a hand-formatted list is gone. The Jira skill instead states a recall-vs-re-query rule for follow-ups: recall the prior answer when the question is about what was already said, re-query (the default) when current state or new fields are needed. The core's generic post-turn-guard mechanism stays for future use; no plugin ships a guard today.
- 58b722a: - Give a tool result two explicit channels: the `data` the model reasons on, and a separate structured `display` channel that is shown to the user but never placed in the model's context. This replaces the earlier implicit removal of a known rendered field, so the separation is now part of the contract rather than a heuristic strip.
- 2bf6534: - Add a durable, lossless verbatim conversation archive. Every user and model message is captured verbatim to its own Qdrant collection — separate from the sliding Layer-1 window and the derived episodic summaries — and the model can resurface earlier exchanges on demand with a new `recall_verbatim` tool, scoped to the person asking. Capture is fail-soft enrichment: a storage failure never affects the live turn. Built behind a small memory-provider interface so the mechanism is wired in at composition, not hardwired into the pipeline.

### Patch Changes

- 4e2be1d: - Upgrade `@qdrant/js-client-rest` to 1.19 and the Qdrant server image to match, moving similarity search onto the `query` endpoint that replaced `search`.
  - Upgrade the AI SDK to `ai` 7 and `ai-sdk-ollama` 4, adopting the ai 7 canonical API (instructions, onStepEnd, isStepCount, the `stream`/`usage` result fields).
  - Bump the pinned Bun toolchain to 1.4.
  - No change to behaviour: the same turns, tools, and memory operations, verified against a real model and a real Qdrant.
- 74dd723: - Build the `runCommand` tool's usage example from the CLIs actually enabled on the instance instead of a hardcoded one, so the example never names a CLI that isn't configured.

## 0.16.3

### Patch Changes

- Fixed a system-prompt instruction that told the model to compare a formattedListNote result against formattedList — the model never sees the formattedList field at all, so that phrasing invited confused reasoning about a comparison it can't actually make.

## 0.16.2

### Patch Changes

- Added a visible status indicator while a reply's issue-list correction step is running (dim text on the terminal, a status card on Google Chat) — previously this ran silently, especially noticeable on Google Chat where nothing else was shown while it was in flight.

## 0.16.1

### Patch Changes

- Fixed several bugs in the issue-list correction feature introduced in 0.16.0: a corrected reply could render incorrectly on the terminal channel when it replaced (rather than extended) already-streamed text, the corrected text wasn't persisted into conversation history, the correction prompt didn't recognize one of the list shapes it's meant to catch, an empty rewrite could produce a blank reply, and the discard log line had no length cap.

## 0.16.0

### Minor Changes

- Mercury now detects when a reply restates a Jira issue list in free text (duplicating the deterministic issue list already appended to the message) and rewrites it via an isolated correction pass, falling back to a fixed message if the rewrite still looks like a list. The deterministic issue list itself is unaffected either way.

## 0.15.6

### Patch Changes

- Jira issue lists Mercury shows you are now always included in the reply, regardless of whether the model chose to relay them — delivery no longer depends on the model's own text generation.
- Removed a stale project-status note from CLAUDE.md.

## 0.15.5

### Patch Changes

- Fix: a CLI's credentials could get stuck after a bad first deploy attempt. The container only extracts a CLI's credentials from `.env` the first time its config directory doesn't exist yet, so fixing `.env` and redeploying afterward silently did nothing once that directory existed, even empty or broken. Added a script to clear one CLI's leftover directory so it gets re-extracted on the next start, plus a companion script to generate the base64 credential blob for `.env` in the first place.

## 0.15.4

### Patch Changes

- Fix: the GB10 redeploy script could silently reuse an old, cached CLI binary instead of picking up a newly published release, because Docker's build cache doesn't know a CLI's upstream version changed. Redeploy now always rebuilds without cache.

## 0.15.3

### Patch Changes

- 6455d48: Fix: Mercury could build a Jira query with `assignee = currentUser()` when asked about "my tickets" — since Mercury talks to Jira as its own service account, that always means Mercury's own (empty) backlog, never the person actually asking. It now uses their real name instead.

## 0.15.2

### Patch Changes

- 252db95: Fix: Mercury failed every single message when configured with a model that doesn't support Ollama's extended-thinking mode (observed with nemotron:70b — Ollama rejected every request outright instead of silently ignoring the flag, as previously assumed). Set `OLLAMA_THINK=false` to disable it for a model that needs that; defaults to on, unchanged from before.

## 0.15.1

### Patch Changes

- d6da6c3: Fix: Mercury could get stuck trying to fetch the formatted issue list via `--select formattedList` — that field doesn't exist in Jira's own response, it's added afterward, so the attempt silently returned nothing and left Mercury guessing. It's now told plainly (in the tool result itself, not just the prompt) that formattedList can't be selected that way, so it recovers in one step instead of retrying the same dead end.

## 0.15.0

### Minor Changes

- db0b69d: Jira issue lists Mercury shows you now come from a deterministic formatter instead of being freely composed in prose each time — same wording and layout every time, with a clickable link per issue. Set `JIRA_SITE_URL` to your Jira site (e.g. `https://webcomperio.atlassian.net`) to enable it; without it, results are returned exactly as before.

## 0.14.0

### Minor Changes

- a74940a: Every new conversation now starts with the wiki's own index already in view, instead of relying on Mercury deciding on its own to go look. This makes it more likely relevant existing documentation actually gets used instead of re-discovered from scratch.

### Patch Changes

- e396bb9: Fix: during the nightly wiki self-review, Mercury could write an `index.md` line for a curated doc that looked fine but wasn't actually recognized as referencing it — that doc would then get flagged as orphaned again on every subsequent run, forever. Adding or removing an index entry is now a dedicated, deterministic operation instead of free-form text the model had to get exactly right.

## 0.13.0

### Minor Changes

- 5356810: Mercury can now be deployed to a host where the Jira/Bitbucket/Chat CLIs aren't otherwise installed — their credentials are seeded from env vars into a persistent volume on first boot, and survive redeploys.
- 5356810: Added scripts to reset Qdrant's episodic/semantic memory or the wiki vault independently, without touching the other.

### Patch Changes

- 30ce532: Mercury now checks its wiki for a known mapping from an informal project name (e.g. "the monorepo") to its Jira project key before guessing or falling back to a keyword search — and records the mapping there once it learns it, instead of only remembering it for the current conversation. Previously it could end up re-discovering (or being told) the same mapping again in a later session.
- 5356810: Removed the tool that let Mercury try to add itself to a Google Chat space on request — it never actually worked (silently did nothing while claiming success), so the capability is gone rather than fixed.
- 5356810: Removed the tools for sending a Google Chat notification to a user or the admin space by email — the lookup they depended on could never resolve a real user on any actual deployment, so neither ever worked.

## 0.12.0

### Minor Changes

- 465fa61: Mercury no longer proactively watches Jira tickets or Bitbucket pull requests for staleness and reaching out about them — the whole detection-and-notify flow has been removed while it gets redesigned. If you were relying on those DMs or admin-space notices, they won't appear until the feature comes back in a future release.

### Patch Changes

- ab43866: Fix: a plain greeting or short message sent to Mercury in a Google Chat direct message could get silently dropped. The "only reply if this message is clearly directed at you" caution meant for shared multi-person spaces was being applied to every conversation, DMs included — where by definition everything you send is directed at Mercury. DMs are now recognized as such and always get a reply.

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
