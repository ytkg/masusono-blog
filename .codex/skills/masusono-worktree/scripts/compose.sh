#!/usr/bin/env bash
set -euo pipefail

if [[ ! -f .env.worktree ]]; then
  echo "Run this from a managed worktree containing .env.worktree." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
source ./.env.worktree
set +a

exec docker compose -f backend/compose.yml "$@"
