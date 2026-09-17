---
"mercury": minor
---

- Show a formatted list only when the model asks to. A tool's rendered display artifact is now stashed in a session-scoped store and the model receives only a `displayRef`; it surfaces the artifact by calling the new `present` tool. At finalize only what was presented is appended to the reply — a prose answer ("how many are open?") no longer drags the full list along. The old unconditional list-splicing is gone; when a list is shown it is always the deterministic artifact.
