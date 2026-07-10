# Method — the engine conversion pipeline

Mechanical, fidelity-first conversion of a relational database to another engine. The schema is
**preserved exactly** — one target table per source table, one column per column — and only the
dialect changes. Size-agnostic: nothing here depends on how many tables the system has.

Principles: read-only against the source; the target is a fresh engine; each phase produces
immutable artifacts (schemas in [`artifacts.md`](artifacts.md)) consumed by the next. The
dialect mapping lives in [`flavor/`](flavor/) — this file is direction-neutral.

## Phase 1 — Extract (read-only on source) — `pipeline/phase1_extract.py`

From the live source catalog (preferred — no parsing ambiguity) or a DDL script. Capture the
**whole** schema, losslessly:

- tables / columns / types (with length, precision, scale) / nullability / collation;
- column defaults and **computed/generated** columns (expression text);
- **identity / sequence** definitions (seed, increment, current value);
- PKs, unique constraints, **CHECK** constraints (expression text), indexes (including
  filtered/included columns), FK edges with their on-delete/on-update actions;
- the **in-DB code inventory** — procedures, functions, triggers, views (name + body).

Plus a per-table **baseline** for phase 5: row count and per-column aggregates (sum/min/max over
numeric and temporal columns, null counts, distinct counts on keys). Produces `schema.json`,
`objects.json`, `baseline.json`. Read-only — never writes to the source.

## Phase 2 — Translate (deterministic + review) — `pipeline/phase2_translate.py`

Emit the target DDL **1:1** via the flavor mapping. For every source object:

- one target table, same name and column order, each column's type **mapped** per
  `flavor/<direction>.md`, same nullability;
- defaults translated (dialect functions remapped, e.g. `GETDATE()` → `now()`), identities
  translated (e.g. `IDENTITY(1,1)` → `GENERATED ... AS IDENTITY` or a sequence), and PK / unique
  / CHECK / FK / indexes reproduced.
- **Anything that cannot be mapped 1:1 → `unmapped_features.json`** (the report): unsupported
  types, computed-column expressions using engine-only functions, CLR-backed objects, exotic
  index kinds. Nothing is dropped or guessed — each becomes a human decision.
- **In-DB code:** views and trivial scalar functions are translated best-effort; non-trivial
  procedures/triggers are emitted as **flagged** stubs in `ported_code/` with the **original
  alongside**. A flagged port is not "done" until the orchestrator + user review it.

Output: `target/ddl/` (ordered creation scripts), `unmapped_features.json`, `ported_code/` with
a flag manifest. **The orchestrator + user resolve every flag before phase 3 is signed off** —
that resolution is recorded, not improvised by the executor.

## Phase 3 — Stand up (executor)

Apply `target/ddl/` to a **fresh** target engine in Docker (compose file under
`.claude/db-conversion/target/`). The schema must create with **zero** errors, and the created
object inventory must **equal** phase 1's (minus only features explicitly accepted as
unsupported-and-undroppable in the phase-2 review). Output: `target/standup_report.json`
(objects expected vs. created, in dependency order).

## Phase 4 — Migrate (executor) — `pipeline/phase4_migrate.py`

Copy data **source → target** with fidelity:

- **FK-dependency order** (topological sort of the FK graph). Cycles are handled by loading with
  constraints deferred / triggers disabled, then re-validating — never by dropping a constraint.
- **Type coercion** per the flavor mapping at the value level (datetime precision, GUID → `uuid`,
  `varbinary` → `bytea`, `bit` → `boolean`, `money` → `numeric`, encoding/`N''` text). Batched.
- After load, **reseed** every sequence/identity to `max(key) + 1` so new inserts don't collide.
- Honors `verify.mode`: a declared **sample** for a fast loop, **full** for the real run.

Output: `target/migrate_report.json` (rows attempted/loaded per table, reseed values).

## Phase 5 — Verify (deterministic) — `pipeline/phase5_verify.py`

The gate. Per source table → its target table:

- **Row counts** — always.
- **Column aggregates** — recompute the phase-1 baseline on the target and compare (sums of
  numerics, min/max of temporals, null counts, key distinct-counts). This catches silent
  coercion drift a row count cannot (a truncated datetime, a rounded decimal).
- **Row-hash** — optional deep check: pull rows ordered by PK, normalize to a canonical text form
  **identically on both engines in Python**, hash, and compare (full, or over the sample).
  Cross-engine native checksums (`CHECKSUM_AGG` vs `md5`) are **not** comparable, so the proof is
  counts + aggregates (+ the Python row-hash where run), not a native checksum.

Output: `parity_report.json` stating the mode, the per-table results, and `all_match`. The
conversion is **done** only when the report is green — or when each remaining discrepancy is
recorded with an accepted reason. "It migrated without errors" is never sign-off.

## Pipeline order

```text
1 Extract ─► 2 Translate ─► (flag review, with user) ─► 3 Stand up ─► 4 Migrate ─► 5 Verify
  (source,        (DDL +                                   (fresh       (data,        (parity
 read-only)     unmapped report,                          target in    FK order,     report =
                flagged code)                              Docker)      reseed)        "done")
```

Re-running a phase requires `--force` (which re-seals); re-opening phase N invalidates N+1…
The source database is read from, never touched; the target is always a fresh database.
