---
"mercury": minor
---

- Make output formatting a composition-time decorator: `formatterPlugin(dataPlugin, handler)` wraps a plugin and renders the structured `display` its post-processors emit, with the render handler supplied in `mercury.config.ts`. Data plugins now emit structured records only, the render logic lives in the handler, and the core no longer holds any format-specific rendering.
