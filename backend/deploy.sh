#!/usr/bin/env bash
set -euo pipefail

MASTER_KEY_FILE="config/master.key"

if [[ ! -f "${MASTER_KEY_FILE}" ]]; then
  echo "Error: ${MASTER_KEY_FILE} が見つかりません。" >&2
  exit 1
fi

gcloud run deploy masusono \
  --source . \
  --project masusono \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars "RAILS_MASTER_KEY=$(cat "${MASTER_KEY_FILE}")"
