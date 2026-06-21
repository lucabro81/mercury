#!/usr/bin/env bash
set -euo pipefail

REPO="lucabro81/CLI-monorepo"
CRATES=(jira bitbucket)   # add gchat once the crate has a first release

mkdir -p ./bin

for crate in "${CRATES[@]}"; do
  # releases are per-crate (tag "<crate>-vX.Y.Z"); fetch the most recent one
  # for THAT specific crate, not the repo's overall latest release
  tag=$(curl -fsSL "https://api.github.com/repos/${REPO}/releases" \
    | jq -r --arg prefix "${crate}-" '[.[] | select(.tag_name | startswith($prefix))][0].tag_name')

  if [[ -z "$tag" || "$tag" == "null" ]]; then
    echo "no release found for crate '${crate}'" >&2
    exit 1
  fi

  url="https://github.com/${REPO}/releases/download/${tag}/${crate}-linux-x86_64"
  curl -fsSL "$url" -o "./bin/${crate}"
  chmod +x "./bin/${crate}"
  echo "installed ${crate} (${tag})"
done
