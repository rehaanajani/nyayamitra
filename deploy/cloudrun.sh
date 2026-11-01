#!/usr/bin/env bash
# Deploy the API to Google Cloud Run using keys from server/.env.
# Usage: deploy/cloudrun.sh [project-id] [region]
set -euo pipefail
PROJECT="${1:-$(gcloud config get-value project)}"
REGION="${2:-asia-south1}"
cd "$(dirname "$0")/../server"

# turn server/.env into --set-env-vars (skip comments and empty values)
VARS=$(grep -E '^[A-Z_]+=.+' .env | sed 's/[[:space:]]*(.*$//' | paste -sd, -)

gcloud run deploy nyayamitra-api \
  --project "$PROJECT" --region "$REGION" \
  --source . \
  --allow-unauthenticated \
  --timeout 3600 \
  --min-instances 0 --max-instances 3 \
  --memory 512Mi --cpu 1 \
  --set-env-vars "$VARS"

URL=$(gcloud run services describe nyayamitra-api --project "$PROJECT" --region "$REGION" --format 'value(status.url)')
echo
echo "API live at: $URL"
echo "The web app reads this URL from web/.env.production; update it there only if the URL changes."
