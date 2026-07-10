#!/usr/bin/env bash
# Teeth for artifact integrity: sealed artifacts are immutable facts.
# Fails when a manifest-sealed file is missing or edited (hash mismatch), a phase's required
# artifact group is incomplete, or a JSON artifact does not parse.
# Usage:  artifact-schema.sh            verify everything
#         artifact-schema.sh --seal <path>   seal a reviewed artifact (resolved unmapped report, ported code)
# No-op when .claude/db-conversion/ does not exist (repo not running the conversion).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

DIR=".claude/db-conversion"
if [ ! -d "$DIR" ]; then
  echo "artifact-schema: no $DIR — skipping"
  exit 0
fi

python3 - "$@" <<'PY'
import hashlib, json, sys
from datetime import datetime, timezone
from pathlib import Path

DIR = Path(".claude/db-conversion")
MANIFEST = DIR / "manifest.json"

# Artifact groups: if ANY file of a group exists, ALL must exist (a phase pass is atomic).
GROUPS = [
    ["phase1/schema.json", "phase1/objects.json", "phase1/baseline.json"],
    ["phase2/unmapped_features.json", "phase2/flag_manifest.json"],
    ["phase3/standup_report.json"],
    ["phase4/migrate_report.json"],
    ["phase5/parity_report.json"],
]

def sha256(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()

def load_manifest() -> dict:
    return json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}

args = sys.argv[1:]
if args and args[0] == "--seal":
    if len(args) != 2:
        sys.exit("usage: artifact-schema.sh --seal <path-under-.claude/db-conversion>")
    target = Path(args[1])
    if not target.exists() or DIR not in target.parents:
        sys.exit(f"artifact-schema: ✗ cannot seal {target} — must be an existing file under {DIR}")
    manifest = load_manifest()
    rel = str(target)
    manifest[rel] = {"sha256": sha256(target),
                     "phase": target.parent.name,
                     "sealed_at": datetime.now(timezone.utc).isoformat(timespec="seconds")}
    MANIFEST.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n")
    print(f"artifact-schema: ✓ sealed {rel}")
    sys.exit(0)

fail = []
manifest = load_manifest()

# 1. Sealed artifacts: present and unmodified.
for rel, entry in manifest.items():
    p = Path(rel)
    if not p.exists():
        fail.append(f"sealed artifact missing: {rel}")
    elif sha256(p) != entry["sha256"]:
        fail.append(f"sealed artifact EDITED (hash mismatch): {rel} — re-run its phase with --force; never hand-edit")

# 2. Atomic groups: all-or-nothing.
for group in GROUPS:
    present = [g for g in group if (DIR / g).exists()]
    if present and len(present) != len(group):
        missing = sorted(set(group) - {str(Path(p)) for p in present} - set(present))
        fail.append(f"incomplete artifact group: have {present}, missing {missing}")

# 3. Every JSON artifact parses.
for p in sorted(DIR.rglob("*.json")):
    try:
        json.loads(p.read_text())
    except Exception as e:
        fail.append(f"malformed JSON: {p} ({e})")

if fail:
    print("artifact-schema: ✗")
    for f in fail:
        print(f"  {f}")
    sys.exit(1)
print(f"artifact-schema: ✓ {len(manifest)} sealed artifact(s) intact")
PY
