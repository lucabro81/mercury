---
"mercury": minor
---

- Add a `mercury.config.ts` composition entrypoint and a `defineMercuryConfig` helper: an instance now declares its plugin set in one app-root config file (`defineConfig`-style) instead of inline in the composition root, with no change to which plugins load or how.
