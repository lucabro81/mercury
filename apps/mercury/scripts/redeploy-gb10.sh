#!/usr/bin/env bash
# Redeploy Mercury sul GB10 dopo un git pull. Non serve -f qui: COMPOSE_FILE
# in .env (COMPOSE_FILE=docker-compose.yml) esclude l'override dev del Mac,
# che altrimenti Compose applicherebbe comunque automaticamente.
#
# --no-cache: senza, il layer che scarica le CLI (Dockerfile, stage `clis`)
# resta cacheato quando cambia solo src/, quindi non va mai a controllare se
# CLI-monorepo ha pubblicato nuove release — anche se install-clis.sh
# risolve "latest" dinamicamente, quella risoluzione non viene rieseguita se
# Docker riusa il layer. Ributta via anche la cache di bun install/apt-get,
# accettato: redeploy più lento ma sempre aggiornato.
set -euo pipefail
git pull
docker compose build --no-cache
exec docker compose up -d
