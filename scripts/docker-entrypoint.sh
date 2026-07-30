#!/usr/bin/env bash
# Materializza le credenziali CLI da variabili base64 in .env, ma solo la
# prima volta che /home/mercury/.config è vuoto (un volume Docker nominato,
# vedi docker-compose.yml — non il filesystem del container). Se la
# cartella <cli-name> esiste già, non la tocca: i refresh token che le CLI
# scrivono durante l'esecuzione restano sul volume e sopravvivono a un
# redeploy, stesso pattern già usato per wiki-vault/qdrant-data. Ogni
# variabile è l'intera cartella /home/mercury/.config/<cli> del
# maintainer, tar+base64 — opaco di proposito, non serve conoscere i file
# interni di ogni CLI. Se una variabile non è impostata, quella CLI si
# aspetta la sua auth da altrove (es. bind mount host in dev,
# docker-compose.override.yml).
set -euo pipefail

materialize() {
  local cli_name="$1"
  local var_name="$2"
  local value="${!var_name:-}"
  if [[ -n "$value" && ! -d "/home/mercury/.config/$cli_name" ]]; then
    echo "$value" | base64 -d | tar xzf - -C /home/mercury/.config
  fi
}

mkdir -p /home/mercury/.config
materialize jira-cli JIRA_CLI_CONFIG_TAR_B64
materialize bitbucket-cli BITBUCKET_CLI_CONFIG_TAR_B64
materialize atlassian-admin-cli ATLASSIAN_ADMIN_CLI_CONFIG_TAR_B64
materialize google-chat-cli GOOGLE_CHAT_CLI_CONFIG_TAR_B64

exec bun run src/index.ts
