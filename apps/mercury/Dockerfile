# Debian-based, not Alpine: the downloaded Rust CLIs are dynamically linked
# glibc binaries (verified: interpreter /lib64/ld-linux-x86-64.so.2 /
# /lib/ld-linux-aarch64.so.1, per architecture). Alpine's gcompat shim doesn't
# implement the full glibc resolver (missing __res_init), so the CLIs fail to
# run there even with gcompat installed. A glibc-native base avoids the
# compatibility layer entirely instead of chasing partial shims. Reopens D-13
# (originally chosen on the now-disproven assumption that the CLIs are static).

# curl/jq are only needed to download the CLI binaries — kept out of the final
# image so their (currently unpatched) CVEs don't end up in the running container
FROM oven/bun:1 AS clis
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl jq ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
# which CLIs to install is a per-deployment choice (MERCURY_CLIS in .env), not
# baked into this script — see docker-compose.yml's build.args
ARG MERCURY_CLIS=jira,bitbucket
# crates a plugin package provides: this stage skips them, since the plugin's
# own postinstall downloads a pinned binary during `bun install` in the final
# stage. Keep in sync with the plugins listed in mercury.config.ts.
ARG MERCURY_PLUGIN_CLIS=jira,bitbucket,atlassian-admin
COPY apps/mercury/scripts/install-clis.sh ./scripts/install-clis.sh
RUN ./scripts/install-clis.sh

FROM oven/bun:1

# apt upgrade: applies security fixes already published in the Debian repos but
#   not yet included in the base image at build time
# ca-certificates: the CLI binaries are Rust/reqwest, which verifies TLS
#   against the OS trust store (unlike Bun's fetch, which bundles its own
#   roots and works fine without this) — without it every HTTPS call from
#   jira-cli fails with a generic "error sending request",
#   confirmed live: DNS resolved fine, Bun's fetch succeeded, jira-cli didn't
# git: the wiki vault (Layer 2, `src/wiki/vault-init.ts`) is its own git repo,
#   git-init'd by Mercury itself at startup — without this binary present,
#   that call fails outright ("git: not found"), confirmed live against this
#   image before this line was added
RUN apt-get update && apt-get upgrade -y \
  && apt-get install -y --no-install-recommends ca-certificates git \
  && rm -rf /var/lib/apt/lists/*

RUN groupadd -r mercury && useradd -r -g mercury mercury

# The build context is the monorepo root, not this directory: bun.lock is a
# single workspace-wide lockfile that only exists there, and
# `bun install --frozen-lockfile` needs the root manifest plus every
# workspace's own package.json to resolve against it. So the image mirrors
# the repo layout — /app is the workspace root, /app/apps/mercury is this
# app — and WORKDIR moves down to the app once install is done.
#
# The two mount points below stay at /app/wiki-vault and /app/cli-config,
# outside the app directory: those are absolute paths the running config
# already refers to, and moving them would silently break an existing
# deployment's .env.
WORKDIR /app

# chown combined into the same layer as each COPY/install — a separate final
# `chown -R /app` would duplicate every file already written in prior layers
COPY --chown=mercury:mercury package.json bun.lock ./
COPY --chown=mercury:mercury apps/mercury/package.json ./apps/mercury/
COPY --chown=mercury:mercury packages/typescript-config/package.json ./packages/typescript-config/
COPY --chown=mercury:mercury packages/plugin-types/package.json ./packages/plugin-types/
# `bun install --frozen-lockfile` verifies every workspace in bun.lock exists on
# disk, so each one needs at least its package.json here before install. These
# have no postinstall and are pure runtime source, so only the manifest goes in
# now (cache-friendly); the full source is copied after install, below.
COPY --chown=mercury:mercury packages/cli-engine/package.json ./packages/cli-engine/
COPY --chown=mercury:mercury packages/channel-types/package.json ./packages/channel-types/
COPY --chown=mercury:mercury packages/channel-google-chat/package.json ./packages/channel-google-chat/
# @mercury/utils is copied in full BEFORE install too: a plugin's postinstall
# imports its downloadPinnedBinary at install time, so its source has to be
# present when `bun install` runs the postinstall.
COPY --chown=mercury:mercury packages/utils ./packages/utils
# The Jira plugin is copied in full BEFORE install, unlike apps/mercury/src
# below: its package.json declares a postinstall that downloads the pinned jira
# binary into packages/plugin-jira/bin/ during `bun install`, so the script has
# to be present, and a later COPY of the plugin dir would overwrite the
# downloaded binary. The trade-off is that a plugin source change re-runs
# install (deps are cached; the one binary re-download is seconds).
COPY --chown=mercury:mercury packages/plugin-jira ./packages/plugin-jira
COPY --chown=mercury:mercury packages/plugin-bitbucket ./packages/plugin-bitbucket
COPY --chown=mercury:mercury packages/plugin-atlassian-admin ./packages/plugin-atlassian-admin
RUN bun install --frozen-lockfile && chown -R mercury:mercury node_modules packages/plugin-jira/bin packages/plugin-bitbucket/bin packages/plugin-atlassian-admin/bin

# Plugin-provided binaries (downloaded by the postinstall above) onto PATH,
# generically — each plugin's bin/ contents symlinked into /usr/local/bin,
# where the file-based CLIs also live. -path is find's glob, not a JS comment.
RUN find /app/packages -path '*/bin/*' -type f -exec ln -sf {} /usr/local/bin/ \;

# File-based CLI binaries from the clis stage (bitbucket etc.). Trailing-slash
# copy of the dir contents, not a `bin/*` glob, so an empty dir (a deployment
# whose only CLIs are plugin-provided) doesn't fail the build.
COPY --from=clis --chown=mercury:mercury /app/bin/ /usr/local/bin/

COPY --chown=mercury:mercury apps/mercury/src ./apps/mercury/src
# The instance composition config lives at the app root (imported by src/index.ts
# as ../mercury.config.ts), not under src/, so it needs its own COPY.
COPY --chown=mercury:mercury apps/mercury/mercury.config.ts ./apps/mercury/mercury.config.ts
# Runtime source imported by the app and the plugins/channels, no postinstall,
# so copied after install (cache-friendly), unlike the Jira plugin above: the
# shared plugin/channel contracts, the CLI engine every CLI plugin builds its
# tool with, and the Google Chat channel package.
COPY --chown=mercury:mercury packages/plugin-types ./packages/plugin-types
COPY --chown=mercury:mercury packages/cli-engine ./packages/cli-engine
COPY --chown=mercury:mercury packages/channel-types ./packages/channel-types
COPY --chown=mercury:mercury packages/channel-google-chat ./packages/channel-google-chat

COPY --chown=mercury:mercury apps/mercury/scripts/docker-entrypoint.sh ./apps/mercury/scripts/docker-entrypoint.sh
RUN chmod +x ./apps/mercury/scripts/docker-entrypoint.sh

WORKDIR /app/apps/mercury

# Pre-creates the wiki-vault mount point with the right ownership before the
# named volume is ever attached: a fresh named volume inherits its initial
# content/permissions from whatever already exists at the mount path in the
# image at container-creation time — without this, a brand-new volume comes
# up root:root and the non-root mercury user below gets EACCES on its first
# write, confirmed live against a real fresh volume before this line existed
RUN mkdir -p /app/wiki-vault && chown mercury:mercury /app/wiki-vault

# useradd -r above doesn't create a home directory. Same fresh-volume
# reasoning as wiki-vault above: /home/mercury/.config is the
# cli-credentials named volume's mount point (docker-compose.yml), needs
# the right ownership pre-existing in the image or a brand-new volume
# attaches as root:root and docker-entrypoint.sh gets EACCES
RUN mkdir -p /home/mercury/.config && chown -R mercury:mercury /home/mercury

USER mercury

CMD ["scripts/docker-entrypoint.sh"]
