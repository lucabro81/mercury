#!/usr/bin/env bash
# Cancella le credenziali di UNA CLI dal volume cli-credentials (condiviso
# da tutte e 4), non l'intero volume: le altre CLI restano intatte.
# docker-entrypoint.sh materializza il base64 di .env solo se quella
# cartella non esiste ancora — se un primo avvio l'ha già creata (vuota o
# rotta, es. base64 corrotto), correggere .env dopo non basta: la cartella
# c'è già, quindi l'entrypoint non ci riprova più. Va cancellata a mano
# perché possa essere rimaterializzata.
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "usage: $0 <cli-name>" >&2
  echo "one of: jira-cli, bitbucket-cli, atlassian-admin-cli, google-chat-cli" >&2
  exit 1
fi

cli="$1"
case "$cli" in
  jira-cli|bitbucket-cli|atlassian-admin-cli|google-chat-cli) ;;
  *)
    echo "unknown CLI: ${cli}" >&2
    echo "one of: jira-cli, bitbucket-cli, atlassian-admin-cli, google-chat-cli" >&2
    exit 1
    ;;
esac

read -p "Cancella le credenziali di ${cli} dal volume cli-credentials. Continuare? [y/N] " -n 1 -r
echo
[[ $REPLY =~ ^[Yy]$ ]] || exit 1

docker compose stop mercury
docker run --rm -v mercury_cli-credentials:/data alpine rm -rf "/data/${cli}"
docker compose up -d mercury
