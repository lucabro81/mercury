#!/usr/bin/env bash
# Maintenance CLI for the wiki vault, run from the host. The vault is a
# Docker named volume (WIKI_VAULT_PATH inside the container), not a host
# path — this always runs through a one-off container against the same
# volume as the real Mercury service. `-T` disables pseudo-tty allocation
# so stdin piping works (needed by `write-curated`, which reads its body
# from stdin). `run --rm`, not `exec`, so this works even if the long-running
# `mercury` service isn't currently up/healthy (see CLAUDE.md).
set -euo pipefail
exec docker compose run --rm -T mercury bun run src/wiki/vault-cli.ts "$@"
