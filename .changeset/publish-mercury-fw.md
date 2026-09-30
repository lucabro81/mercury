---
"@mercury-fw/core": minor
---

- Mercury is published on npm as `@mercury-fw/*`: the framework packages move together under one version, plugins and channels have versions of their own.
- `bun create mercury-fw my-agent` scaffolds an app, and the CLI command is now `mfw` (`@mercury-fw/cli`).
- Packages ship type declarations, so a new app type-checks against the framework without re-checking its source.
- External dependencies use version ranges instead of exact pins, so an app shares them with the framework.
- Every package has its own README, and the repo README describes the framework.
- MIT license.
