#!/usr/bin/env bash
# (executor) Full validation gate, in order, fail-fast. Run from anywhere in the repo.
# A green run here == the CI gate + the house checks. Use this instead of re-typing the sequence.
#
# Stack-aware by detection (not hardcoded): the TypeScript block runs only with a Turborepo
# workspace, the .NET block only when a .csproj is present. An Expo + .NET repo runs both. The
# house checks always run — they are the floor, language-agnostic.
set -euo pipefail
cd "$(dirname "$0")/../../.."
run() { echo "▶ $*"; "$@"; }

# --- TypeScript workspace (Expo / NestJS) — runs if a Turborepo workspace exists ---
if [ -f turbo.json ]; then
  command -v corepack >/dev/null 2>&1 && corepack enable >/dev/null 2>&1 || true
  run pnpm run format:check
  run pnpm turbo run build lint typecheck test
fi

# --- .NET — runs if any .csproj exists ---
if find . -name '*.csproj' -not -path '*/bin/*' -not -path '*/obj/*' 2>/dev/null | grep -q .; then
  run dotnet format --verify-no-changes
  run dotnet build
  run dotnet test
fi

# --- House checks (always; each is inert on a stack it doesn't apply to) ---
run bash .claude/shared/checks/file-size.sh
run bash .claude/shared/checks/banned-deps.sh
run bash .claude/shared/checks/no-raw-fetch.sh
echo "✅ validation gate passed"
