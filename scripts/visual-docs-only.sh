#!/usr/bin/env bash
set -euo pipefail

if (($# != 2)); then
  echo "Usage: $0 <base> <head>" >&2
  exit 2
fi

# Keep runtime files with Markdown extensions eligible for screenshot comparison.
git diff --no-renames --quiet "$1" "$2" -- . \
  ':(exclude)README.md' ':(exclude)AGENTS.md' \
  ':(glob,exclude)docs/**/*.md' \
  ':(exclude)app/frontend/README.md' \
  ':(exclude)test/visual/README.md' \
  ':(glob,exclude).codex/skills/**/SKILL.md'
