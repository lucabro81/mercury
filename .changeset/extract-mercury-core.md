---
"mercury": minor
---

- The runtime moves into a new `@mercury/core` package; `apps/mercury` is now a thin reference instance that declares its composition and ships the two entrypoints (the service and the `bun run repl` dev REPL), both of which just hand their config to the core.
- `composeMercury` takes the instance's config as a parameter instead of importing it, so the core is agnostic to which plugins and channels an instance wires.
- New `@mercury/kit`: the plugin-authoring entry, re-exporting the tool and channel contracts behind one import (the plugin SDK lands here later). Apps consume `@mercury/core`; plugin authors consume `@mercury/kit`.
