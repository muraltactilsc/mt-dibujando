#!/usr/bin/env bash
# (executor) Commit the current feature branch and open a PR against master.
# Run AFTER work + validate.sh pass. git/gh ARE available and REQUIRED — do not skip this.
# Usage: bash .claude/shared/scripts/finish-task.sh "<pr-title>"
set -euo pipefail
cd "$(dirname "$0")/../../.."
TITLE="${1:?Usage: finish-task.sh \"<pr-title>\"}"
BR=$(git branch --show-current)
[ "$BR" = "master" ] && { echo "✗ on master — create a feature branch first (.claude/shared/scripts/new-branch.sh <task-id>)"; exit 1; }
git add -A
git commit -m "$TITLE" || echo "(nothing new to commit)"
git push -u origin "$BR"
gh pr create --repo muraltactilsc/mt-dibujando --base master --head "$BR" \
  --title "$TITLE" --body "Automated PR for \`$BR\`. Details in \`.claude/dev/last-task.md\`."
echo "PR: $(gh pr view "$BR" --repo muraltactilsc/mt-dibujando --json url --jq .url)"
