---
"@mercury-fw/plugin-jira": minor
---

- `JIRA_SITE_URL` is required: without it the plugin doesn't load, and the startup log says which variable to set.
- Every search result carries `issueCount` and the notes for the model, since the extractor is always there.
