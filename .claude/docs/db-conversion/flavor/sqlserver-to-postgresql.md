# Flavor — SQL Server → PostgreSQL

The dialect binding for this direction. The method is direction-neutral; this is the mapping the
translator (phase 2) and the migrator (phase 4) apply. **Fidelity law:** one target table per
source table, one column per column, same name, same nullability — only the _type and dialect_
change. Anything not 1:1 here goes to `unmapped_features.json` for a human decision.

## Drivers & dialect

- **Source:** `pyodbc` + _ODBC Driver 18 for SQL Server_ (read-only login; add
  `Encrypt=yes;TrustServerCertificate=yes` for local/dev). `source_conn_env` in `config.json`.
- **Target:** `psycopg` (v3) to PostgreSQL 14+; `target_conn_env` in `config.json`.
- **sqlglot:** parse with `tsql`, transpile expressions (defaults, CHECK, computed) toward
  `postgres`. Expressions sqlglot can't transpile cleanly are **flagged**, not emitted blind.

## Catalog sources (phase 1, read-only)

| Fact                     | Source                                                                                                    |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| Tables / columns / types | `sys.tables` + `sys.columns` + `sys.types` (filtered to `config.schemas`)                                 |
| PKs / uniques / indexes  | `sys.key_constraints` + `sys.indexes` + `sys.index_columns` (+ `is_included_column`, `filter_definition`) |
| Check constraints        | `sys.check_constraints` (`definition`)                                                                    |
| FK edges (+ actions)     | `sys.foreign_keys` + `sys.foreign_key_columns` (`delete_referential_action`, `update_referential_action`) |
| Defaults / computed      | `sys.default_constraints`; `sys.computed_columns` (`definition`, `is_persisted`)                          |
| Identity                 | `sys.identity_columns` (`seed_value`, `increment_value`, `last_value`)                                    |
| Row counts / aggregates  | `sys.dm_db_partition_stats` for estimates; exact `count(*)` + `SUM/MIN/MAX` per the baseline              |
| In-DB code               | `sys.sql_modules` joined to `sys.objects` (V/FN/IF/TF/P/TR) for view/function/procedure/trigger bodies    |

## Type mapping

| SQL Server                                                | PostgreSQL                                | Notes                                                                                                            |
| --------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `bit`                                                     | `boolean`                                 | `0/1` → `false/true`                                                                                             |
| `tinyint`                                                 | `smallint`                                | T-SQL `tinyint` is 0–255 unsigned; `smallint` covers it                                                          |
| `smallint` / `int` / `bigint`                             | `smallint` / `integer` / `bigint`         | direct                                                                                                           |
| `decimal/numeric(p,s)`                                    | `numeric(p,s)`                            | direct                                                                                                           |
| `money` / `smallmoney`                                    | `numeric(19,4)` / `numeric(10,4)`         | fixed scale 4                                                                                                    |
| `real`                                                    | `real`                                    |                                                                                                                  |
| `float(n)`                                                | `real` (n≤24) / `double precision` (n≥25) |                                                                                                                  |
| `char(n)` / `nchar(n)`                                    | `char(n)`                                 | Postgres is Unicode by default; `n` is characters                                                                |
| `varchar(n)` / `nvarchar(n)`                              | `varchar(n)`                              |                                                                                                                  |
| `varchar(max)` / `nvarchar(max)` / `text` / `ntext`       | `text`                                    |                                                                                                                  |
| `binary(n)` / `varbinary(n)` / `varbinary(max)` / `image` | `bytea`                                   |                                                                                                                  |
| `date` / `time`                                           | `date` / `time`                           |                                                                                                                  |
| `datetime`                                                | `timestamp(3)`                            | ⚠ source rounds to ~1/300 s — see migration notes                                                                |
| `datetime2(n)`                                            | `timestamp(n)`                            |                                                                                                                  |
| `smalldatetime`                                           | `timestamp(0)`                            | minute precision                                                                                                 |
| `datetimeoffset(n)`                                       | `timestamptz`                             | offset normalized to UTC                                                                                         |
| `uniqueidentifier`                                        | `uuid`                                    | needs no extension; values compare equal (case-folded)                                                           |
| `xml`                                                     | `xml`                                     |                                                                                                                  |
| `rowversion` / `timestamp`                                | **FLAG**                                  | SQL Server `timestamp` is a row-version, _not_ a datetime — propose `bytea` + an app/trigger versioning decision |
| `sql_variant`                                             | **FLAG**                                  | no faithful equivalent — human decides (`text`/`jsonb`, with loss)                                               |
| `hierarchyid` / `geometry` / `geography`                  | **FLAG**                                  | `ltree`/PostGIS — out of a pure 1:1 map                                                                          |
| CLR UDTs                                                  | **FLAG**                                  | catalog-listed, no portable definition                                                                           |

`config.type_overrides` (set during the phase-2 review) wins over this table for a named column.

## Feature mapping

- **IDENTITY(seed,incr)** → `GENERATED BY DEFAULT AS IDENTITY (START WITH seed INCREMENT BY incr)`.
  Use **BY DEFAULT** (not ALWAYS) so phase 4 can load existing key values; phase 4 then reseeds
  the identity to `max(key)+1`.
- **Defaults:** `GETDATE()`/`SYSDATETIME()` → `now()`; `NEWID()` → `gen_random_uuid()`;
  `NEWSEQUENTIALID()` → `gen_random_uuid()` **+ FLAG** (sequentiality lost); numeric/string
  literals direct; a UDF default → translate the UDF or **FLAG**.
- **Computed columns:** persisted, expression transpilable → `GENERATED ALWAYS AS (expr) STORED`;
  non-persisted or engine-function expression → **FLAG** (often a view column or app concern).
- **CHECK constraints:** transpile the expression (`tsql`→`postgres`); engine-only functions →
  **FLAG**.
- **Indexes:** _clustered_ has no Postgres equivalent — emit a plain index (optionally a one-time
  `CLUSTER`); `INCLUDE` columns → Postgres `INCLUDE` (v11+); filtered (`WHERE`) → **partial
  index**.
- **Schemas:** preserve names by default — create the source schema (e.g. `dbo`) in the target.
  (Mapping `dbo`→`public` is a _deliberate_ override, recorded in `assumptions.md`, not a default.)
- **Identifiers:** SQL Server names are case-insensitive; the translator folds unquoted names to
  lowercase (logically loss-free). Mixed-case names that would **collide** when folded → **FLAG**.
- **Collation:** SQL Server's common **case-insensitive** collations have no default Postgres
  equivalent (Postgres compares case-sensitively). If the app relies on CI comparisons/uniqueness,
  **FLAG** (decide `citext`, a case-insensitive ICU collation, or app-side normalization).
- **Procedures / functions / triggers:** T-SQL → PL/pgSQL is the unreliable part. Translate views
  and trivial scalar functions best-effort; everything procedural is emitted as a **flagged** stub
  in `ported_code/ported/` with the original in `ported_code/original/` — never trusted until the
  user reviews it. (`@@ROWCOUNT`, `IDENTITY()`, multi-statement table-valued functions, `MERGE`,
  cursors, and dynamic SQL are common reasons a port needs human eyes.)

## Migration notes (phase 4)

- **Datetime:** SQL Server `datetime` rounds to 1/300 s; converting to `timestamp(3)` can shift a
  value by up to ~1.7 ms. This is expected — phase 5 compares `min/max` aggregates with that
  tolerance noted, not bit-exact equality, for `datetime`-sourced columns.
- **uniqueidentifier → uuid:** SQL Server renders GUIDs uppercase; Postgres stores lowercase. The
  values are equal — the row-hash normalizes case before hashing.
- **varbinary → bytea:** transfer as raw bytes (`psycopg` `bytea`), never as a hex string column.
- **char/nchar:** SQL Server blank-pads `CHAR`; preserve the padding (don't `RTRIM` on load).
- **Encoding:** the target database is created `UTF8`; `N'…'` literals and `nvarchar` data carry
  over directly.
- **Load order & integrity:** topological FK order; for cycles, load with
  `SET session_replication_role = replica` (defers FK/trigger enforcement), then restore and
  validate. Never drop a constraint to force a load.

## Verification notes (phase 5)

Native checksums are **not** cross-engine comparable (`CHECKSUM_AGG` ≠ `md5`). The proof is:

- **Row counts** per table (always).
- **Column aggregates** from `baseline.json` recomputed on Postgres: integer/numeric `SUM`,
  temporal `MIN/MAX` (datetime tolerance per above), `NULL` counts, key distinct-counts.
- **Row-hash** (optional, `verify.row_hash`): pull rows ordered by PK from both engines, normalize
  each value to a canonical string **the same way in Python** (uuid lowercased, bytea hex,
  boolean `0/1`, numeric fixed-scale, timestamp ISO-8601), hash per row, compare — full or over
  `verify.sample_rows`. This is the engine-agnostic deep check when counts + aggregates aren't
  enough confidence.
