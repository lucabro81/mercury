---
"mercury": minor
---

- Retire the model-backed issue-list corrector. Now that a formatted list reaches the user only when the model surfaces it via `present`, the extra per-turn inference that rewrote a hand-formatted list is gone. The Jira skill instead states a recall-vs-re-query rule for follow-ups: recall the prior answer when the question is about what was already said, re-query (the default) when current state or new fields are needed. The core's generic post-turn-guard mechanism stays for future use; no plugin ships a guard today.
