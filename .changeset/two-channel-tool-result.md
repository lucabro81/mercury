---
"mercury": minor
---

- Give a tool result two explicit channels: the `data` the model reasons on, and a separate structured `display` channel that is shown to the user but never placed in the model's context. This replaces the earlier implicit removal of a known rendered field, so the separation is now part of the contract rather than a heuristic strip.
