#!/usr/bin/env bash
set -euo pipefail

if (($#)); then
  echo "Usage: $0 (full comparison only; filters and snapshot updates are not accepted)" >&2
  exit 1
fi

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${repo_root}"
compose=.codex/skills/masusono-worktree/scripts/compose.sh
compose_pid=

run_compose() {
  "${compose}" "$@" &
  compose_pid=$!
  wait "${compose_pid}"
}

interrupt() {
  local result=$1
  trap - INT TERM
  if [[ -n "${compose_pid}" ]]; then
    kill -TERM "${compose_pid}" 2>/dev/null || true
    wait "${compose_pid}" 2>/dev/null || true
  fi
  exit "${result}"
}

cleanup() {
  local result=$?
  trap - EXIT INT TERM
  if "${compose}" -f backend/compose.visual.yml stop --timeout 10 backend vite; then
    :
  else
    local stop_result=$?
    echo "Failed to stop the visual test servers." >&2
    if [[ "${result}" == 0 ]]; then
      result=${stop_result}
    fi
  fi
  exit "${result}"
}

trap cleanup EXIT
trap 'interrupt 130' INT
trap 'interrupt 143' TERM

run_compose -f backend/compose.visual.yml up --build -d backend vite
run_compose -f backend/compose.visual.yml run --build --rm visual npm run test:visual
