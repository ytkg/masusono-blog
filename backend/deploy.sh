#!/usr/bin/env bash
set -euo pipefail

MASTER_KEY_FILE="config/master.key"
PROJECT_ID="masusono"
REGION="asia-northeast1"
PRODUCTION_BRANCH="main"
PRODUCTION_SERVICE="masusono"

CURRENT_BRANCH="$(git branch --show-current)"

if [[ -z "${CURRENT_BRANCH}" ]]; then
  echo "Error: デタッチされたHEADではデプロイできません。ブランチをチェックアウトしてください。" >&2
  exit 1
fi

if [[ "${CURRENT_BRANCH}" == "${PRODUCTION_BRANCH}" ]]; then
  SERVICE_NAME="${PRODUCTION_SERVICE}"
else
  BRANCH_SLUG="$(printf '%s' "${CURRENT_BRANCH}" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//')"

  if [[ -z "${BRANCH_SLUG}" ]]; then
    echo "Error: ブランチ名 '${CURRENT_BRANCH}' から有効なサービス名を作成できません。" >&2
    exit 1
  fi

  # Cloud Run のサービス名は63文字以下。
  SERVICE_NAME="${PRODUCTION_SERVICE}-${BRANCH_SLUG:0:54}"
fi

if [[ ! -f "${MASTER_KEY_FILE}" ]]; then
  echo "Error: ${MASTER_KEY_FILE} が見つかりません。" >&2
  exit 1
fi

gcloud run deploy "${SERVICE_NAME}" \
  --source . \
  --project "${PROJECT_ID}" \
  --region "${REGION}" \
  --allow-unauthenticated \
  --max-instances 1 \
  --set-env-vars "RAILS_MASTER_KEY=$(cat "${MASTER_KEY_FILE}")"

SERVICE_URL="$(gcloud run services describe "${SERVICE_NAME}" \
  --project "${PROJECT_ID}" \
  --region "${REGION}" \
  --format='value(status.url)')"

echo "デプロイ完了: ${SERVICE_NAME} (${SERVICE_URL})"
