FROM oven/bun:1-alpine

# apk upgrade: applies security fixes already published in the Alpine repos but
#   not yet included in the base image at build time (e.g. CVE-2026-45447, openssl)
# bash: required by the shebang of scripts/install-clis.sh (not present in Alpine by default)
# curl/jq: used by scripts/install-clis.sh to resolve and download the Rust CLIs
# gcompat: the downloaded Rust CLIs are dynamically linked glibc binaries (verified:
#   interpreter /lib64/ld-linux-x86-64.so.2), Alpine is musl — needs the compat layer
RUN apk upgrade --no-cache && apk add --no-cache bash curl jq gcompat

RUN addgroup -S mercury && adduser -S mercury -G mercury
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY scripts/install-clis.sh ./scripts/install-clis.sh
RUN ./scripts/install-clis.sh && mv ./bin/* /usr/local/bin/ && rmdir ./bin

COPY src ./src

RUN chown -R mercury:mercury /app
USER mercury

CMD ["bun", "run", "src/index.ts"]
