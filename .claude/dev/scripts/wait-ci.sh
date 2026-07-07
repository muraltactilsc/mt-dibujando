#!/usr/bin/env bash
# (orchestrator) Poll a PR's CI checks until done; print final statuses. Usage: wait-ci.sh <PR#>
set -euo pipefail
N="${1:?Usage: wait-ci.sh <PR#>}"; REPO=muraltactilsc/mt-dibujando
for _ in $(seq 1 30); do
  out=$(gh pr checks "$N" --repo "$REPO" 2>&1 || true)
  echo "$out" | awk '{print $1": "$2}'
  echo "$out" | grep -qiE "fail" && { echo "RESULT: FAIL"; exit 1; }
  echo "$out" | grep -qi "pending" || { echo "RESULT: DONE"; exit 0; }
  sleep 20
done
echo "RESULT: TIMEOUT"; exit 2
