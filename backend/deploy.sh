#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="masusono"
PROJECT_NUMBER="332902117625"
REGION="asia-northeast1"
PRODUCTION_BRANCH="main"
PRODUCTION_SERVICE="masusono"
RAILS_MASTER_KEY_SECRET="rails-master-key:latest"

COMMAND="${1:-deploy}"

if [[ "${COMMAND}" != "deploy" && "${COMMAND}" != "delete" && "${COMMAND}" != "service-name" ]]; then
  echo "Usage: $0 [deploy|delete|service-name]" >&2
  exit 1
fi

CURRENT_BRANCH="${DEPLOY_BRANCH:-${GITHUB_REF_NAME:-$(git branch --show-current)}}"

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

  # Cloud Run のサービス名は63文字以下。長いブランチ名はハッシュを付けて衝突を防ぐ。
  if (( ${#BRANCH_SLUG} > 54 )); then
    BRANCH_HASH="$(printf '%s' "${CURRENT_BRANCH}" | shasum -a 256 | cut -c1-8)"
    SERVICE_NAME="${PRODUCTION_SERVICE}-${BRANCH_SLUG:0:45}-${BRANCH_HASH}"
  else
    SERVICE_NAME="${PRODUCTION_SERVICE}-${BRANCH_SLUG}"
  fi
fi

if [[ "${CURRENT_BRANCH}" == "${PRODUCTION_BRANCH}" ]]; then
  IMAGE_PACKAGE="production"
else
  IMAGE_PACKAGE="staging-${SERVICE_NAME}"
fi

if [[ "${COMMAND}" == "service-name" ]]; then
  echo "サービス名: ${SERVICE_NAME}"
  echo "イメージパッケージ: ${IMAGE_PACKAGE}"

  if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    {
      echo "service_name=${SERVICE_NAME}"
      echo "image_package=${IMAGE_PACKAGE}"
    } >> "${GITHUB_OUTPUT}"
  fi

  exit 0
fi

if [[ "${COMMAND}" == "delete" ]]; then
  if [[ "${CURRENT_BRANCH}" == "${PRODUCTION_BRANCH}" ]]; then
    echo "Error: 本番サービス '${PRODUCTION_SERVICE}' は削除できません。" >&2
    exit 1
  fi

  if DELETE_OUTPUT="$(gcloud run services delete "${SERVICE_NAME}" \
    --project "${PROJECT_ID}" \
    --region "${REGION}" \
    --quiet 2>&1)"; then
    echo "削除完了: ${SERVICE_NAME}"
  elif [[ "${DELETE_OUTPUT}" == *"NOT_FOUND"* || "${DELETE_OUTPUT}" == *"not found"* || "${DELETE_OUTPUT}" == *"not be found"* ]]; then
    echo "削除不要: ${SERVICE_NAME} はすでに存在しません"
  else
    printf '%s\n' "${DELETE_OUTPUT}" >&2
    exit 1
  fi

  if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    {
      echo "service_name=${SERVICE_NAME}"
      echo "image_package=${IMAGE_PACKAGE}"
    } >> "${GITHUB_OUTPUT}"
  fi

  exit 0
fi

DEPLOY_TARGET=(--source .)
if [[ -n "${IMAGE_URI:-}" ]]; then
  DEPLOY_TARGET=(--image "${IMAGE_URI}")
fi

gcloud run deploy "${SERVICE_NAME}" \
  "${DEPLOY_TARGET[@]}" \
  --project "${PROJECT_ID}" \
  --region "${REGION}" \
  --allow-unauthenticated \
  --max-instances 1 \
  --remove-env-vars RAILS_MASTER_KEY \
  --update-secrets "RAILS_MASTER_KEY=${RAILS_MASTER_KEY_SECRET}"

# Use the deterministic URL because Rails allows this project's Cloud Run hosts.
# `status.url` can return a non-deterministic *.a.run.app hostname instead.
SERVICE_URL="https://${SERVICE_NAME}-${PROJECT_NUMBER}.${REGION}.run.app"

echo "デプロイ完了: ${SERVICE_NAME} (${SERVICE_URL})"

if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  {
      echo "service_name=${SERVICE_NAME}"
      echo "image_package=${IMAGE_PACKAGE}"
    echo "service_url=${SERVICE_URL}"
  } >> "${GITHUB_OUTPUT}"
fi
