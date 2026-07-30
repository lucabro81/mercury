#!/usr/bin/env bash
# Materializza le credenziali CLI da variabili base64 in .env, se presenti,
# prima di avviare Mercury. Ogni variabile è l'intera cartella
# /home/mercury/.config/<cli> del maintainer, tar+base64 — opaco di
# proposito, non serve conoscere i file interni di ogni CLI. Se una
# variabile non è impostata, quella CLI si aspetta la sua auth da altrove
# (es. bind mount host in dev, docker-compose.override.yml).
#
# Non persiste i refresh token che le CLI scrivono durante l'esecuzione tra
# un riavvio e l'altro del container — si riparte sempre dallo snapshot in
# .env. Tradeoff deliberato per un'istanza di test a basso riavvio, non una
# soluzione definitiva.
set -euo pipefail

materialize() {
  local var_name="$1"
  local value="${!var_name:-}"
  if [[ -n "$value" ]]; then
    echo "$value" | base64 -d | tar xzf - -C /home/mercury/.config
  fi
}

mkdir -p /home/mercury/.config
materialize JIRA_CLI_CONFIG_TAR_B64
materialize BITBUCKET_CLI_CONFIG_TAR_B64
materialize ATLASSIAN_ADMIN_CLI_CONFIG_TAR_B64
materialize GOOGLE_CHAT_CLI_CONFIG_TAR_B64

exec bun run src/index.ts
