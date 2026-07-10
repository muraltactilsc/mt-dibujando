"""Phase 5 — Verify: the parity gate. Source baseline vs. target, per table.

Compares row counts (always) and column aggregates (sum/min/max/nulls from phase-1 baseline vs.
recomputed on the target), plus an optional Python row-hash (engine-agnostic deep check). Native
checksums are NOT cross-engine comparable, so they are not used. Produces phase5/parity_report.json.
"""
from __future__ import annotations

import hashlib
import sys
from datetime import date, datetime
from decimal import Decimal

from common import parse_args, qualify, read_json, refuse_overwrite, seal, write_json

NUMERIC = {"int", "bigint", "smallint", "tinyint", "decimal", "numeric", "money", "smallmoney", "float", "real"}
TEMPORAL = {"date", "datetime", "datetime2", "smalldatetime", "datetimeoffset", "time"}
# datetime rounds to ~1/300s on the source; allow a small tolerance on those aggregates.
DATETIME_TOL_SECONDS = 0.004


def num_close(a, b):
    if a is None and b is None:
        return True
    if a is None or b is None:
        return False
    a, b = float(a), float(b)
    return abs(a - b) <= max(1e-6, abs(a) * 1e-9)


def temporal_close(a, b, lenient):
    if a is None and b is None:
        return True
    if a is None or b is None:
        return False
    da, db = _as_dt(a), _as_dt(b)
    if da is None or db is None:
        return str(a) == str(b)
    return abs((da - db).total_seconds()) <= (DATETIME_TOL_SECONDS if lenient else 0)


def _as_dt(v):
    if isinstance(v, datetime):
        return v
    if isinstance(v, date):
        return datetime(v.year, v.month, v.day)
    try:
        return datetime.fromisoformat(str(v))
    except Exception:  # noqa: BLE001
        return None


def target_aggregates(cur, t, cols):
    fq = f'"{t["schema"].lower()}"."{t["name"].lower()}"'
    aggs = {}
    for c in cols:
        col = f'"{c["name"].lower()}"'
        ty = c["type"].lower()
        if ty in NUMERIC:
            cur.execute(f"SELECT SUM({col}::double precision), MIN({col}), MAX({col}), "
                        f"count(*) FILTER (WHERE {col} IS NULL) FROM {fq}")
        elif ty in TEMPORAL:
            cur.execute(f"SELECT NULL, MIN({col}), MAX({col}), "
                        f"count(*) FILTER (WHERE {col} IS NULL) FROM {fq}")
        else:
            cur.execute(f"SELECT NULL, NULL, NULL, count(*) FILTER (WHERE {col} IS NULL) FROM {fq}")
        s, mn, mx, nulls = cur.fetchone()
        aggs[c["name"]] = {"sum": s, "min": mn, "max": mx, "nulls": int(nulls or 0)}
    return aggs


def aggregates_match(src, tgt, cols):
    diffs = []
    for c in cols:
        name, ty = c["name"], c["type"].lower()
        a, b = src.get(name, {}), tgt.get(name, {})
        if "error" in a:
            continue
        if int(a.get("nulls", 0)) != int(b.get("nulls", 0)):
            diffs.append(f"{name}.nulls {a.get('nulls')}!={b.get('nulls')}")
        if ty in NUMERIC and not num_close(a.get("sum"), b.get("sum")):
            diffs.append(f"{name}.sum {a.get('sum')}!={b.get('sum')}")
        if ty in TEMPORAL:
            lenient = ty in ("datetime", "smalldatetime")
            if not temporal_close(a.get("min"), b.get("min"), lenient):
                diffs.append(f"{name}.min {a.get('min')}!={b.get('min')}")
            if not temporal_close(a.get("max"), b.get("max"), lenient):
                diffs.append(f"{name}.max {a.get('max')}!={b.get('max')}")
    return diffs


def canon(v):
    if v is None:
        return "\\N"
    if isinstance(v, bool):
        return "1" if v else "0"
    if isinstance(v, (bytes, bytearray)):
        return v.hex()
    if isinstance(v, Decimal):
        return format(v.normalize(), "f")
    if isinstance(v, datetime):
        return v.isoformat()
    return str(v).lower() if _looks_uuid(v) else str(v)


def _looks_uuid(v):
    s = str(v)
    return len(s) == 36 and s.count("-") == 4


def row_hash(cur_exec, fq, cols, pk, limit):
    names = ", ".join(cols)
    order = ", ".join(pk) if pk else names
    lim = f" LIMIT {limit}" if limit else ""
    cur_exec(f"SELECT {names} FROM {fq} ORDER BY {order}{lim}")


def main():
    cfg, args = parse_args("Phase 5 — verify parity (counts + aggregates [+ row-hash])")
    refuse_overwrite(cfg, args.force, "phase5/parity_report.json")
    schema = read_json(cfg, "phase1/schema.json")
    baseline = {b["table"]: b for b in read_json(cfg, "phase1/baseline.json")}
    by_key = {qualify(t["schema"], t["name"]): t for t in schema["tables"]}
    do_hash = bool(cfg.verify.get("row_hash"))
    sample = int(cfg.verify.get("sample_rows", 1000))

    tgt = cfg.connect_target(); t_cur = tgt.cursor()
    src = cfg.connect_source() if do_hash else None
    s_cur = src.cursor() if src else None

    report = {"mode": cfg.verify.get("mode", "full"), "all_match": True, "tables": []}
    for key, base in sorted(baseline.items()):
        if key not in by_key:
            continue
        t = by_key[key]
        cols = [c for c in t["columns"] if not c["computed"]]
        fq = f'"{t["schema"].lower()}"."{t["name"].lower()}"'
        t_cur.execute(f"SELECT count(*) FROM {fq}")
        t_rows = int(t_cur.fetchone()[0])
        agg_diffs = aggregates_match(base["columns"], target_aggregates(t_cur, t, cols), cols)

        hash_match = None
        if do_hash:
            ncols = [c["name"] for c in cols]
            row_hash(lambda q: s_cur.execute(q), f"[{t['schema']}].[{t['name']}]",
                     [f"[{n}]" for n in ncols], [f"[{c}]" for c in t["pk"]], sample if report["mode"] == "sample" else None)
            src_rows = s_cur.fetchall()
            row_hash(lambda q: t_cur.execute(q), fq, [f'"{n.lower()}"' for n in ncols],
                     [f'"{c.lower()}"' for c in t["pk"]], sample if report["mode"] == "sample" else None)
            tgt_rows = t_cur.fetchall()
            sh = hashlib.sha256("\n".join("\x1f".join(canon(v) for v in r) for r in src_rows).encode()).hexdigest()
            th = hashlib.sha256("\n".join("\x1f".join(canon(v) for v in r) for r in tgt_rows).encode()).hexdigest()
            hash_match = sh == th

        match = (base["row_count"] == t_rows) and not agg_diffs and (hash_match in (None, True))
        report["all_match"] &= match
        report["tables"].append({"source": key, "target": key, "source_rows": base["row_count"],
                                 "target_rows": t_rows, "aggregates_match": not agg_diffs,
                                 "aggregate_diffs": agg_diffs, "row_hash": hash_match, "match": match})
    tgt.close()
    if src:
        src.close()

    path = write_json(cfg, "phase5/parity_report.json", report)
    seal(cfg, path)
    ok = sum(1 for t in report["tables"] if t["match"])
    print(f"5 verify ({report['mode']}): {ok}/{len(report['tables'])} tables match")
    if not report["all_match"]:
        print("  ✗ parity FAILED — see phase5/parity_report.json; do not sign off.")
        sys.exit(1)


if __name__ == "__main__":
    main()
