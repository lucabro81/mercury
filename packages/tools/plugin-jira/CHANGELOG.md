# @mercury-fw/plugin-jira

## 0.3.0

### Minor Changes

- bd643ab: - `JIRA_SITE_URL` is required: without it the plugin doesn't load, and the startup log says which variable to set.
  - Every search result carries `issueCount` and the notes for the model, since the extractor is always there.

## 0.2.1

### Patch Changes

- 0c85d4a: - Installs jira CLI 0.8.1, whose `--help` examples all carry `--select`.
  - The skill no longer warns that the `--help` examples omit `--select`.

## 0.2.0

### Minor Changes

- 1a7d9d2: - The Jira skill gives a working `--select` for every read command: the list select for `issue search`, one for `issue get` and `issue transitions`, and how to count and paginate.
  - The skill no longer says to retry without `--select` or to rely on `--fields`, both refused by the `jira` CLI.
  - When a search result can't be formatted as a list, the note names the exact `--select` to rerun it with.
  - A search that selects issues without their summary (a count, an existence check) returns its data with a note instead of an error.
  - An `issue search` result with an `issues` array carries `issueCount`, the number of issues on that page, and the skill tells the model to read it instead of counting.

## 0.1.2

### Patch Changes

- 60916cb: - The wiki vault's automated commits are authored as `Mercury <mercury@mercury.local>`. Commits written before keep their old address; `git log --author=Mercury` matches both.
  - The Jira issue-list extractor's docs use a generic example site.

## 0.1.1

### Patch Changes

- 0c5bb5b: Dependencies at their latest minor: `ai` 7.0.126, `ai-sdk-ollama` 4.4.0, `zod` 4.6.5, `yaml` 2.9.1, `shell-quote` 1.11.0. A new app from `mfw create` runs Qdrant on its `v1` tag, which follows every 1.x release, instead of a fixed 1.19.0, and gets `@types/bun` `^1.4.2`.
