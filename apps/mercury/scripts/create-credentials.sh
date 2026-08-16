#!/usr/bin/env bash
# Bundles one CLI's credential dir from ~/.config into a base64 tarball on
# the clipboard (e.g. to paste into a remote deploy like GB10 and
# `base64 -d | tar xzf -C ~/.config -` there). Generalizes the manual
# `tar | base64 | pbcopy` command to any CLI name.
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "usage: $0 <cli-name>" >&2
  echo "example: $0 jira-cli" >&2
  exit 1
fi

cli="$1"
[[ -d "$HOME/.config/$cli" ]] || { echo "no ~/.config/${cli} directory" >&2; exit 1; }

COPYFILE_DISABLE=1 tar czf - -C "$HOME/.config" "$cli" | base64 | pbcopy
echo "copied credentials to clipboard for: ${cli}"
