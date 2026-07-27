---
"mercury": patch
---

Fix a first-run error on a brand-new deployment: seeding a new conversation with context from your last session could fail with a database error because the episodic memory collection was missing indexes it needed.
