#!/usr/bin/env bash
# (orchestrator) Squash-merge a PR, delete its branch, sync master, show state.
# Uses `gh pr merge` (allowed) — it does NOT `git commit`/`push`. Usage: merge-pr.sh <PR#>
set -euo pipefail
cd "$(dirname "$0")/../../.."
N="${1:?Usage: merge-pr.sh <PR#>}"; REPO=muraltactilsc/mt-dibujando
gh pr merge "$N" --squash --delete-branch --repo "$REPO"
echo "state: $(gh pr view "$N" --repo "$REPO" --json state --jq .state)"
git checkout master && git pull --ff-only
git log --oneline -1
echo "open PRs:"; gh pr list --repo "$REPO"
