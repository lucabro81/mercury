---
"mercury": minor
---

- Add a durable, lossless verbatim conversation archive. Every user and model message is captured verbatim to its own Qdrant collection — separate from the sliding Layer-1 window and the derived episodic summaries — and the model can resurface earlier exchanges on demand with a new `recall_verbatim` tool, scoped to the person asking. Capture is fail-soft enrichment: a storage failure never affects the live turn. Built behind a small memory-provider interface so the mechanism is wired in at composition, not hardwired into the pipeline.
