#!/usr/bin/env bash
# Teeth for "all network goes through the authenticated api client": fail if raw fetch()/axios is
# used outside an api/ folder. The MSAL token + 401 handling live in api/client.ts; scattering raw
# fetch bypasses auth. No-op on repos with no .ts/.tsx. (Tune the allowed location if needed.)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$ROOT"

# Exclude the api/ folder by PATH (--exclude-dir), not by matching "/api/" in the line — a URL
# like fetch("/api/posts") would otherwise hide a real violation.
hits="$(grep -rnE '\b(fetch\(|axios)' --include='*.ts' --include='*.tsx' \
          --exclude-dir=api --exclude-dir=node_modules --exclude-dir=dist \
          --exclude-dir=build --exclude-dir=.next --exclude-dir=bin --exclude-dir=obj \
          --exclude-dir=ui-templates \
          . 2>/dev/null \
          | grep -vE '^\./\.claude/ui/' \
          | grep -vE '\.(test|spec|d)\.tsx?:' || true)"

if [ -n "$hits" ]; then
  echo "raw fetch/axios outside an api/ folder — route all network through the authenticated client:"
  echo "$hits"
  exit 1
fi
echo "no-raw-fetch: ✓ none"
