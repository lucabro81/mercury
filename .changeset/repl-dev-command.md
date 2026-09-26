---
"mercury": minor
---

- The interactive terminal is now a separate dev command, `bun run repl` (e.g. `docker compose run --rm mercury bun run repl`), instead of being part of the running service.
- The running service is headless — it starts only the declared channels, the crons and (if enabled) the admin panel, and shuts down on `SIGINT`/`SIGTERM` rather than on terminal EOF.
