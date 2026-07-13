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

## Current Task — osc-institutionalbase-backend (resume)

Goal: your previous run on this exact task was interrupted (killed) before it could commit,
branch, or open a PR — but it left real, seemingly-complete work in the working tree. The
orchestrator has already created `feature/osc-institutionalbase-backend` and checked it out with
that work uncommitted. **Do NOT run `new-branch.sh`** — you are already on the right branch with
your own prior files present. Your job now: review everything for completeness and correctness,
run the full validation gate, fix anything broken or incomplete, then commit + push + open the PR
normally via `finish-task.sh`.

What's already there (uncommitted, on this branch — inspect it yourself, don't assume it's
finished just because files exist):

- `apps/api/db/scripts/006_osc_institutionalbase.sql`, `apps/api/db/seeds/
004_osc_institutionalbase_fixture.sql`
- `apps/api/src/modules/institutional-base/` — a full module (service, write-service, validator,
  mapper, split fixed/repeatable repositories, controller, exception filter)
- `packages/shared/src/institutional-base{,-data,-items}.schema.ts`
- A restructure of `apps/api/db/types.ts`: it split from one large generated file into
  `apps/api/db/types/{auth,catalogs,common,institutional-base,osc,registration}.types.ts`, with
  `apps/api/db/types.ts` itself reduced to a re-export barrel (`export * from './types/...'`) so
  existing `from '.../db/types'` imports elsewhere keep working. **Verify this split is actually
  necessary and correct** — confirm it was driven by hitting the file-size budget cap as more
  tables were added (not an arbitrary reorganization), confirm every existing import site still
  resolves, and confirm `kysely-codegen`'s regeneration story for this split going forward is
  documented somewhere sane (e.g. a comment explaining "regenerate to a temp file, then
  re-run the split" or similar) — don't leave it as a one-off hand-edit with no note on how to
  redo it next time a table's added.
  - Modified `apps/api/src/app.module.ts` and `packages/shared/src/index.ts` — confirm these
    wire the new module/schemas in correctly (no dangling references, no double-registration).
  - Modified `apps/api/db/schema-initializer.ts` — confirm it adds the new schema script and the
    new seed file in the correct order (schema scripts first, then seeds in filename order — the
    exact rule established by the last two tasks on this feature area; the seed fixture
    references `userprofileid = 1` from `001_auth_fixture.sql`, so it must run after that).

Full original task context (still applies — re-read if anything above is unclear or missing):
`.claude/shared/docs/architecture/backend.md`'s Database schema & seed rules section (schema
scripts are DDL-only, seeds run in filename order — a rule this same feature area violated twice
before this task), `apps/api/src/modules/legal-base/` (PR #16, merged — the established pattern
this module should match), `apps/api/src/shared/osc-profile-lock.ts` (the shared read-only-gate
functions to reuse, not reimplement).

Requirements:

- FR-1: Read every file listed above in full. Confirm the two repeatable-row validation shapes
  are correctly implemented and NOT conflated: (a) intervention-programs/volunteer-activities —
  drop-if-all-empty-and-unsaved, error-if-partially-filled, no silent data loss on a partially
  filled row; (b) population-served/operative-team — fixed one-row-per-catalog-entry, no
  drop-empty logic, every field genuinely required. If either is wrong, fix it.
- FR-2: Confirm the read-only gate (`403 osc_profile_locked`) and `needsResubmission` are wired
  via the SHARED `apps/api/src/shared/osc-profile-lock.ts` functions (not reimplemented locally).
- FR-3: Run the FULL validation gate: `bash .claude/shared/scripts/validate.sh` (format, build,
  lint, typecheck, test, file-size, banned-deps, no-raw-fetch) — fix anything it flags.
- FR-4: **Verify against a genuinely fresh database** (not the shared/reused dev Postgres volume
  — this exact class of bug has broken this feature area twice already this session): spin up an
  isolated, brand-new Postgres, boot the API, confirm `initializeSchema()` + the full seed
  sequence complete with zero errors, then smoke-test `GET`/`POST
/api/osc/institutional-base` end-to-end against the seeded fixture.
- FR-5: Once everything above is genuinely green, `git add -A`, commit, push, and
  `bash .claude/shared/scripts/finish-task.sh "<title>"` to open the real PR. Record in
  `last-task.md` that this was a resume of an interrupted prior run, and exactly what you
  reviewed/fixed vs. what was already correct.

Acceptance (Given-When-Then): same as the original task's acceptance criteria (unchanged) — a
genuinely fresh database boots and seeds cleanly, `GET/POST /api/osc/institutional-base` behave
per the two validation shapes above, read-only/resubmission work via the shared functions, and
the full validation gate passes.

Out of scope: `Government`/`Finance` (separate follow-up tasks), any CRM call, the frontend OSC
profile screen.
