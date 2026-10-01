# @mercury-fw/plugin-jira

## 0.1.2

### Patch Changes

- 60916cb: - The wiki vault's automated commits are authored as `Mercury <mercury@mercury.local>`. Commits written before keep their old address; `git log --author=Mercury` matches both.
  - The Jira issue-list extractor's docs use a generic example site.

## 0.1.1

### Patch Changes

- 0c5bb5b: Dependencies at their latest minor: `ai` 7.0.126, `ai-sdk-ollama` 4.4.0, `zod` 4.6.5, `yaml` 2.9.1, `shell-quote` 1.11.0. A new app from `mfw create` runs Qdrant on its `v1` tag, which follows every 1.x release, instead of a fixed 1.19.0, and gets `@types/bun` `^1.4.2`.
