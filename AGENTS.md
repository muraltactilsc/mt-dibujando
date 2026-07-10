# AGENTS.md

Read by the coding agent (the **executor**) at session start.

## How to use this file

1. Read `## Current Task` below — it names the area and what to build. It follows the shape in
   `.claude/dev/docs/spec-technique.md` (Goal · References · Requirements · Given-When-Then
   Acceptance · Out of scope). Your job is to make every **Acceptance** scenario pass, verified
   by the area's validation gate. If the spec contains a **`[NEEDS CLARIFICATION: …]`** marker,
   do **not** guess — write `status: blocked` in `last-task.md` with the question and stop.
2. **Before writing any code**, load, in order:
   - `.claude/shared/docs/coding-standards.md` — universal house rules + the decomposition method.
   - the area's **stack conventions doc** — concrete conventions, budgets, split recipes, and
     anti-patterns. The area's `architecture/<area>.md` (below) names the exact file under
     `.claude/shared/docs/stack/…` to load. Usually that's `stack/typescript/<area>-structure-and-conventions.md`;
     a **composed** project (e.g. Expo frontend + .NET backend) loads each area from its own
     stack folder, so follow the area doc's pointer rather than assuming one folder.
   - `.claude/shared/docs/architecture/<area>.md` — this repo's specifics (modules, real commands)
     and the validation gate you must pass.
3. Read `CLAUDE.local.md` (git-ignored, repo root) only when a task needs secrets/auth config.
4. Read the source files the task names — they are the source of truth for behavior. Do not
   invent new data models or duplicate capabilities that already exist; prefer extending an
   existing path.

Everything below `## Current Task` is overwritten each cycle.

## Role: executor

You write code, tests, and PRs. You do **not** decide scope or plan ahead — you execute the
one task specified, validate it, report, and stop. You also do **not** invent tooling: the
`.claude/shared/scripts/` helpers are provided by the orchestrator; you run them, you don't author them.

**Editor-only executors (aider).** If `.claude/shared/agent-config` is an aider executor, you are
editor-only: you apply edits and stop — `run-agent.sh` performs the surrounding workflow for you
(branch → edit → format → `validate.sh` → open PR → write this report). Two spec conventions feed
it: a `Read: <path>` line attaches that file read-only into your chat, and an `Edit: <path>` line
adds an existing file as editable. Edit from those real files, not from the repo-map, and never
invent APIs for a file you weren't given. If your run changes no files, the wrapper records
`status: blocked` and opens no PR — so actually write the deliverables the spec names.

## Completion report (every task, no exceptions)

> **Helper scripts — use these, don't re-derive the boilerplate.**
> `bash .claude/shared/scripts/new-branch.sh <task-id>` (clean branch from fresh `master`),
> `bash .claude/shared/scripts/validate.sh` (the full gate, fail-fast, mirrors CI),
> `bash .claude/shared/scripts/dev-up.sh [--web]` (bring the stack up, health-waited — fill its stub
> from `architecture/<area>.md` first),
> `node .claude/shared/scripts/ui-shot.mjs <url> <module>/<name> "<seeded-text>"` (render-proof
> screenshot — the wait-text makes it FAIL on a spinner/empty rather than save hollow proof),
> `bash .claude/shared/scripts/finish-task.sh "<pr-title>"` (git add+commit+push+PR). **git & gh ARE
> available — never skip the PR.**

1. **Branch:** `bash .claude/shared/scripts/new-branch.sh <task-id>` — clean `feature/<task-id>` from
   fresh `master`. One per task.
2. **Stage everything:** `git add .` — never cherry-pick (include any orchestrator-edited docs).
   (`finish-task.sh` does this in step 4.)
3. **Validate:** run **`bash .claude/shared/scripts/validate.sh`** (the full gate — format, build, lint,
   typecheck, test, and the house checks incl. `file-size.sh`). It must pass; it mirrors CI. A
   green build is **not** enough — **prove the changed behavior actually works**: bring up the
   stack (see the area's `<area>.md`), run your smoke checks, and for UI capture real rendered
   data via `ui-shot.mjs … "<seeded-text>"`. **Screenshots must show actually-rendered state with
   real data** — never a loading spinner, an unexplained empty list, or a 404/error shell. If a
   screen needs data, seed a real row first, then wait for its text to render before capturing.
   If you truly can't get it to render, say so in `last-task.md` — do not submit hollow proof.
4. **Open a PR** against `master`: `bash .claude/shared/scripts/finish-task.sh "<pr-title>"`
   (add+commit+push+`gh pr create`). Mandatory — omitting it is a task failure. **Do NOT claim
   git is unavailable** (it is; this script proves it).
5. **Write `.claude/dev/last-task.md`** with exactly this structure:

```yaml
status: done | blocked | partial
task_id: <short id>
pr_url: <full PR URL — never "none">
build: passing | failing | skipped
summary: <1-2 sentences>
blockers: <details, or "none">
next_hint: <anything the orchestrator should know before the next spec>
```

If blocked mid-task, write `status: blocked`, stop immediately, and fill `blockers` with
enough detail for the orchestrator to fix the spec before re-invoking.

## DB conversion tasks (Task 1 — SQL Server → PostgreSQL)

When `## Current Task` is a db-conversion phase task (grafted from `ai-db-engine-conversion`),
load `.claude/docs/db-conversion/method.md` and `artifacts.md` first, alongside the usual docs.
Extra rules on top of the ones above:

- Run only the one phase script the task names (`.claude/db-conversion-pipeline/.venv/bin/python
.claude/db-conversion-pipeline/phaseN_*.py --config .claude/db-conversion/config.json`) — never
  hand-edit an artifact under `.claude/db-conversion/`; a phase script writes and seals its own
  outputs.
- Never touch the analyzed source (DB or app tree) — `bash .claude/checks/readonly-guard.sh` must
  stay green; if it fails, you touched something outside `.claude/`.
- An unmapped feature or ported procedure is **never** your call to resolve — flag it in the
  report and stop; the orchestrator resolves it with the user.
- Finish by running `bash .claude/checks/artifact-schema.sh` and reporting the headline numbers
  (tables/objects/rows) in `last-task.md`, same structure as any other task.

---

## Current Task — db-conversion-phase3-standup

Goal: Stand up a **fresh** PostgreSQL 16 target in Docker and apply the reviewed, sealed phase-2
DDL to it — proving the translated schema actually creates cleanly on the target engine.

References:

- `.claude/docs/db-conversion/method.md` — phase 3's definition ("Stand up").
- `.claude/docs/db-conversion/artifacts.md` — `standup_report.json` shape.
- `.claude/db-conversion/phase2/target/ddl/` — the 5 sealed DDL files to apply, **in this exact
  order**: `001_schemas.sql`, `010_tables.sql`, `020_constraints.sql`, `030_foreign_keys.sql`,
  `040_indexes.sql`. Read-only — do not edit their contents.
- `.claude/db-conversion/phase1/schema.json` — source of the expected table count (63).

Requirements:

- FR-1: Write a `docker-compose.yml` under `.claude/db-conversion/target/` that runs a **fresh**
  `postgres:16-alpine` container for this conversion's target (a new container/volume, not the
  project's own `apps/api` dev Postgres from `docker-compose.yml` at repo root — do not touch or
  reuse that one).
- FR-2: Bring the target up, wait for it to accept connections, then apply the 5 DDL files from
  `.claude/db-conversion/phase2/target/ddl/` in the listed order via `psql` (or `psycopg`), stopping
  on the first error (`ON_ERROR_STOP=1` if using `psql`).
- FR-3: **Out of scope for this task** — do NOT apply anything from
  `.claude/db-conversion/phase2/ported_code/` (the 55 flagged `aspnet_*` procedures and the 1 view).
  Those are still pending separate human review per `method.md`'s phase-2 law ("a flagged port is
  not done until reviewed") — this task is schema-only (tables/constraints/FKs/indexes).
- FR-4: Write `.claude/db-conversion/phase3/standup_report.json` per `artifacts.md`'s shape:
  `{objects_expected, objects_created, missing: [...], errors: [...]}`, where `objects_expected`/
  `objects_created` are **table counts** (compare against phase 1's 63 tables — count actual tables
  created on the target via `information_schema.tables`, not just "no errors").
- FR-5: Confirm `bash .claude/checks/readonly-guard.sh` and `bash .claude/checks/artifact-schema.sh`
  both pass afterward.

Acceptance (Given-When-Then):

- Given the sealed phase-2 DDL, When the target Postgres container is brought up and the 5 DDL
  files are applied in order, Then all statements succeed with zero errors.
- Given the target now has tables, When `information_schema.tables` is queried on the target
  (schema `dbo`), Then it reports exactly 63 tables, matching phase 1's `schema.json` table count.
- Given the stand-up finished, When `standup_report.json` is written, Then
  `objects_expected == objects_created == 63` and `missing`/`errors` are empty.
- Given the stand-up finished, When `bash .claude/checks/readonly-guard.sh` and
  `bash .claude/checks/artifact-schema.sh` are run, Then both report green.

Out of scope: Applying the 55 `aspnet_*` procedures or the `OSCDocuments` view (pending separate
review). Phase 4 (data migration). Modifying any DDL file's contents — if a DDL file fails to
apply, report the exact error in `last-task.md` as `status: blocked` rather than hand-editing the
sealed SQL.
