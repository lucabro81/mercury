---
"@mercury-fw/plugin-jira": minor
---

- The Jira skill gives a working `--select` for every read command: the list select for `issue search`, one for `issue get` and `issue transitions`, and how to count and paginate.
- The skill no longer says to retry without `--select` or to rely on `--fields`, both refused by the `jira` CLI.
- When a search result can't be formatted as a list, the note names the exact `--select` to rerun it with.
- A search that selects issues without their summary (a count, an existence check) returns its data with a note instead of an error.
- An `issue search` result with an `issues` array carries `issueCount`, the number of issues on that page, and the skill tells the model to read it instead of counting.
