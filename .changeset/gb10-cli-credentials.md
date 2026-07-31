---
"mercury": minor
---

Mercury can now be deployed to a host where the Jira/Bitbucket/Chat CLIs aren't otherwise installed — their credentials are seeded from env vars into a persistent volume on first boot, and survive redeploys.
