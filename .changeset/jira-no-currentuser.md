---
"mercury": patch
---

Fix: Mercury could build a Jira query with `assignee = currentUser()` when asked about "my tickets" — since Mercury talks to Jira as its own service account, that always means Mercury's own (empty) backlog, never the person actually asking. It now uses their real name instead.
