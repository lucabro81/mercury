---
"mercury": minor
---

- The HTTP surface is now a channel plugin, enabled by declaring it in `mercury.config.ts` instead of the `HTTP_SURFACE_ENABLED` env var (retired).
- Channels are enabled by declaring them in `mercury.config.ts` (the `MERCURY_CHANNELS` env var is retired); `HTTP_SURFACE_PORT` and `HTTP_SURFACE_CORS_ORIGIN` are unchanged.
