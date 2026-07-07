#!/usr/bin/env bash
# (executor) Start a clean feature branch from fresh master. Usage: new-branch.sh <task-id>
set -euo pipefail
cd "$(dirname "$0")/../../.."
ID="${1:?Usage: new-branch.sh <task-id>}"
git checkout master
git pull --ff-only
git checkout -b "feature/$ID"
echo "✅ on feature/$ID (from fresh master)"
