"""Shared plumbing for the db-conversion pipeline: config, connections, artifact IO, sealing.

Artifacts live next to config.json (normally .claude/db-conversion/). Scripts run from the repo
root. Sealing rule: a script that produces artifacts re-hashes them into manifest.json;
artifact-schema.sh fails the task if a sealed file is later edited by hand.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

# The only shipped direction. Adding one is recipe work (a new flavor doc + dialect handling).
SUPPORTED = {("sqlserver", "postgresql")}


class Config:
    def __init__(self, path: Path):
        self.path = path
        self.artifacts_dir = path.parent
        raw = json.loads(path.read_text())
        self.source_flavor: str = raw["source_flavor"]
        self.target_flavor: str = raw["target_flavor"]
        if (self.source_flavor, self.target_flavor) not in SUPPORTED:
            sys.exit(
                f"unsupported direction '{self.source_flavor} -> {self.target_flavor}' — "
                f"shipped: {', '.join(f'{s}->{t}' for s, t in sorted(SUPPORTED))}"
            )
        self.source_conn_env: str = raw.get("source_conn_env", "DBCONV_SOURCE_DB")
        self.target_conn_env: str = raw.get("target_conn_env", "DBCONV_TARGET_DB")
        self.source_ddl_file: str | None = raw.get("source_ddl_file")
        self.schemas: list[str] = raw.get("schemas") or ["dbo"]
        self.extra_sources: list[str] = raw.get("extra_sources", [])
        self.out_of_scope: list[str] = [t.lower() for t in raw.get("out_of_scope", [])]
        self.type_overrides: dict = raw.get("type_overrides", {})
        self.batch_size: int = int(raw.get("batch_size", 5000))
        self.verify: dict = raw.get("verify", {"mode": "full", "row_hash": False, "sample_rows": 1000})

    @property
    def direction(self) -> str:
        return f"{self.source_flavor}-to-{self.target_flavor}"

    def _conn_string(self, env: str) -> str:
        value = os.environ.get(env, "")
        if not value:
            sys.exit(f"env var {env} is empty — set the connection string (source is READ-ONLY)")
        return value

    def connect_source(self):
        return _connect(self.source_flavor, self._conn_string(self.source_conn_env))

    def connect_target(self):
        return _connect(self.target_flavor, self._conn_string(self.target_conn_env))


def _connect(flavor: str, conn: str):
    if flavor == "postgresql":
        import psycopg
        return psycopg.connect(conn, autocommit=True)
    if flavor == "sqlserver":
        import pyodbc
        c = pyodbc.connect(conn, readonly=True)
        return c
    sys.exit(f"no driver for flavor '{flavor}'")


def parse_args(description: str) -> tuple[Config, argparse.Namespace]:
    ap = argparse.ArgumentParser(description=description)
    ap.add_argument("--config", required=True, type=Path)
    ap.add_argument("--force", action="store_true",
                    help="re-run even though outputs are already sealed (re-seals them)")
    args = ap.parse_args()
    return Config(args.config), args


def qualify(schema: str, name: str) -> str:
    """Lower-cased schema-qualified key used consistently across artifacts."""
    return f"{schema.lower()}.{name.lower()}"


def refuse_overwrite(cfg: Config, force: bool, *relpaths: str) -> None:
    existing = [p for p in relpaths if (cfg.artifacts_dir / p).exists()]
    if existing and not force:
        sys.exit(f"outputs already exist ({', '.join(existing)}) — artifacts are immutable; "
                 f"re-run with --force only if the spec says so")


def write_json(cfg: Config, relpath: str, data) -> Path:
    p = cfg.artifacts_dir / relpath
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(data, indent=2, sort_keys=True, default=str) + "\n")
    return p


def write_text(cfg: Config, relpath: str, text: str) -> Path:
    p = cfg.artifacts_dir / relpath
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(text if text.endswith("\n") else text + "\n")
    return p


def write_csv(cfg: Config, relpath: str, header: list[str], rows: list) -> Path:
    p = cfg.artifacts_dir / relpath
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open("w", newline="") as f:
        w = csv.writer(f)
        w.writerow(header)
        w.writerows(rows)
    return p


def read_json(cfg: Config, relpath: str):
    return json.loads((cfg.artifacts_dir / relpath).read_text())


def seal(cfg: Config, *paths: Path) -> None:
    manifest_path = cfg.artifacts_dir / "manifest.json"
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
    for p in paths:
        rel = str(p)
        manifest[rel] = {
            "sha256": hashlib.sha256(p.read_bytes()).hexdigest(),
            "phase": p.parent.name,
            "sealed_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        }
    manifest_path.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n")
    print(f"sealed {len(paths)} artifact(s) into {manifest_path}")
