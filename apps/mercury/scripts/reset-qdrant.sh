#!/usr/bin/env bash
# Cancella TUTTA la memoria Qdrant (episodic, semantic facts, tool
# corrections — tutte e tre le collection). Ogni store la ricrea da sola,
# vuota, alla prossima connessione (vedi src/memory/*-store.ts).
set -euo pipefail
read -p "Cancella permanentemente tutta la memoria Qdrant. Continuare? [y/N] " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] || exit 1
docker compose stop qdrant
docker compose rm -f qdrant
docker volume rm mercury_qdrant-data
docker compose up -d qdrant
