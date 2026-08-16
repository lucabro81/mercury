#!/usr/bin/env bash
set -euo pipefail

# Lives at the repo root, not in apps/mercury/scripts/, because releasing is a
# repo-level operation: Changesets' own state (.changeset/) is at the root, and
# the tag it creates names the repository's history, not one workspace's.
# Everything else in apps/mercury/scripts/ operates on the running Mercury
# service (its container, its vault, its CLI credentials) and stays with it.
PKG=apps/mercury

VERSION=$(bun -e "console.log(require('./$PKG/package.json').version)")

git add "$PKG/package.json" "$PKG/CHANGELOG.md" .changeset
git commit -m "Release v$VERSION"
git tag "v$VERSION"

echo "Released v$VERSION"
