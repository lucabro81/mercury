---
"mercury": patch
---

Fix: Mercury failed every single message when configured with a model that doesn't support Ollama's extended-thinking mode (observed with nemotron:70b — Ollama rejected every request outright instead of silently ignoring the flag, as previously assumed). Set `OLLAMA_THINK=false` to disable it for a model that needs that; defaults to on, unchanged from before.
