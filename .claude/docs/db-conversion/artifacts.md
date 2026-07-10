# Artifacts — contracts, layout, immutability

Everything the pipeline produces lives under `.claude/db-conversion/`. Artifacts are facts:
produced by a script (or a defined review step), sealed in the manifest, never hand-edited.
`artifact-schema.sh` enforces presence, shape, and hashes — a violation fails the task.

## Layout

```text
.claude/db-conversion/
├── config.json              input config (committed; NO secrets — see below)
├── assumptions.md           closed-world declaration, extra sources, out-of-scope objects
├── manifest.json            sha256 seal per artifact (written by the scripts)
├── phase1/  schema.json · objects.json · baseline.json
├── phase2/  unmapped_features.json · flag_manifest.json
│            target/ddl/*.sql · ported_code/{original,ported}/*
├── phase3/  standup_report.json · target/docker-compose.yml
├── phase4/  migrate_report.json
└── phase5/  parity_report.json
```

## config.json (input, written at setup)

```json
{
  "source_flavor": "sqlserver",
  "target_flavor": "postgresql",
  "source_conn_env": "DBCONV_SOURCE_DB",
  "target_conn_env": "DBCONV_TARGET_DB",
  "source_ddl_file": null,
  "schemas": ["dbo"],
  "extra_sources": [],
  "out_of_scope": [],
  "type_overrides": {},
  "batch_size": 5000,
  "verify": { "mode": "full", "row_hash": false, "sample_rows": 1000 }
}
```

- `source_flavor`/`target_flavor` set the **direction**; the only shipped pair is
  `sqlserver → postgresql`. Any other pair aborts (see `common.py`).
- `source_conn_env`/`target_conn_env` name the **environment variables** holding the connection
  strings — the strings themselves live in `CLAUDE.local.md`/the environment, never here. The
  source account is read-only.
- `source_ddl_file`: fallback when no live source connection is available (catalog scan is
  preferred; runtime facts like row estimates are then unavailable).
- `extra_sources`: user-provided schema/code not in the catalog (CLR surface, SSIS SQL).
- `out_of_scope`: tables/schemas intentionally not converted — phase 5 won't flag them missing.
- `type_overrides`: `{ "schema.table.column": "target_type" }` — explicit human decisions from
  the phase-2 review that override the default mapping for a specific column.

## Phase 1 — extracted facts

| Artifact        | Shape                                                                                                                                                                                                                                                                                                                   |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `schema.json`   | `{tables: [{schema, name, columns: [{name, type, length, precision, scale, nullable, default, computed, identity}], pk: [col], uniques: [...], checks: [{name, expr}], indexes: [{name, columns, unique, filter, included}], fks: [{name, columns, ref_table, ref_columns, on_delete, on_update}]}], sequences: [...]}` |
| `objects.json`  | `[{kind: view/function/procedure/trigger, schema, name, body, depends_on: [table]}]`                                                                                                                                                                                                                                    |
| `baseline.json` | `[{table, row_count, columns: {col: {sum, min, max, nulls}}, key_distinct: {pk_col: n}}]`                                                                                                                                                                                                                               |

## Phase 2 — translation

| Artifact                 | Shape                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `target/ddl/NNN_*.sql`   | ordered target DDL (extensions → tables → constraints → indexes → sequences → in-DB code)                                 |
| `unmapped_features.json` | `[{object, kind, source_type_or_expr, reason, suggested}]` — **never empty by silent dropping**; each is a human decision |
| `flag_manifest.json`     | `[{name, kind, auto_translated: bool, needs_review: bool, original_path, ported_path}]` for everything in `ported_code/`  |

## Phases 3–5 — proof

| Artifact              | Shape                                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `standup_report.json` | `{objects_expected, objects_created, missing: [...], errors: [...]}` — created must equal expected (minus accepted-unsupported) |
| `migrate_report.json` | `{mode, tables: [{source, target, rows_source, rows_loaded}], reseeded: {seq: value}}`                                          |
| `parity_report.json`  | `{mode, all_match, tables: [{source, target, source_rows, target_rows, aggregates_match, row_hash: match/null, match}]}`        |

## Sealing & immutability

- Every pipeline script finishes by writing/refreshing its outputs' SHA-256 entries in
  `manifest.json` (`{path: {sha256, phase, sealed_at}}`). Review outputs (the resolved
  `unmapped_features.json` decisions, reviewed ported code) are sealed by
  `artifact-schema.sh --seal <path>` once the user confirms them.
- `artifact-schema.sh` fails when: a sealed artifact's file is missing or its hash differs (it
  was edited), a present phase directory lacks its required files, or a JSON artifact does not
  parse.
- Re-running a phase requires the script's `--force` flag, which re-seals its outputs. Downstream
  phases are thereby stale — re-run them too. There is no legitimate path that edits an artifact
  in place.
