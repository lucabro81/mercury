---
"@mercury-fw/core": patch
"@mercury-fw/cli": patch
---

- Mercury starts even when Qdrant isn't answering yet: the memory collections are set up in the background and retried until Qdrant is reachable, instead of crashing the process at startup.
- A new session's context primer goes on without the last-session recap when Qdrant doesn't answer, instead of failing the turn.
- The scaffolded app's `docker-compose.yml` restarts the app service unless it was stopped.
