"""Phase 1 — Extract: read the full source schema, in-DB code, and a per-table baseline.

Read-only against the source. Shipped source flavor: sqlserver (sys catalog). Produces
phase1/schema.json, phase1/objects.json, phase1/baseline.json. See artifacts.md for shapes.
"""
from __future__ import annotations

import sys

from common import parse_args, qualify, refuse_overwrite, seal, write_json

# --- SQL Server catalog queries (read-only) ---------------------------------------------------

COLUMNS_SQL = """
SELECT s.name AS sch, t.name AS tbl, c.name AS col, c.column_id AS ordinal,
       ty.name AS type, c.max_length AS max_len, c.precision AS prec, c.scale AS scale,
       c.is_nullable AS nullable, c.is_identity AS is_identity, c.is_computed AS is_computed,
       dc.definition AS default_def, cc.definition AS computed_def, cc.is_persisted AS persisted,
       CAST(ic.seed_value AS bigint) AS seed, CAST(ic.increment_value AS bigint) AS incr
FROM sys.columns c
JOIN sys.tables t ON t.object_id = c.object_id
JOIN sys.schemas s ON s.schema_id = t.schema_id
JOIN sys.types ty ON ty.user_type_id = c.user_type_id
LEFT JOIN sys.default_constraints dc ON dc.object_id = c.default_object_id
LEFT JOIN sys.computed_columns cc ON cc.object_id = c.object_id AND cc.column_id = c.column_id
LEFT JOIN sys.identity_columns ic ON ic.object_id = c.object_id AND ic.column_id = c.column_id
WHERE s.name IN ({schemas})
ORDER BY s.name, t.name, c.column_id
"""

PK_UNIQUE_SQL = """
SELECT s.name AS sch, t.name AS tbl, kc.name AS cname, kc.type AS ktype, col.name AS col, ic.key_ordinal AS ord
FROM sys.key_constraints kc
JOIN sys.tables t ON t.object_id = kc.parent_object_id
JOIN sys.schemas s ON s.schema_id = t.schema_id
JOIN sys.index_columns ic ON ic.object_id = kc.parent_object_id AND ic.index_id = kc.unique_index_id
JOIN sys.columns col ON col.object_id = ic.object_id AND col.column_id = ic.column_id
WHERE s.name IN ({schemas})
ORDER BY s.name, t.name, kc.name, ic.key_ordinal
"""

CHECK_SQL = """
SELECT s.name AS sch, t.name AS tbl, cc.name AS cname, cc.definition AS expr
FROM sys.check_constraints cc
JOIN sys.tables t ON t.object_id = cc.parent_object_id
JOIN sys.schemas s ON s.schema_id = t.schema_id
WHERE s.name IN ({schemas})
"""

INDEX_SQL = """
SELECT s.name AS sch, t.name AS tbl, i.name AS iname, i.is_unique AS uniq,
       i.filter_definition AS filter, col.name AS col, ic.is_included_column AS included, ic.key_ordinal AS ord
FROM sys.indexes i
JOIN sys.tables t ON t.object_id = i.object_id
JOIN sys.schemas s ON s.schema_id = t.schema_id
JOIN sys.index_columns ic ON ic.object_id = i.object_id AND ic.index_id = i.index_id
JOIN sys.columns col ON col.object_id = ic.object_id AND col.column_id = ic.column_id
WHERE s.name IN ({schemas}) AND i.is_primary_key = 0 AND i.is_unique_constraint = 0 AND i.type > 0
ORDER BY s.name, t.name, i.name, ic.is_included_column, ic.key_ordinal
"""

FK_SQL = """
SELECT s.name AS sch, t.name AS tbl, fk.name AS fname,
       rs.name AS ref_sch, rt.name AS ref_tbl,
       pc.name AS col, rc.name AS ref_col, fkc.constraint_column_id AS ord,
       fk.delete_referential_action_desc AS on_delete, fk.update_referential_action_desc AS on_update
FROM sys.foreign_keys fk
JOIN sys.tables t ON t.object_id = fk.parent_object_id
JOIN sys.schemas s ON s.schema_id = t.schema_id
JOIN sys.tables rt ON rt.object_id = fk.referenced_object_id
JOIN sys.schemas rs ON rs.schema_id = rt.schema_id
JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
JOIN sys.columns pc ON pc.object_id = fkc.parent_object_id AND pc.column_id = fkc.parent_column_id
JOIN sys.columns rc ON rc.object_id = fkc.referenced_object_id AND rc.column_id = fkc.referenced_column_id
WHERE s.name IN ({schemas})
ORDER BY s.name, t.name, fk.name, fkc.constraint_column_id
"""

OBJECTS_SQL = """
SELECT s.name AS sch, o.name AS name, o.type AS otype, m.definition AS body
FROM sys.sql_modules m
JOIN sys.objects o ON o.object_id = m.object_id
JOIN sys.schemas s ON s.schema_id = o.schema_id
WHERE s.name IN ({schemas}) AND o.type IN ('V','FN','IF','TF','P','TR')
"""

OBJ_KIND = {"V": "view", "FN": "function", "IF": "function", "TF": "function",
            "P": "procedure", "TR": "trigger"}


def _in_list(schemas):
    return ", ".join("'" + s.replace("'", "''") + "'" for s in schemas)


def fetch(cur, sql, schemas):
    cur.execute(sql.format(schemas=_in_list(schemas)))
    cols = [d[0] for d in cur.description]
    return [dict(zip(cols, row)) for row in cur.fetchall()]


def extract_schema(cur, schemas) -> dict:
    tables: dict[str, dict] = {}

    def tbl(sch, name):
        key = qualify(sch, name)
        return tables.setdefault(key, {"schema": sch, "name": name, "columns": [], "pk": [],
                                       "uniques": [], "checks": [], "indexes": [], "fks": []})

    for r in fetch(cur, COLUMNS_SQL, schemas):
        identity = {"seed": int(r["seed"]), "increment": int(r["incr"])} if r["is_identity"] else None
        tbl(r["sch"], r["tbl"])["columns"].append({
            "name": r["col"], "type": r["type"], "length": r["max_len"],
            "precision": r["prec"], "scale": r["scale"], "nullable": bool(r["nullable"]),
            "default": r["default_def"],
            "computed": {"expr": r["computed_def"], "persisted": bool(r["persisted"])} if r["is_computed"] else None,
            "identity": identity,
        })

    pk_idx: dict[tuple, list] = {}
    uq_idx: dict[tuple, list] = {}
    for r in fetch(cur, PK_UNIQUE_SQL, schemas):
        bucket = pk_idx if r["ktype"] == "PK" else uq_idx
        bucket.setdefault((r["sch"], r["tbl"], r["cname"]), []).append(r["col"])
    for (sch, name, _), cols in pk_idx.items():
        tbl(sch, name)["pk"] = cols
    for (sch, name, cname), cols in uq_idx.items():
        tbl(sch, name)["uniques"].append({"name": cname, "columns": cols})

    for r in fetch(cur, CHECK_SQL, schemas):
        tbl(r["sch"], r["tbl"])["checks"].append({"name": r["cname"], "expr": r["expr"]})

    idx: dict[tuple, dict] = {}
    for r in fetch(cur, INDEX_SQL, schemas):
        e = idx.setdefault((r["sch"], r["tbl"], r["iname"]),
                           {"name": r["iname"], "unique": bool(r["uniq"]),
                            "filter": r["filter"], "columns": [], "included": []})
        (e["included"] if r["included"] else e["columns"]).append(r["col"])
    for (sch, name, _), e in idx.items():
        tbl(sch, name)["indexes"].append(e)

    fk: dict[tuple, dict] = {}
    for r in fetch(cur, FK_SQL, schemas):
        e = fk.setdefault((r["sch"], r["tbl"], r["fname"]),
                          {"name": r["fname"], "columns": [],
                           "ref_table": qualify(r["ref_sch"], r["ref_tbl"]), "ref_columns": [],
                           "on_delete": r["on_delete"], "on_update": r["on_update"]})
        e["columns"].append(r["col"])
        e["ref_columns"].append(r["ref_col"])
    for (sch, name, _), e in fk.items():
        tbl(sch, name)["fks"].append(e)

    return {"tables": sorted(tables.values(), key=lambda t: (t["schema"], t["name"])), "sequences": []}


def extract_objects(cur, schemas) -> list:
    out = []
    for r in fetch(cur, OBJECTS_SQL, schemas):
        # sys.objects.type is CHAR(2) — SQL Server pads single-letter codes ('P', 'V') with a
        # trailing space, which misses the OBJ_KIND lookup unless stripped first.
        otype = r["otype"].strip()
        out.append({"kind": OBJ_KIND.get(otype, otype), "schema": r["sch"],
                    "name": r["name"], "body": r["body"], "depends_on": []})
    return sorted(out, key=lambda o: (o["kind"], o["schema"], o["name"]))


def extract_baseline(cur, schema_doc, out_of_scope) -> list:
    rows = []
    for t in schema_doc["tables"]:
        key = qualify(t["schema"], t["name"])
        if key in out_of_scope:
            continue
        fq = f"[{t['schema']}].[{t['name']}]"
        cur.execute(f"SELECT count(*) FROM {fq}")  # identifiers from our own catalog, not user input
        n = int(cur.fetchone()[0])
        aggs = {}
        for c in t["columns"]:
            if c["computed"]:
                continue
            col = f"[{c['name']}]"
            ty = c["type"].lower()
            try:
                if ty in ("int", "bigint", "smallint", "tinyint", "decimal", "numeric", "money", "smallmoney", "float", "real"):
                    cur.execute(f"SELECT SUM(CAST({col} AS float)), MIN({col}), MAX({col}), "
                                f"SUM(CASE WHEN {col} IS NULL THEN 1 ELSE 0 END) FROM {fq}")
                elif ty in ("date", "datetime", "datetime2", "smalldatetime", "datetimeoffset", "time"):
                    cur.execute(f"SELECT NULL, MIN({col}), MAX({col}), "
                                f"SUM(CASE WHEN {col} IS NULL THEN 1 ELSE 0 END) FROM {fq}")
                else:
                    cur.execute(f"SELECT NULL, NULL, NULL, SUM(CASE WHEN {col} IS NULL THEN 1 ELSE 0 END) FROM {fq}")
                s, mn, mx, nulls = cur.fetchone()
                aggs[c["name"]] = {"sum": s, "min": mn, "max": mx, "nulls": int(nulls or 0)}
            except Exception as e:  # noqa: BLE001 — a column type we can't aggregate is recorded, not fatal
                aggs[c["name"]] = {"error": str(e)}
        key_distinct = {}
        if t["pk"]:
            pk_cols = ", ".join(f"[{c}]" for c in t["pk"])
            cur.execute(f"SELECT count(*) FROM (SELECT DISTINCT {pk_cols} FROM {fq}) d")
            key_distinct["+".join(t["pk"])] = int(cur.fetchone()[0])
        rows.append({"table": key, "row_count": n, "columns": aggs, "key_distinct": key_distinct})
    return rows


def main():
    cfg, args = parse_args("Phase 1 — extract source schema, in-DB code, baseline")
    refuse_overwrite(cfg, args.force, "phase1/schema.json", "phase1/objects.json", "phase1/baseline.json")
    if cfg.source_flavor != "sqlserver":
        sys.exit(f"phase1_extract: source flavor '{cfg.source_flavor}' not implemented (shipped: sqlserver)")

    conn = cfg.connect_source()
    cur = conn.cursor()
    schema_doc = extract_schema(cur, cfg.schemas)
    objects = extract_objects(cur, cfg.schemas)
    baseline = extract_baseline(cur, schema_doc, cfg.out_of_scope)
    conn.close()

    paths = [
        write_json(cfg, "phase1/schema.json", schema_doc),
        write_json(cfg, "phase1/objects.json", objects),
        write_json(cfg, "phase1/baseline.json", baseline),
    ]
    seal(cfg, *paths)
    print(f"1 extract: {len(schema_doc['tables'])} tables, {len(objects)} in-DB objects, "
          f"{len(baseline)} baselined")


if __name__ == "__main__":
    main()
