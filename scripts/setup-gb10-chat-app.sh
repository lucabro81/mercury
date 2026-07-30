#!/usr/bin/env bash
# Bootstrap una tantum della seconda identità bot Chat, per l'istanza di
# test su GB10 — separata dal progetto GCP usato per il bot di dev sul Mac
# (D-04), stesso pattern ripetuto: nessuna approvazione IT richiesta la
# prima volta (sessione 3), quindi nessuna attesa nemmeno qui.
#
# Copre solo la parte scriptabile via gcloud (progetto, API, topic/
# subscription Pub/Sub, service account, chiave). La configurazione
# dell'app Chat vera e propria (nome, avatar, connection settings verso
# il topic qui creato, visibility) non ha equivalente gcloud/API — va
# fatta a mano in Cloud Console: Menu > API e servizi > API e servizi
# abilitati > Google Chat API > Configuration. Verificato contro la doc
# ufficiale, non a memoria:
#   https://developers.google.com/workspace/chat/quickstart/pub-sub
#   https://developers.google.com/workspace/add-ons/chat/configure
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-mercury-gb10}"
TOPIC="${TOPIC:-mercury-gb10-chat-events}"
SUBSCRIPTION="${SUBSCRIPTION:-mercury-gb10-chat-sub}"
SA_NAME="${SA_NAME:-mercury-gb10-bot}"
BILLING_ACCOUNT_ID="${BILLING_ACCOUNT_ID:?serve un billing account ID esistente, vedi: gcloud billing accounts list}"

gcloud projects create "$PROJECT_ID" --name="Mercury GB10"
gcloud config set project "$PROJECT_ID"
gcloud billing projects link "$PROJECT_ID" --billing-account="$BILLING_ACCOUNT_ID"

gcloud services enable chat.googleapis.com pubsub.googleapis.com iam.googleapis.com

gcloud pubsub topics create "$TOPIC"
gcloud pubsub subscriptions create "$SUBSCRIPTION" --topic="$TOPIC"

# Il service account gestito da Google che pubblica gli eventi Chat sul topic
gcloud pubsub topics add-iam-policy-binding "$TOPIC" \
  --member="serviceAccount:chat-api-push@system.gserviceaccount.com" \
  --role="roles/pubsub.publisher"

gcloud iam service-accounts create "$SA_NAME" --display-name="Mercury GB10 bot"

SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud pubsub subscriptions add-iam-policy-binding "$SUBSCRIPTION" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/pubsub.subscriber"

gcloud iam service-accounts keys create mercury-gb10-bot-key.json \
  --iam-account="$SA_EMAIL"

echo
echo "Fatto. Passi manuali rimasti:"
echo "1. Cloud Console > Google Chat API > Configuration: connection settings"
echo "   su Cloud Pub/Sub, topic = projects/${PROJECT_ID}/topics/${TOPIC}"
echo "2. .env su GB10:"
echo "   GOOGLE_CHAT_APP_CLIENT_EMAIL=${SA_EMAIL}"
echo "   GOOGLE_CHAT_APP_PRIVATE_KEY=<campo private_key di mercury-gb10-bot-key.json>"
echo "   GOOGLE_CHAT_PUBSUB_SUBSCRIPTION=projects/${PROJECT_ID}/subscriptions/${SUBSCRIPTION}"
echo "3. Cancellare mercury-gb10-bot-key.json da qui una volta copiato il contenuto"
