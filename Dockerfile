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
COPY scripts/install-clis.sh ./scripts/install-clis.sh
RUN ./scripts/install-clis.sh

FROM oven/bun:1

# apt upgrade: applies security fixes already published in the Debian repos but
#   not yet included in the base image at build time
# ca-certificates: the CLI binaries are Rust/reqwest, which verifies TLS
#   against the OS trust store (unlike Bun's fetch, which bundles its own
#   roots and works fine without this) — without it every HTTPS call from
#   jira/google-chat-cli fails with a generic "error sending request",
#   confirmed live: DNS resolved fine, Bun's fetch succeeded, jira-cli didn't
RUN apt-get update && apt-get upgrade -y \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN groupadd -r mercury && useradd -r -g mercury mercury
WORKDIR /app

# chown combined into the same layer as each COPY/install — a separate final
# `chown -R /app` would duplicate every file already written in prior layers
COPY --chown=mercury:mercury package.json bun.lock ./
RUN bun install --frozen-lockfile && chown -R mercury:mercury node_modules

COPY --from=clis --chown=mercury:mercury /app/bin/* /usr/local/bin/

COPY --chown=mercury:mercury src ./src

USER mercury

CMD ["bun", "run", "src/index.ts"]
