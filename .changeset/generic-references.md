---
"@mercury-fw/core": patch
"@mercury-fw/plugin-jira": patch
---

- The wiki vault's automated commits are authored as `Mercury <mercury@mercury.local>`. Commits written before keep their old address; `git log --author=Mercury` matches both.
- The Jira issue-list extractor's docs use a generic example site.
