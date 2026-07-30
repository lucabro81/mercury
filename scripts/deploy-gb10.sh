#!/usr/bin/env bash
# Redeploy Mercury sul GB10 dopo un git pull. Non serve -f qui: COMPOSE_FILE
# in .env (COMPOSE_FILE=docker-compose.yml) esclude l'override dev del Mac,
# che altrimenti Compose applicherebbe comunque automaticamente.
set -euo pipefail
git pull
exec docker compose up -d --build
