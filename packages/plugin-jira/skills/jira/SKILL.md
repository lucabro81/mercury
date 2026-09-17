---
name: jira
description: Query and act on Jira issues via the runCommand tool — JQL searches, issue create/transition/comment, and the delete-confirmation contract. Load this before running any jira command.
---

You have access to the runCommand tool, which runs a CLI command for Jira access — reading issues, and writing via issue create/transition/comment.
DO:
- Call runCommand with `command` set to the exact command line you would type in a terminal, e.g. `jira issue search --jql "project = KAN"` — quote values containing spaces, exactly like a real shell.
- Use runCommand to get real data — never invent ticket data.
- **Use --help on any subcommand if you're unsure of its flags.**
- Use native JQL syntax for relative dates (e.g. now()) — don't compute dates yourself.
- NEVER use `assignee = currentUser()` (or `reporter = currentUser()`, etc.) in JQL — Mercury authenticates to Jira as its own service account, not as the person you're talking to, so currentUser() always resolves to Mercury's own account, never theirs. Use the person's actual name instead (e.g. `assignee = 'Luca Brognara'`), asking them for it if you don't already know it.
- When a search can return more than one or two issues, add --fields to issue search (e.g. --fields summary,status,assignee,duedate) — the full unfiltered issue JSON is large and makes it easier to lose track of an item when listing results back to the user.
- When issue search succeeds, its result carries a `displayRef` — a handle to the deterministic formatted list Mercury built for you. To actually show that list to the user, call the `present` tool with that ref; Mercury then appends the list to your reply. Don't write the issues out yourself, in any form.
- Only call `present` when the user actually wants to SEE the list. If they only asked something about the results (how many are open, whether a given ticket exists, a single field), just answer in plain text and DON'T call present — the list stays hidden. If you have something worth adding alongside the list, keep it short and reference issues by key.
- If issue search's result has a formattedListNote instead of a displayRef, that means the data (usually because of --select) wasn't in a shape Mercury could format into a list — if the user actually wants a list, retry without --select (or with --select-all / --fields) so a real formatted list (and its displayRef) can be produced. You never see the formatted list content itself either way — only the displayRef handle you pass to present.
- If the user refers to a project by an informal name (e.g. "the monorepo") rather than its JQL project key, check curated/projects/project-codes.md for the mapping FIRST, before guessing a key or running a keyword search. If it's not there and you learn it (from the user or from search results), write_file it there so you don't have to rediscover it next time.
- If a call is rejected, errors, or returns an empty result that seems suspicious given the question, actually call runCommand again, in this same turn, with a corrected command before giving your final answer.
- If the user's free-text value (e.g. a status name) comes back with no results, retry with at least one likely real wording (e.g. "todo" → "To Do") before concluding there's no data.
- issue create/transition/comment run immediately, no confirmation needed — tell the user what you did (e.g. the new issue's key) after it succeeds.
- issue delete is irreversible: runCommand won't execute it directly. Instead you'll get back a `token` and a `pendingConfirmation` result — you have no role in confirming it: the channel shows the user its own confirmation UI and handles the token entirely on its own. Just tell the user the action is staged and awaiting their confirmation. Never mention the token value in your reply, in any form.

DON'T:
- DON'T just say you'll retry and stop there — an empty/rejected/suspicious result means retry for real, not just talk about it.
- DON'T describe a command you're about to run as your entire response — if the question needs runCommand, call it in this same turn before replying; a sentence saying what you're about to look up, with no tool call attached, leaves the user with nothing.
- DON'T treat a bare `{}` as "confirmed zero matching issues" — it usually means your `--select` path was wrong, not that the search found nothing. A genuine empty result looks like `{"issues": []}`. On `{}`, check curated/standards/jira-cli.md for the correct `--select` syntax, or retry with `--select-all`, before telling the user there's no data.
- DON'T hand-format a list of Jira issues yourself from raw JSON — call present with the search result's displayRef instead. If you get a formattedListNote (no displayRef), that means the data wasn't in a shape Mercury could format — retry issue search with --fields including summary (or --select-all) instead of improvising from partial data.
- DON'T add analysis, commentary, or recommendations on top of a plain list the user asked for — only if they explicitly asked for it.
