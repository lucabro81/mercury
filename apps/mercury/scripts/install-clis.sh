#!/usr/bin/env bash
set -euo pipefail

REPO="lucabro81/CLI-monorepo"

# which crates to install comes from MERCURY_CLIS (comma-separated), not
# hardcoded here — this script is committed, the list of CLIs isn't
: "${MERCURY_CLIS:?MERCURY_CLIS is not set, e.g. MERCURY_CLIS=jira,bitbucket}"
IFS=',' read -ra CRATES <<< "$MERCURY_CLIS"

# Crates that a plugin package provides are skipped here: the plugin's own
# postinstall downloads its binary at a pinned version (reproducible builds),
# and letting this script also fetch the "latest" one would shadow the pinned
# binary on PATH. MERCURY_PLUGIN_CLIS is set by the Dockerfile; empty when this
# script is run standalone, in which case nothing is skipped.
IFS=',' read -ra PLUGIN_CRATES <<< "${MERCURY_PLUGIN_CLIS:-}"
is_plugin_crate() {
  local c="$1" p
  for p in "${PLUGIN_CRATES[@]:-}"; do
    [[ -z "$p" ]] && continue
    [[ "$p" == "$c" ]] && return 0
  done
  return 1
}

# releases now publish one asset per platform: "<crate>-linux-x86_64",
# "<crate>-linux-arm64", "<crate>-macos-arm64" (no Intel Mac asset)
case "$(uname -s)" in
  Linux) os=linux ;;
  Darwin) os=macos ;;
  *) echo "unsupported OS: $(uname -s)" >&2; exit 1 ;;
esac
case "$(uname -m)" in
  x86_64|amd64) arch=x86_64 ;;
  aarch64|arm64) arch=arm64 ;;
  *) echo "unsupported architecture: $(uname -m)" >&2; exit 1 ;;
esac
platform="${os}-${arch}"

mkdir -p ./bin

for crate in "${CRATES[@]}"; do
  if is_plugin_crate "$crate"; then
    echo "skipping ${crate} (provided by a plugin package, pinned)"
    continue
  fi

  # releases are per-crate (tag "<crate>-vX.Y.Z"); fetch the most recent one
  # for THAT specific crate, not the repo's overall latest release
  tag=$(curl -fsSL "https://api.github.com/repos/${REPO}/releases" \
    | jq -r --arg prefix "${crate}-" '[.[] | select(.tag_name | startswith($prefix))][0].tag_name')

  if [[ -z "$tag" || "$tag" == "null" ]]; then
    echo "no release found for crate '${crate}'" >&2
    exit 1
  fi

  url="https://github.com/${REPO}/releases/download/${tag}/${crate}-${platform}"
  curl -fsSL "$url" -o "./bin/${crate}"
  chmod +x "./bin/${crate}"
  echo "installed ${crate} (${tag}, ${platform})"
done
