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

## Current Task — osc-legalbase-backend

Goal: `apps/api` exposes the OSC profile's **Legal Base** section (legacy: `LegalBaseController`)
— the simplest of the four remaining OSC-wizard sections, one row per OSC, with one
country-conditional required field. Second backend slice in this area (after PR #15's General
Data section, already merged) — reuse its read-only/resubmission logic, don't reimplement it.

References (read before coding — point, not transcribed):

- `/home/angel/src/Dibujando (FDUM)/Dibujando 1.1/PortalDibujando/Controllers/LegalBaseController.cs`
  (440 lines, full file) — `GetLegalBaseData`, `SaveLegalBase`, `FillLegalBaseData`,
  `ValidateLegalBaseData` (both overloads).
- `.../PortalDibujando/Classes/GetIdMx.cs` — `IdMex()`: looks up the `country` row named
  exactly `"México"` and returns its id. "Is this OSC in Mexico" is computed by comparing
  `userProfile.CountryId` to that id — **do not hardcode a country id**, query by name, same as
  legacy (the seeded `country` table from Task 2, PR #10, already has a `México` row).
- `.../PortalDibujando/Models/ViewModelLegalBase.cs` — exact Spanish validation strings (FR-2).
- `.claude/db-conversion/phase2/target/ddl/010_tables.sql` — sealed `legalbase` column defs
  (~line matching `CREATE TABLE "dbo"."legalbase"`) — reuse verbatim, including the two
  non-standard audit column names (`usercreated` not `usercreateid`, `userupdatedid` not
  `userupdateid` — legacy quirks, keep them, don't "fix" the naming).
- `apps/api/src/modules/osc/` (PR #15, merged) — the established pattern for this whole
  feature area: 4-layer module shape, the `UserProfileId`/`OSCProfileId` fallback-lookup
  pattern (query by both if `OSCProfileId` given, fall back to `UserProfileId` alone if that
  finds nothing), `isOSCProfileReadOnly`/`needsResubmission` domain functions. **Relocate these
  two functions from `apps/api/src/modules/osc/domain/osc-profile-lock.ts` to
  `apps/api/src/shared/osc-profile-lock.ts`** (update the `osc` module's imports accordingly) —
  this is the second module that needs them (InstitutionalBase/Government/Finance will be a
  third/fourth/fifth), which crosses the line from "duplicate a little" to "genuinely shared,"
  per the house rule on cross-cutting code living in `shared/`. Each module still owns its own
  Kysely queries for fetching `oscprofile` rows — don't share the repository itself, only the
  two pure business-rule functions.
- `packages/shared/src/osc.schema.ts` (PR #15) — the pattern to follow for this task's new
  schemas (add to the same file or a new `legal-base.schema.ts` re-exported the same way).

Requirements:

- FR-1: Schema — new script `apps/api/db/scripts/004_osc_legalbase.sql`: `legalbase` table,
  column defs verbatim from the sealed DDL (including the two odd audit-column names above), PK
  - FKs `userprofileid → userprofile.userprofileid`, `oscprofileid → oscprofile.oscprofileid`
    (nullable). Seed one representative fixture row tied to the existing PR #8 seeded user
    (`qa.auth@dibujando.test`, whose `userprofileid` — check the existing seed for its actual
    value) so the acceptance scenarios below have real data to exercise. Regenerate
    `apps/api/db/types.ts` via `kysely-codegen` (established pattern).
- FR-2: New `legal-base` module (`apps/api/src/modules/legal-base/`, 4-layer shape).
  `GET /api/osc/legal-base?userProfileId=<id>&oscProfileId=<id?>` — same fallback-lookup pattern
  as General Data (PR #15): if `oscProfileId` given, look up by both; if that finds nothing (or
  no `oscProfileId` given), fall back to `userProfileId` alone. Response includes the section's
  fields (or empty/defaults if no row exists yet), `isMexico: boolean` (computed as above),
  `readOnly: boolean` (via the shared `isOSCProfileReadOnly`, reading the user's OSCProfile's
  `dynamicsoscstatusid` — no OSCProfile yet means not read-only).
- FR-3: `POST /api/osc/legal-base` — body zod schema (new, in `packages/shared`) mirroring
  `ViewModelLegalBase`'s fields/messages, substituting each `{0}` Display Name into the resolved
  message text (matches the pattern used in PR #15's `osc.schema.ts` for General Data):
  - `organizationConstitutionDate` (date) required: "El campo Constitución de la Organización es
    requerido."
  - `lastProtocolizationDate` (date, optional at the schema level — see FR-4 for the conditional
    requirement, which cannot be expressed as a static zod field-level rule since it depends on
    the user's country, a DB-derived fact, not a sibling field in the same payload)
  - `isAuthorized` (boolean) required: "El campo ¿Está autorizada por la autoridad gubernamental
    para emitir recibos deducibles? es requerido."
  - `goubernamentalAuthorizationDate` (date) required: "El campo Autorización de la autoridad
    gubernamental vigente para recibir donativos con deducibilidad es requerido."
  - `socialObjetive` (string) required, max 1024: "El campo Objeto Social de la Organización o
    Fines de la Organización es requerido." / "El campo Objeto Social de la Organización o Fines
    de la Organización solo puede tener 1024 caracteres" — trim before persisting (matches
    legacy's explicit `.Trim()` call, a "clean line breaks" step).
- FR-4: Country-conditional requirement (cannot live in the static zod schema — it depends on the
  server's own `isMexico` computation, not a value the client sends): in the service layer, after
  the schema passes, if the user's `isMexico` is true AND `lastProtocolizationDate` is
  missing/empty, reject with `400 { error: { code: 'last_protocolization_required', message: 'El
campo Fecha de la última protocolización del acta constitutiva de la organización es
requerido.' } }` (exact legacy string). Non-Mexico OSCs never require this field.
- FR-5: Read-only + resubmission — reuse the shared functions from FR (osc-profile-lock
  relocation above): reject `POST` with `403 { error: { code: 'osc_profile_locked' } }` when the
  OSC profile is read-only (same rule as General Data); response includes `needsResubmission`
  after a successful save.
- FR-6: Upsert by `legalBaseId` if present in the body (update), else insert a new row — same
  create-vs-update branch shape as General Data (PR #15). New rows get `statusid = 1`; on
  create, also backfill `oscprofileid` from the user's existing `OSCProfile` if one exists (same
  "lazily attach once OSCProfile exists" pattern as General Data and every other section).

Acceptance (Given-When-Then — checkable via `apps/api`'s validation gate):

- Given a user with no `legalbase` row yet, When `GET /api/osc/legal-base?userProfileId=<id>` is
  called, Then it returns empty/default fields, the correct `isMexico`, and `readOnly: false`.
- Given a complete, valid body for a Mexican OSC (fixture user's country is México) that DOES
  include `lastProtocolizationDate`, When `POST /api/osc/legal-base` is called, Then it creates
  the row successfully.
- Given the same Mexican OSC but `lastProtocolizationDate` omitted, When posted, Then it returns
  `400 last_protocolization_required` with the exact legacy message.
- Given a non-Mexican OSC (seed or update a fixture user's `countryid` to a non-México country)
  with `lastProtocolizationDate` omitted, When posted, Then it succeeds (not required outside
  Mexico).
- Given `socialObjetive` with leading/trailing whitespace/line breaks, When posted, Then the
  stored value is trimmed.
- Given a fixture `oscprofile` with `dynamicsoscstatusid` set to a read-only value
  (`'206430000'`/`'206430001'`, same values proven in PR #15), When `POST /api/osc/legal-base` is
  called for that user, Then it returns `403 osc_profile_locked`.
- Given a saved row, When `POST /api/osc/legal-base` is called again with its `legalBaseId`,
  Then it updates the existing row (not a duplicate insert).

Out of scope: `InstitutionalBase`/`Government`/`Finance` (separate follow-up tasks), any CRM call,
the frontend OSC profile screen (separate follow-up task once all backend sections exist).
