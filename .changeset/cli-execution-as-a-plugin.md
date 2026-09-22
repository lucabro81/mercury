---
"mercury": minor
---

CLI execution is now plugin-owned. The mechanism for running a CLI command against an allowlist lives in `@mercury/cli-engine`, a library that a CLI-based plugin depends on and uses to build its own tool from its own allowlist — the core composes nothing CLI-specific and validates no allowlists itself. An instance with no CLI plugin exposes no CLI tool at all.

Each CLI-based plugin now contributes its own model-facing tool, named for the service (`jiraCommand`, `bitbucketCommand`), instead of a single shared `runCommand`. The command is still written as a full terminal string. File-based CLIs with no owning plugin keep a residual `runCommand` built at composition.

The plugin contract drops `cliConfig` (a plugin owns and validates its allowlist), a plugin contributes its tools via `sessionTools` and their status labels via `toolStatusDescribers`, and the plugin apiVersion is bumped accordingly.
