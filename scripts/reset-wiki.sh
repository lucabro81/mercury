#!/usr/bin/env bash
# Cancella l'intera wiki vault (curated + raw). Mercury la re-inizializza
# vuota al prossimo avvio (src/wiki/vault-init.ts è idempotente per
# esattamente questo motivo).
set -euo pipefail
read -p "Cancella permanentemente l'intera wiki vault. Continuare? [y/N] " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] || exit 1
docker compose stop mercury
docker compose rm -f mercury
docker volume rm mercury_wiki-vault
docker compose up -d mercury
