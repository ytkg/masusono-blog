#!/usr/bin/env bash
set -euo pipefail

if (($#)); then
  echo "Usage: $0 (full comparison only; filters and snapshot updates are not accepted)" >&2
  exit 1
fi

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${repo_root}"
compose=.codex/skills/masusono-worktree/scripts/compose.sh

"${compose}" -f backend/compose.visual.yml up --build -d backend vite
exec "${compose}" -f backend/compose.visual.yml run --build --rm visual npm run test:visual
