---
"mercury": patch
---

- Upgrade `@qdrant/js-client-rest` to 1.19 and the Qdrant server image to match, moving similarity search onto the `query` endpoint that replaced `search`.
- Upgrade the AI SDK to `ai` 7 and `ai-sdk-ollama` 4, adopting the ai 7 canonical API (instructions, onStepEnd, isStepCount, the `stream`/`usage` result fields).
- Bump the pinned Bun toolchain to 1.4.
- No change to behaviour: the same turns, tools, and memory operations, verified against a real model and a real Qdrant.
