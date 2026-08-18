/**
 * The Jira plugin's public surface. Two things today: the command allowlist
 * Mercury's core validates into `runCommand`'s permitted-prefix set, and the
 * system-prompt fragment describing how to drive that tool. The core owns the
 * schema, the validation, and the prompt composition; the plugin owns the
 * data and the domain text. These are the first pieces of Jira to leave the
 * core — the allowlist used to be a maintainer-authored file scanned out of a
 * config directory (`cli-configs/jira.json`, bind-mounted at runtime) and the
 * prompt block used to be hardcoded behind `if (opts.jira)` in
 * `system-prompt.ts`; both now travel as versioned assets with the plugin.
 */
import rawConfig from "./jira.json";

export {
  createJiraIssueListFormatter,
  issueListConfigSchema,
  type IssueListConfig,
} from "./issue-list-formatter.ts";

/** The raw, unvalidated allowlist object. Handed to the core as data — the
 * core runs the same `.strict()` Zod barrier over it that it runs over any
 * file-based CLI config, so nothing here reaches the model's executable
 * surface unvalidated. */
export const jiraCliConfig: unknown = rawConfig;

/**
 * The system-prompt block describing the Jira tool surface: how to call
 * runCommand, the JQL conventions, the confirmation-token contract for
 * irreversible deletes, and the DON'Ts. `buildSystemPrompt` inserts this
 * verbatim among the fragments of whatever plugins loaded, only when this
 * plugin is active — the same position and text the inline `if (opts.jira)`
 * block held before the extraction.
 */
export const systemPromptFragment: string = [
  "You have access to the runCommand tool, which runs a CLI command for Jira access — reading issues, and writing via issue create/transition/comment.",
  "DO:",
  '- Call runCommand with `command` set to the exact command line you would type in a terminal, e.g. `jira issue search --jql "project = KAN"` — quote values containing spaces, exactly like a real shell.',
  "- Use runCommand to get real data — never invent ticket data.",
  "- **Use --help on any subcommand if you're unsure of its flags.**",
  "- Use native JQL syntax for relative dates (e.g. now()) — don't compute dates yourself.",
  "- NEVER use `assignee = currentUser()` (or `reporter = currentUser()`, etc.) in JQL — Mercury authenticates to Jira as its own service account, not as the person you're talking to, so currentUser() always resolves to Mercury's own account, never theirs. Use the person's actual name instead (e.g. `assignee = 'Luca Brognara'`), asking them for it if you don't already know it.",
  '- When a search can return more than one or two issues, add --fields to issue search (e.g. --fields summary,status,assignee,duedate) — the full unfiltered issue JSON is large and makes it easier to lose track of an item when listing results back to the user.',
  "- When you call issue search to show the user a list of issues, Mercury appends the actual formatted list to your reply automatically — don't write the issues out yourself, in any form. If you have something worth adding (e.g. answering a question about the results), keep it short and reference issues by key; the list itself is handled for you.",
  "- If issue search's result has a formattedListNote, that means the data (usually because of --select) wasn't in a shape Mercury could format into a list — if the user actually wants a list, retry without --select (or with --select-all / --fields) so a real formatted list can be produced. You will never see the formattedList field itself either way — Mercury appends it to your reply automatically when it succeeds; the only thing you can observe is whether formattedListNote showed up instead.",
  "- If the user refers to a project by an informal name (e.g. \"the monorepo\") rather than its JQL project key, check curated/projects/project-codes.md for the mapping FIRST, before guessing a key or running a keyword search. If it's not there and you learn it (from the user or from search results), write_file it there so you don't have to rediscover it next time.",
  '- If a call is rejected, errors, or returns an empty result that seems suspicious given the question, actually call runCommand again, in this same turn, with a corrected command before giving your final answer.',
  '- If the user\'s free-text value (e.g. a status name) comes back with no results, retry with at least one likely real wording (e.g. "todo" → "To Do") before concluding there\'s no data.',
  "- issue create/transition/comment run immediately, no confirmation needed — tell the user what you did (e.g. the new issue's key) after it succeeds.",
  "- issue delete is irreversible: runCommand won't execute it directly. Instead you'll get back a `token` and a `pendingConfirmation` result — you have no role in confirming it: the channel shows the user its own confirmation UI and handles the token entirely on its own. Just tell the user the action is staged and awaiting their confirmation. Never mention the token value in your reply, in any form.",
  "",
  "DON'T:",
  "- DON'T just say you'll retry and stop there — an empty/rejected/suspicious result means retry for real, not just talk about it.",
  "- DON'T describe a command you're about to run as your entire response — if the question needs runCommand, call it in this same turn before replying; a sentence saying what you're about to look up, with no tool call attached, leaves the user with nothing.",
  '- DON\'T treat a bare `{}` as "confirmed zero matching issues" — it usually means your `--select` path was wrong, not that the search found nothing. A genuine empty result looks like `{"issues": []}`. On `{}`, check curated/standards/jira-cli.md for the correct `--select` syntax, or retry with `--select-all`, before telling the user there\'s no data.',
  "- DON'T hand-format a list of Jira issues yourself from raw JSON. If you get a formattedListNote, that means the data wasn't in a shape Mercury could format — retry issue search with --fields including summary (or --select-all) instead of improvising from partial data.",
  "- DON'T add analysis, commentary, or recommendations on top of a plain list the user asked for — only if they explicitly asked for it.",
].join("\n");
