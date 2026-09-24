---
"mercury": minor
---

Round out the HTTP surface into a complete, documented contract for a custom web UI:

- **CORS** on every response plus `OPTIONS` preflight, so a browser UI on another origin can call it (`HTTP_SURFACE_CORS_ORIGIN`, default `*`).
- **Turn cancellation**: closing the `POST /turn` connection aborts the in-flight generation — the "stop" affordance for a diverging answer. Reasoning and text stream as incremental deltas, never one finished block.
- **`GET /conversation`**: a conversation's durable transcript in chronological order, backed by the verbatim archive.
- **`GET /conversations`**: the known conversations, most-recently-active first.
- **`POST /confirm`**: an explicit confirmation endpoint, an alternative to re-sending a token as chat text.
- **OpenAPI**: the surface is now described by `openapi.yaml`, served at `GET /openapi.yaml` and published as a rendered docs page on GitHub Pages.
