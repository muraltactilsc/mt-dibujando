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

## Current Task — osc-catalogs-real-data-fix

Goal: fix a real, confirmed bug — the API crashes on startup against a genuinely fresh database
— and replace all placeholder catalog seed data with REAL production data (with real Dynamics
GUIDs) that the orchestrator extracted from the actual `.bacpac` backup. This is a fix-up on the
CURRENTLY OPEN, NOT-YET-MERGED PR #16 branch (`feature/osc-legalbase-backend`) — do not create a
new branch, keep working on this one. It also retroactively fixes a bug that PR #15 (already
merged into master) introduced — this branch will carry that fix forward when it merges.

### The bug (confirmed by the orchestrator, don't re-diagnose)

On a genuinely fresh database (verified in an isolated Postgres container, not the shared dev
volume, which was masking this), `initializeSchema()` crashes:

1. `apps/api/db/scripts/003_osc_general_data.sql` (from PR #15) contains `INSERT INTO state (...)`
   rows referencing `countryid = 4` — but `country` rows are seeded in
   `apps/api/db/seeds/002_registration_fixture.sql`, which runs via `seedAuthFixture()`, called
   **after** all of `initializeSchema()`'s numbered scripts. FK violation on a fresh DB.
2. `apps/api/db/scripts/004_osc_legalbase.sql` (from this PR) contains a fixture `INSERT INTO
legalbase` referencing `userprofileid = 1` — but that row is created in
   `apps/api/db/seeds/001_auth_fixture.sql`, which also runs after all schema scripts. Same class
   of bug.
3. `apps/api/db/seeds/001_auth_fixture.sql` was also edited (in this PR) to hardcode
   `userprofileid = 1` (previously auto-generated) without advancing
   `userprofile_userprofileid_seq` — the next real self-registration
   (`POST /api/auth/register`) on a fresh database would try to auto-generate id `1` too and
   collide with this fixture row.

**Root cause**: `apps/api/db/scripts/*.sql` is supposed to be schema DDL only (per the stack
doc), with all data seeding in `apps/api/db/seeds/*.sql`, run afterward. Both bugs above came from
mixing data INSERTs into a schema script. Fix this categorically, not just patch the two
instances — establish the rule as structurally enforced going forward (scripts = DDL only).

### The real-data opportunity (the other half of this task, decided with the user)

Every catalog table involved here (`country`, `state`, `osctype`, `actionline`,
`actionlinesecondary`, `osctypeconstitution`, `oscstatus`, and — added now while we're at it, for
the upcoming InstitutionalBase/Finance tasks — `agegroup`, `personalsituation`, `financingtype`,
`donortype`, `donationtype`, `incomeexpenseconcept`, `financedate`) is **Dynamics CRM-synced in
production** (see the tracker's FunctionsDibujando section — `SyncCountryState`/`SyncCatalogue`).
The placeholder data used so far (invented names, `NULL` Dynamics ids, made-up local ids like
`countryid = 4` for México) was never going to match what a real CRM sync would produce. The
orchestrator extracted the REAL rows (real names, real Dynamics GUIDs, real local ids, real
`statusid` including some legitimately-disabled catalog rows) directly from the original
`.bacpac` backup (via a temporary SQL Server container + `bcp` import — `sqlpackage` itself
couldn't connect due to a TLS incompatibility in this environment, worked around by using `bcp`
instead, which uses a simpler connection path). **Critical correction from the placeholder data**:
real production México has `countryid = 1` (only 2 countries exist: México=1, Costa Rica=2) — NOT
`4` as the placeholder guessed. This ripples into the auth fixture and this PR's own LegalBase
Mexico-conditional logic/tests.

The generated real data is at `.claude/dev/tmp/real-catalogs-seed.sql` (217 lines, already
correctly shaped as `INSERT ... ON CONFLICT ... DO UPDATE` + `setval(...)` per table, using the
exact lowercase Postgres column names). **Use this file's content verbatim** — do not regenerate
or re-derive it, and do not spot-check-and-"improve" the data (e.g. don't second-guess an empty
`description` column or a `statusid = 2` row — that's real production data, not a formatting
choice).

Requirements:

- FR-1: Move ALL data-seeding INSERTs out of `apps/api/db/scripts/*.sql` — those files become
  DDL-only (`CREATE TABLE` etc.), matching the stack doc's rule. Specifically:
  - Remove the `INSERT INTO state (...)` block from `003_osc_general_data.sql`.
  - Remove the fixture `INSERT INTO legalbase (...)` block from `004_osc_legalbase.sql`.
- FR-2: Add DDL (no data) for the 7 catalog tables that don't exist in `apps/api`'s schema yet —
  `agegroup`, `personalsituation`, `financingtype`, `donortype`, `donationtype`,
  `incomeexpenseconcept`, `financedate` — in a new script, e.g.
  `apps/api/db/scripts/005_finance_institutionalbase_catalogs.sql`, column defs copied verbatim
  from the sealed DDL (`.claude/db-conversion/phase2/target/ddl/010_tables.sql`). These tables
  aren't consumed by any endpoint yet (that's the InstitutionalBase/Finance tasks' job) — this
  task only creates and seeds them, so that work is already done when those tasks land.
- FR-3: Create `apps/api/db/seeds/000_catalogs.sql` — copy the entire content of
  `.claude/dev/tmp/real-catalogs-seed.sql` into it verbatim. This is the ONE place all
  Dynamics-synced catalog data lives, seeded first (before any fixture that references it). Add a
  short header comment explaining these are real production rows (with real Dynamics GUIDs),
  extracted from the `.bacpac`, not synthetic placeholders — and that they'll eventually be
  superseded/reconciled by a real CRM sync job (a later task), so their local ids aren't
  guaranteed stable forever, only for as long as this seed is authoritative.
- FR-4: Remove the now-redundant `INSERT INTO country (...)` block from
  `apps/api/db/seeds/002_registration_fixture.sql` (superseded by FR-3's consolidated file —
  keep that seed file's `question`/`answer` inserts, only remove the `country` part).
- FR-5: Fix `apps/api/db/seeds/001_auth_fixture.sql`:
  - Change the fixture user's `countryid` from `4` to `1` (real México id, per the real data).
  - Add `SELECT setval('userprofile_userprofileid_seq', (SELECT MAX(userprofileid) FROM
userprofile));` after the explicit `userprofileid = 1` insert, so the next real
    auto-generated `userprofile` row (e.g. from self-registration) doesn't collide.
- FR-6: Create `apps/api/db/seeds/003_osc_legalbase_fixture.sql` with the fixture row removed
  from `004_osc_legalbase.sql` in FR-1 (same content, just relocated — still references
  `userprofileid = 1`, which now exists by the time this seed file runs).
- FR-7: Update `apps/api/db/schema-initializer.ts`:
  - `initializeSchema()`: add the new FR-2 script to the sequence.
  - Add/rename the seed-running function so seeds run in this exact order: `000_catalogs.sql` →
    `001_auth_fixture.sql` → `002_registration_fixture.sql` → `003_osc_legalbase_fixture.sql`.
    (Rename the existing `seedAuthFixture()` export if that name no longer fits now that it runs
    more than the auth fixture — your call on the name, but keep call sites in `main.ts` working.)
- FR-8: Delete `.claude/dev/tmp/real-catalogs-seed.sql` once its content has been copied into
  `apps/api/db/seeds/000_catalogs.sql` — it was a staging file for this task, not meant to remain.
- FR-9: This PR's own LegalBase code/tests must reflect real México = `countryid 1`, not `4` —
  grep the branch's diff (`git diff master...HEAD`) for any hardcoded `4` tied to "México"/
  `isMexico` assumptions (e.g. in `.spec.ts` files or smoke-test notes in `last-task.md`) and
  correct them.
- FR-10: Add a short principle to `.claude/shared/docs/architecture/backend.md` (or wherever it
  fits best in that file — your call): **schema scripts under `db/scripts/` are DDL-only, all
  data seeding lives under `db/seeds/`, seeds run in filename order after all schema scripts** —
  so this class of bug can't recur. Also note, briefly: OSC-related catalog tables mirror
  Dynamics CRM catalogs and are seeded with real extracted production data (not synthetic
  placeholders) where practical — reference `.claude/dev/tmp/real-catalogs-seed.sql`'s origin
  (this task) so a future host understands why the data looks the way it does.

### Verification (must do — this is exactly the bug class we're fixing)

- FR-11: Verify against a **genuinely fresh** database, not the shared/reused dev Postgres
  volume — spin up an isolated, brand-new Postgres container (or `docker compose down -v` the
  existing one to wipe its volume) and confirm the API boots with zero errors. This is the
  precise scenario that was silently broken before; testing against an already-seeded volume
  would not prove the fix.

Acceptance (Given-When-Then):

- Given a brand-new, empty Postgres database, When the API starts, Then `initializeSchema()` and
  the seed sequence both complete with no errors (no FK violations, no missing-row errors).
- Given that fresh boot, When `GET /api/osc/legal-base?userProfileId=1` is called for the seeded
  fixture user, Then `isMexico: true` (the fixture user's country is now the real México,
  `countryid = 1`).
- Given that fresh boot, When `GET /api/catalogs/countries` is called, Then it returns the 2 real
  countries (México, Costa Rica) with their real Dynamics GUIDs, not the old 5-country
  placeholder list.
- Given that fresh boot, When a new user completes `POST /api/auth/register`, Then it succeeds
  (no primary-key collision on `userprofile`).
- Given the full `apps/api` validation gate re-run after all of the above, Then it still passes.

Out of scope: any change to `InstitutionalBase`/`Government`/`Finance` business logic (this task
only creates+seeds their catalog dependencies, per FR-2/FR-3 — the actual feature endpoints are
separate, already-planned tasks), wiring a real CRM sync job (that's the CRM-integration task,
much later), any change to the disposable `.claude/db-conversion/**` artifacts (untouched,
read-only).
