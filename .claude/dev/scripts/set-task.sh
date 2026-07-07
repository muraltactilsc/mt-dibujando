#!/usr/bin/env bash
# (orchestrator) Replace the "## Current Task" section of AGENTS.md with the body in <file>.
# The body file MUST begin with a "## Current Task" line. Usage: set-task.sh <body-file>
# Mechanizes task-loop step 1 — write the spec to a file, then swap just this section in.
set -euo pipefail
cd "$(dirname "$0")/../../.."
BODY="${1:?Usage: set-task.sh <body-file (begins with '## Current Task')>}"
head -1 "$BODY" | grep -q "^## Current Task" || { echo "✗ body file must begin with '## Current Task'"; exit 1; }
ct=$(grep -n "^## Current Task" AGENTS.md | head -1 | cut -d: -f1)
[ -z "$ct" ] && { echo "✗ no '## Current Task' heading in AGENTS.md"; exit 1; }
tmp=$(mktemp)
head -n $((ct-1)) AGENTS.md > "$tmp"
cat "$tmp" "$BODY" > AGENTS.md
rm -f "$tmp"
echo "✅ AGENTS.md Current Task replaced ($(grep -c '^## Current Task' AGENTS.md) heading)"
