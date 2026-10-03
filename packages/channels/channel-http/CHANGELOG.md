# @mercury-fw/channel-http

## 0.1.1

### Patch Changes

- 7926aa2: - Wiki grep ignores case, for the agent, the nightly review, `mfw vault grep` and the HTTP `/wiki/grep` route.
  - The agent's `write_file` and the nightly review's `write_curated` take a path starting with `curated/`, as listing, reading and grepping give it, instead of writing under `curated/curated/`.
