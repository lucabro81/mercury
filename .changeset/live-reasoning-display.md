---
"mercury": minor
---

On Google Chat and in the terminal, Mercury now shows its own reasoning live while it thinks, instead of leaving you waiting in silence for the answer. Each round of thinking gets its own status card/output block that closes once that round is done — a turn that reasons more than once (e.g. before and after a tool call) gets one per round, not a single card that reopens and reuses the same one. Nothing is shown at all for models that don't produce reasoning output.
