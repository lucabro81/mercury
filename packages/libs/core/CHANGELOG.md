# @mercury-fw/core

## 0.25.0

### Minor Changes

- c114e34: - Mercury is published on npm as `@mercury-fw/*`: the framework packages move together under one version, plugins and channels have versions of their own.
  - `bun create mercury-agent my-agent` scaffolds an app, and the CLI command is now `mfw` (`@mercury-fw/cli`).
  - Packages ship type declarations, so a new app type-checks against the framework without re-checking its source.
  - External dependencies use version ranges instead of exact pins, so an app shares them with the framework.
  - Every package has its own README, and the repo README describes the framework.
  - MIT license.

### Patch Changes

- @mercury-fw/plugin-types@0.25.0
- @mercury-fw/channel-types@0.25.0
- @mercury-fw/cli-engine@0.25.0
- @mercury-fw/confirm-engine@0.25.0
