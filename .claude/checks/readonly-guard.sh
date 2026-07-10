#!/usr/bin/env bash
# Teeth for the conversion's read-only rule: the source system is NEVER modified.
# Fails if the working tree has changes (tracked or untracked) outside the allowed paths:
#   .claude/           — conversion artifacts, loop files, docs (the pattern's own surface)
#   AGENTS.md/CLAUDE.md — role files the loop legitimately rewrites each cycle
#   .gitignore          — tooling metadata (e.g. ignoring the pipeline's own .venv), not app code
# Everything else IS the analyzed system — any diff there is a violation, not a judgment call.
# (The target engine is a fresh external database, not the working tree — writing it is fine.)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

violations="$(git status --porcelain \
  | awk '{ p=$NF } { print p }' \
  | grep -vE '^\.claude/' \
  | grep -vE '^(AGENTS\.md|CLAUDE\.md|CLAUDE\.local\.md|\.gitignore)$' || true)"

if [ -n "$violations" ]; then
  echo "readonly-guard: ✗ the analyzed source was modified — this conversion is read-only on the source:"
  echo "$violations" | sed 's/^/  /'
  echo "Revert these paths; all conversion output belongs under .claude/db-conversion/."
  exit 1
fi
echo "readonly-guard: ✓ source untouched"
