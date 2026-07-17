#!/usr/bin/env bash
set -euo pipefail

VERSION=$(bun -e "console.log(require('./package.json').version)")

git add package.json CHANGELOG.md .changeset
git commit -m "Release v$VERSION"
git tag "v$VERSION"

echo "Released v$VERSION"
