#!/usr/bin/env bash
set -euo pipefail

if (($#)); then
  echo "Usage: $0 (pushes the current branch to origin)" >&2
  exit 1
fi

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${repo_root}"

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Commit tracked changes before running the checked push." >&2
  exit 1
fi

base="$(git merge-base origin/main HEAD)"
if git diff --quiet "${base}" HEAD -- \
  backend/app backend/config/routes.rb \
  backend/test/visual backend/playwright.config.js backend/vite.config.ts \
  backend/package.json backend/package-lock.json \
  backend/compose.yml backend/compose.visual.yml backend/Dockerfile backend/Dockerfile.visual \
  scripts/check-visual.sh scripts/push.sh; then
  echo "No visual inputs changed; skipping screenshot comparison."
else
  diff_status=$?
  if [[ "${diff_status}" != 1 ]]; then
    exit "${diff_status}"
  fi
  echo "Visual inputs changed; running all screenshot comparisons before push."
  "${repo_root}/scripts/check-visual.sh"
fi

exec git push --set-upstream origin HEAD
