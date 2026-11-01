#!/usr/bin/env bash
# Point the live API at Evon running on Kaggle (see deploy/kaggle-evon.ipynb).
# Usage: deploy/evon-url.sh https://xxxx.trycloudflare.com/v1 <api-key>
# Updates server/.env and the Cloud Run env vars in place; no rebuild.
set -euo pipefail
URL="${1:?tunnel url ending in /v1}"
KEY="${2:?api key printed by the notebook}"
PROJECT="${PROJECT:-nyayamitra-jlfe3q}"
REGION="${REGION:-asia-south1}"
ENV="$(dirname "$0")/../server/.env"

set_var() {
  if grep -q "^$1=" "$ENV"; then sed -i '' "s|^$1=.*|$1=$2|" "$ENV"; else echo "$1=$2" >> "$ENV"; fi
}
set_var LLM_BASE_URL "$URL"
set_var LLM_MODEL evon
set_var LLM_API_KEY "$KEY"

curl -sf -m 60 "$URL/models" -H "Authorization: Bearer $KEY" > /dev/null && echo "Kaggle Evon answers." || echo "Warning: the tunnel didn't answer yet; updating anyway."

gcloud run services update nyayamitra-api --project "$PROJECT" --region "$REGION" \
  --update-env-vars "LLM_BASE_URL=$URL,LLM_MODEL=evon,LLM_API_KEY=$KEY"
