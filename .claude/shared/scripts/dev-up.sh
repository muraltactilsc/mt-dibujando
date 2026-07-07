#!/usr/bin/env bash
# (executor) Bring up the local stack for smoke checks + UI screenshots, with health waits.
#
# Services: Postgres (db), apps/api (NestJS), apps/mobile web target (Expo). Idempotent: each
# block skips a service that already answers. Logs to /tmp/dibujando.
#
# Usage: bash .claude/shared/scripts/dev-up.sh [--web] [--seed]
set -euo pipefail
cd "$(dirname "$0")/../../.."
LOG="/tmp/dibujando"; mkdir -p "$LOG"

# Wait until a URL answers (or time out). Args: <label> <url> <max-tries> [log-to-tail-on-fail]
wait_for() {
  local label="$1" url="$2" tries="$3" logf="${4:-}"
  printf 'waiting for %s ' "$label"
  for _ in $(seq 1 "$tries"); do
    curl -sf --max-time 2 "$url" >/dev/null 2>&1 && { echo "✓"; return 0; }
    printf .; sleep 2
  done
  echo "✗ ($label not healthy)"; [ -n "$logf" ] && tail -n 25 "$logf" >&2 || true
  return 1
}

echo "▶ docker compose up -d db"; docker compose up -d db

# --seed: after the DB is up and BEFORE the API starts, seed real data so data-driven screens
# render content (not empty/error states) in screenshots.
SEED=false; for a in "$@"; do [ "$a" = "--seed" ] && SEED=true; done
[ "$SEED" = true ] && bash .claude/shared/scripts/seed-db.sh   # TODO: add once db/ has a schema

API_PORT="${API_PORT:-3000}"
if ! curl -sf --max-time 2 "http://localhost:$API_PORT/health" >/dev/null 2>&1; then
  nohup pnpm --filter api dev >"$LOG/api.log" 2>&1 &
fi
wait_for "API :$API_PORT" "http://localhost:$API_PORT/health" 60 "$LOG/api.log"

if [ "${1:-}" = "--web" ]; then
  WEB_PORT="${WEB_PORT:-8081}"
  if ! curl -sf --max-time 2 "http://localhost:$WEB_PORT" >/dev/null 2>&1; then
    nohup pnpm --filter mobile web >"$LOG/web.log" 2>&1 &
  fi
  wait_for "web :$WEB_PORT" "http://localhost:$WEB_PORT" 90 "$LOG/web.log"
fi
