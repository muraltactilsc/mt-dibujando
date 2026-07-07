#!/usr/bin/env bash
# aider lint-cmd shim: aider lints every file it edits, including markdown chat files
# (AGENTS.md, last-task.md) that eslint cannot parse. Lint only TypeScript sources.
set -euo pipefail
ts=()
for f in "$@"; do case "$f" in *.ts|*.tsx) ts+=("$f");; esac; done
[ "${#ts[@]}" -eq 0 ] && exit 0
exec pnpm exec eslint --max-warnings 0 "${ts[@]}"
