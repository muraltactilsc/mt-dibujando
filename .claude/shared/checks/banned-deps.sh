#!/usr/bin/env bash
# Teeth for the "no ORM / no mapping library" rule: fail if a banned package is referenced.
# A written ban drifts; this fails the build instead.
#
# Stack-aware: each section runs only when that ecosystem's manifest is present, so the check
# adjusts to the project's language rather than leading with one stack. A TypeScript repo sees only
# the TS rule; a .NET repo only the .NET rule; an Expo + .NET repo sees both.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$ROOT"

fail=0
ran=0

# --- TypeScript: ORMs and decorator validation/mapping (Kysely + zod are the rule) ---
if find . -name 'package.json' -not -path '*/node_modules/*' 2>/dev/null | grep -q .; then
  ran=1
  banned_ts='prisma|@prisma/client|typeorm|sequelize|drizzle-orm|@mikro-orm/[a-z-]+|objection|class-validator|class-transformer'
  hits_ts="$(grep -rnE "\"(${banned_ts})\"[[:space:]]*:" --include='package.json' . 2>/dev/null \
            | grep -vE '/(node_modules|dist|build)/' \
            | grep -vE '/ui-templates/' || true)"
  if [ -n "$hits_ts" ]; then
    echo "banned dependency (TypeScript) — use Kysely + hand-written SQL, zod at the boundary, manual mapping:"
    echo "$hits_ts"
    fail=1
  fi
fi

# --- .NET: ORMs, mapping libs, Newtonsoft (case-insensitive name fragments) ---
if find . \( -name '*.csproj' -o -name '*.props' \) -not -path '*/bin/*' -not -path '*/obj/*' 2>/dev/null | grep -q .; then
  ran=1
  banned='EntityFrameworkCore|AutoMapper|Mapster|Newtonsoft\.Json'
  hits="$(grep -rniE "PackageReference[^>]*Include=\"[^\"]*(${banned})" \
            --include='*.csproj' --include='*.props' . 2>/dev/null \
            | grep -vE '/(bin|obj)/' || true)"
  if [ -n "$hits" ]; then
    echo "banned dependency (.NET) — use Dapper + hand-written SQL and manual mapping (no ORM, no mapping library):"
    echo "$hits"
    fail=1
  fi
fi

[ "$fail" -eq 0 ] && [ "$ran" -eq 1 ] && echo "banned-deps: ✓ none"
[ "$ran" -eq 0 ] && echo "banned-deps: ✓ no recognized manifest — nothing to check"
exit "$fail"
