#!/usr/bin/env bash
# Structural guardrail: one uniform line budget for every source file, with a governed exception.
# A doc that says "keep files small" already failed once — this is what holds the line.
#
#   ≤150  soft target  — clean
#   ≤200  hard cap      — over this WARNS but passes only up to 200; above 200 fails…
#   ≤250  absolute max  — …UNLESS the file carries an approved, registered @budget-exception
#   >250                — fails always; no exception can cover it
#
# Language-agnostic by design: the same budget holds whether the file is .cs, .ts, or .tsx, so the
# check adjusts to whatever the project is written in — it is not tied to one stack. The exception
# path and registry are documented in .claude/shared/docs/coding-standards.md + budget-exceptions.md.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$ROOT"

SOFT=150
HARD=200
MAX=250
REGISTRY=".claude/shared/docs/budget-exceptions.md"

fail=0
warn=0

echo "file-size guardrail (soft ${SOFT} · hard ${HARD} · max ${MAX}):"

# Source files across stacks; tooling (.claude/), vendor/build dirs, and generated types excluded.
while IFS= read -r f; do
  [ -z "$f" ] && continue
  n=$(wc -l < "$f")
  rel="${f#./}"

  [ "$n" -le "$SOFT" ] && continue

  if [ "$n" -le "$HARD" ]; then
    printf '  ⚠ %4s lines (over soft target %s — prefer a split)  %s\n' "$n" "$SOFT" "$rel"
    warn=1
    continue
  fi

  # Over the hard cap — passes only with an approved AND registered budget exception.
  ann=$(grep -oE '@budget-exception\(([0-9]+)\)' "$f" 2>/dev/null | head -1 | grep -oE '[0-9]+' || true)
  if [ -n "$ann" ] && [ "$ann" -le "$MAX" ] && [ "$n" -le "$ann" ] \
       && [ -f "$REGISTRY" ] && grep -qF "$rel" "$REGISTRY"; then
    printf '  ✓ %4s lines (approved exception ≤%s, registered)  %s\n' "$n" "$ann" "$rel"
    continue
  fi

  if [ "$n" -gt "$MAX" ]; then
    printf '  ✗ %4s lines (over absolute max %s — no exception can cover this; split)  %s\n' "$n" "$MAX" "$rel"
  elif [ -z "$ann" ]; then
    printf '  ✗ %4s lines (over hard cap %s; add a split or an approved @budget-exception)  %s\n' "$n" "$HARD" "$rel"
  elif [ "$n" -gt "$ann" ]; then
    printf '  ✗ %4s lines (exceeds its own @budget-exception(%s))  %s\n' "$n" "$ann" "$rel"
  else
    printf '  ✗ %4s lines (@budget-exception present but not registered in %s)  %s\n' "$n" "$REGISTRY" "$rel"
  fi
  fail=1
done < <(grep -rIl \
            --include='*.cs' --include='*.ts' --include='*.tsx' \
            --include='*.js' --include='*.jsx' --include='*.mjs' --include='*.cjs' \
            --include='*.vue' -e '' . 2>/dev/null \
          | grep -vE '/(bin|obj|node_modules|\.git|dist|build|ui-templates)/' \
          | grep -vE '(^|/)\.claude/' \
          | grep -vE '\.d\.ts$' || true)

if [ "$fail" -eq 0 ]; then
  [ "$warn" -eq 0 ] && echo "  ✓ all files within budget" || echo "  ✓ within hard cap (soft-target warnings above are advisory)"
else
  echo
  echo "Over budget. Split on a responsibility seam — see .claude/shared/docs/coding-standards.md and"
  echo "the relevant stack doc. If the file is a genuinely cohesive unit that splitting would harm,"
  echo "propose a budget exception in the PR (≤${MAX}) per .claude/shared/docs/budget-exceptions.md — never"
  echo "chop mid-responsibility to beat the number."
fi
exit "$fail"
