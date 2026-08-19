---
"mercury": minor
---

- Jira is now a standalone package, `@mercury/plugin-jira`, instead of being wired into the core.
- Its command allowlist, its system-prompt block, and its issue-list formatting and correction all travel with the package.
- Its CLI binary is pinned to a specific version and fetched by the package's own postinstall, so image builds are reproducible — previously the binary was resolved to "latest" at build time and two builds could differ.
- The core loads plugins through a generic, fail-soft loader: a plugin that fails to load degrades only itself, and the core no longer names any integration at build time.
- No change to behaviour: the same tools, prompts, and output as before.
