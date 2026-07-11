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

## Current Task — osc-catalogs-incomeexpense-id-fix

Goal: fix a single incorrect data value in `apps/api/db/seeds/000_catalogs.sql` (introduced in the
previous task on this same PR #16 branch, `feature/osc-legalbase-backend` — keep working on this
branch, do not create a new one). This is a precise, single-value correction, not a re-derivation.

The bug (confirmed by the orchestrator against the original `.bacpac`-extracted data, which is
authoritative — do not re-derive or re-extract, just apply this one correction): in the
`incomeexpenseconcept` INSERT block, the row for `'Captación de recursos económicos por otras
actividades'` currently has `incomeexpenseconceptid = 18`. The REAL production id for this row is
**10** (it sits between id 9 `'Recuperación por servicio asistencial'` and id 11 `'Ingresos
patrimoniales'`, "order" column value 10 — the row's own "order" value already correctly says 10,
only the `incomeexpenseconceptid` column itself is wrong). There was never a `NULL` id in the
source data for this table — all 17 real rows have clean sequential ids 1–17 with no gaps; a
previous task's claim otherwise was incorrect and should not be repeated or re-justified.

Requirements:

- FR-1: In `apps/api/db/seeds/000_catalogs.sql`, change the `incomeexpenseconcept` row currently
  reading `(18, 1, 'Captación de recursos económicos por otras actividades', 10, 1, '1',
'2020-03-24 17:10:06.403', NULL, NULL)` to `(10, 1, 'Captación de recursos económicos por otras
actividades', 10, 1, '1', '2020-03-24 17:10:06.403', NULL, NULL)` — only the first column
  (`incomeexpenseconceptid`) changes, from `18` to `10`. Do not change anything else in that row
  or any other row in this file.
- FR-2: Confirm the full `incomeexpenseconcept` block now reads ids `1, 2, 3, 4, 5, 6, 7, 8, 9,
10, 11, 12, 13, 14, 15, 16, 17` in that exact order (matching the file's existing row order —
  don't reorder rows, just fix the one id value in place).
- FR-3: The `ON CONFLICT (incomeexpenseconceptid) DO UPDATE` clause and the trailing
  `SELECT setval('incomeexpenseconcept_incomeexpenseconceptid_seq', (SELECT MAX(...)))` line
  need no changes — `setval` computes `MAX` dynamically, so it self-corrects once the data is
  fixed. Do not hand-edit the `setval` line.
- FR-4: Re-verify against a genuinely fresh database (not the shared/reused dev Postgres volume —
  same requirement as the previous task on this branch): boot the API from an empty database and
  confirm no errors, then `SELECT incomeexpenseconceptid, name FROM incomeexpenseconcept ORDER BY
incomeexpenseconceptid` and confirm the full 1–17 sequence with no id 18 anywhere and no gaps.
- FR-5: Re-run `bash .claude/shared/scripts/validate.sh` to confirm nothing else broke.

Acceptance (Given-When-Then):

- Given a fresh database, When `apps/api` boots and seeds, Then `incomeexpenseconcept` has
  exactly 17 rows with ids 1–17 (no 18, no gaps).
- Given that seeded table, When queried for id 10, Then its name is `'Captación de recursos
económicos por otras actividades'`.
- Given the fix, When `validate.sh` runs, Then it passes.

Out of scope: any other table's data (already verified correct by the orchestrator against the
original extraction — do not touch), the seed-ordering fix or schema changes from the previous
task (already correct, don't revisit), any new feature work.
