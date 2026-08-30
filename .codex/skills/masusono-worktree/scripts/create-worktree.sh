#!/usr/bin/env bash
set -euo pipefail

task_slug="${1:-}"
base_ref="${2:-origin/main}"

if [[ -z "${task_slug}" || ! "${task_slug}" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
  echo "Usage: $0 <lowercase-kebab-task-slug> [base-ref]" >&2
  exit 1
fi

primary_root="$(git worktree list --porcelain | awk '/^worktree / { sub(/^worktree /, ""); print; exit }')"
target_path="${primary_root}/.worktrees/${task_slug}"
branch_name="codex/${task_slug}"

if [[ -e "${target_path}" ]] || git -C "${primary_root}" show-ref --verify --quiet "refs/heads/${branch_name}"; then
  echo "Worktree path or branch already exists: ${target_path} / ${branch_name}" >&2
  exit 1
fi

mkdir -p "$(dirname "${target_path}")"
git -C "${primary_root}" fetch origin main
git -C "${primary_root}" worktree add "${target_path}" -b "${branch_name}" "${base_ref}"

port_reserved() {
  local variable_name="$1"
  local port="$2"

  lsof -nP -iTCP:"${port}" -sTCP:LISTEN >/dev/null 2>&1 ||
    grep -Rqs "^${variable_name}=${port}$" "${primary_root}/.worktrees" 2>/dev/null
}

select_port() {
  local variable_name="$1"
  local start_port="$2"
  local candidate="$3"

  while port_reserved "${variable_name}" "${candidate}"; do
    candidate=$((candidate + 1))
    if ((candidate >= start_port + 800)); then
      echo "Unable to reserve a port for ${variable_name}" >&2
      exit 1
    fi
  done
  printf '%s\n' "${candidate}"
}

hash_value="$(printf '%s' "${task_slug}" | cksum | awk '{print $1}')"
backend_port="$(select_port BACKEND_PORT 3100 $((3100 + hash_value % 800)))"
vite_port="$(select_port VITE_PORT 4100 $((4100 + hash_value % 800)))"

cat > "${target_path}/.env.worktree" <<EOF
# Generated for ${branch_name}; do not commit this file.
COMPOSE_PROJECT_NAME=masusono-${task_slug}
BACKEND_PORT=${backend_port}
VITE_PORT=${vite_port}
EOF

printf 'Created %s\nBranch: %s\nBase: %s\nBackend: http://localhost:%s\nVite: http://localhost:%s\n' \
  "${target_path}" "${branch_name}" "${base_ref}" "${backend_port}" "${vite_port}"
