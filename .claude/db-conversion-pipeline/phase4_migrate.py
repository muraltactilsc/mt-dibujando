"""Phase 4 — Migrate: copy data source -> target, in FK order, with coercion and reseed.

Source read-only (pyodbc); target Postgres (psycopg). FK enforcement is deferred during load
(session_replication_role = replica) and restored after — constraints are never dropped.
Honors config.verify.mode ('full' or 'sample'). Produces phase4/migrate_report.json.
"""
from __future__ import annotations

import sys

from common import parse_args, qualify, read_json, refuse_overwrite, seal, write_json


def topo_order(tables, in_scope_keys):
    """Tables ordered so a table's FK targets load first. Cycles: remaining tables appended."""
    deps = {qualify(t["schema"], t["name"]):
            {fk["ref_table"] for fk in t["fks"] if fk["ref_table"] in in_scope_keys}
            for t in tables}
    deps = {k: v for k, v in deps.items() if k in in_scope_keys}
    ordered, seen = [], set()
    while len(ordered) < len(deps):
        progress = False
        for k in sorted(deps):
            if k not in seen and deps[k] <= seen:
                ordered.append(k); seen.add(k); progress = True
        if not progress:  # cycle — append the rest (FK deferral covers the load)
            for k in sorted(deps):
                if k not in seen:
                    ordered.append(k); seen.add(k)
            break
    return ordered


def coercer(col):
    """Per-column value coercion from a pyodbc row value to a psycopg-friendly value."""
    t = col["type"].lower()
    if t == "bit":
        return lambda v: None if v is None else bool(v)
    if t == "uniqueidentifier":
        return lambda v: None if v is None else str(v).lower()
    if t in ("binary", "varbinary", "image", "rowversion", "timestamp"):
        return lambda v: None if v is None else (bytes(v) if not isinstance(v, (bytes, bytearray)) else v)
    return lambda v: v


def main():
    cfg, args = parse_args("Phase 4 — migrate data source -> target")
    refuse_overwrite(cfg, args.force, "phase4/migrate_report.json")
    schema = read_json(cfg, "phase1/schema.json")
    mode = cfg.verify.get("mode", "full")
    sample = int(cfg.verify.get("sample_rows", 1000))

    by_key = {qualify(t["schema"], t["name"]): t for t in schema["tables"]}
    in_scope = {k for k in by_key if k not in cfg.out_of_scope}
    order = topo_order(schema["tables"], in_scope)

    src = cfg.connect_source(); s_cur = src.cursor()
    tgt = cfg.connect_target(); t_cur = tgt.cursor()
    t_cur.execute("SET session_replication_role = replica")  # defer FK/trigger enforcement

    report = {"mode": mode, "tables": [], "reseeded": {}}
    for key in order:
        t = by_key[key]
        cols = [c for c in t["columns"] if not c["computed"]]
        names = [c["name"] for c in cols]
        coercers = [coercer(c) for c in cols]
        src_fq = f"[{t['schema']}].[{t['name']}]"
        col_list = ", ".join(f"[{n}]" for n in names)
        top = f"TOP {sample} " if mode == "sample" else ""
        s_cur.execute(f"SELECT {top}{col_list} FROM {src_fq}")
        rows = s_cur.fetchall()

        tgt_fq = f'"{t["schema"].lower()}"."{t["name"].lower()}"'
        placeholders = ", ".join(["%s"] * len(names))
        tgt_cols = ", ".join(f'"{n.lower()}"' for n in names)
        loaded = 0
        for i in range(0, len(rows), cfg.batch_size):
            batch = [tuple(co(v) for co, v in zip(coercers, row)) for row in rows[i:i + cfg.batch_size]]
            t_cur.executemany(f"INSERT INTO {tgt_fq} ({tgt_cols}) VALUES ({placeholders})", batch)
            loaded += len(batch)
        report["tables"].append({"source": key, "target": key, "rows_source": len(rows), "rows_loaded": loaded})

        # Reseed identity so future inserts don't collide with migrated keys.
        ident_col = next((c["name"] for c in cols if c["identity"]), None)
        if ident_col and loaded:
            t_cur.execute("SELECT pg_get_serial_sequence(%s, %s)", (f'{t["schema"].lower()}.{t["name"].lower()}', ident_col.lower()))
            seq = t_cur.fetchone()[0]
            if seq:
                t_cur.execute(f'SELECT setval(%s, (SELECT max("{ident_col.lower()}") FROM {tgt_fq}))', (seq,))
                report["reseeded"][f"{key}.{ident_col}"] = seq

    t_cur.execute("SET session_replication_role = DEFAULT")
    src.close(); tgt.close()

    path = write_json(cfg, "phase4/migrate_report.json", report)
    seal(cfg, path)
    total = sum(t["rows_loaded"] for t in report["tables"])
    print(f"4 migrate ({mode}): {len(report['tables'])} tables, {total} rows loaded, "
          f"{len(report['reseeded'])} identities reseeded")
    if any(t["rows_source"] != t["rows_loaded"] for t in report["tables"]):
        sys.exit("✗ some tables loaded fewer rows than read — see migrate_report.json")


if __name__ == "__main__":
    main()
