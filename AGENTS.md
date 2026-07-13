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

## Current Task — osc-government-backend

Goal: `apps/api` exposes the OSC profile's **Government** section (legacy: `GovermentController`
— note the legacy typo in the controller/route name; model it as `government` in the new code,
same decision already made for the Postgres table). One main profile row (contact names/emails
for 4 required + 1 optional governance roles, member count) plus a repeatable "Patronato o
Consejo" (governing body) child list. Third of four OSC-wizard sections — same established
pattern as LegalBase/InstitutionalBase (PRs #16/#17, merged): reuse the shared read-only gate,
the `UserProfileId`/`OSCProfileId` fallback lookup, `needsResubmission`, and — the standing lesson
from this whole feature area — schema scripts stay DDL-only, seeds run in filename order, verify
against a genuinely fresh database (not the shared/reused dev Postgres volume) before calling
this done.

References (read before coding — point, not transcribed):

- `/home/angel/src/Dibujando (FDUM)/Dibujando 1.1/PortalDibujando/Controllers/
GovermentController.cs` (727 lines, full file) — `GetGoverment` (~line 16), `SaveGovernment`
  (~line 206, already read in full for this spec — the repeatable-row validation shape below is
  confirmed directly from this method, not just summarized), `DisableGoverningBody` (~line
  625), `ValidateModelGovernment` (~line 677, static).
- `.../PortalDibujando/Models/ViewModelGovernment.cs` — exact Spanish validation strings
  (FR-3/FR-4 below).
- `.claude/db-conversion/phase2/target/ddl/010_tables.sql` — sealed column defs, verbatim:
  `government`, `governingbody`.
- `apps/api/src/modules/legal-base/` and `apps/api/src/modules/institutional-base/` (PRs
  #16/#17) — the established 4-layer pattern, fallback-lookup, and
  `apps/api/src/shared/osc-profile-lock.ts` reuse. `institutional-base`'s
  `institutional-base.validator.ts` is the closest sibling for the repeatable-row
  drop-empty-or-error-partial pattern used below for `governingBody[]` — follow its shape.

Two legacy quirks to normalize, not port literally (both already flagged in prior research,
confirmed again reading the controller directly):

- `IsMemberOfOtherBody` is transmitted/stored in legacy as the STRING `"true"`/`"false"` (a
  workaround for an old dropdown binding, explicit code comment "no encontré otra opción mas
  que usar strings"). The underlying DB column is a real `boolean`. Use a proper `boolean` in
  the API request/response and in the zod schema — there's no fidelity reason to reproduce the
  string workaround, only the underlying data type matters.
- `RFC`'s `[RegularExpression]` validation was explicitly removed in legacy ("Se solicito quitar
  esta validación el 09-23-2020") — do not add a format regex for `RFC`, just presence
  (conditionally required, see FR-4).

Requirements:

- FR-1: Schema — new script `apps/api/db/scripts/007_osc_government.sql`: `government` +
  `governingbody`, column defs copied verbatim from the sealed DDL. FKs:
  `government.userprofileid → userprofile.userprofileid`, `.oscprofileid → oscprofile.oscprofileid`
  (nullable), `governingbody.governmentid → government.governmentid`. DDL only — no data
  INSERTs. Regenerate the Kysely types the same way the last two tasks did (split-file structure
  under `apps/api/db/types/` — add a `government.types.ts`, follow the documented regeneration
  workflow from PR #17, don't reintroduce a monolithic file).
- FR-2: A fixture in `apps/api/db/seeds/005_osc_government_fixture.sql` (runs after
  `001_auth_fixture.sql`, whose `userprofileid = 1` it references) — one `government` row for the
  fixture user plus 2 `governingbody` rows (at least one with `ismemberofotherbody = true` and
  its `memberofotherbody` field filled, to exercise that conditional branch in acceptance tests).
- FR-3: New `government` module (`apps/api/src/modules/government/`, 4-layer shape).
  `GET /api/osc/government?userProfileId=<id>&oscProfileId=<id?>` — same fallback-lookup pattern
  as LegalBase/InstitutionalBase. Response: main fields (or defaults if no row yet), the
  `governingBody[]` list, `isMexico: boolean` (same computation as LegalBase — query the `country`
  table for the row named exactly `"México"`, compare to the user's `countryId` — reuse
  `GetIdMx`-equivalent logic if LegalBase already extracted it into a shared helper; if not,
  extract it now into `apps/api/src/shared/` since this is the second module that needs it),
  `readOnly: boolean`.
- FR-4: `POST /api/osc/government` — body zod schema (new, in `packages/shared`, e.g.
  `government.schema.ts`) with these exact resolved Spanish messages:
  - `presidencyName` required (max 128) "El campo Nombre del Presidente de la organización es
    requerido."
  - `presidencyEmail` required + email format "El campo Correo Electrónico del Presidente de la
    organización es requerido." (max 128)
  - `legalRepresentativeName` required (max 128) "El campo Representante Legal es requerido."
  - `legalRepresentativeEmail` required + email format — legacy's own message here is
    grammatically incomplete ("El campo Correo Electrónico de Representante Legal.", missing
    "es requerido" at the end — a real legacy copy bug). **Fix it, don't port the broken
    grammar**: use "El campo Correo Electrónico de Representante Legal es requerido." (max 128)
  - `executiveGeneralManagementName` required (max 128) "El campo Dirección General/Ejecutiva es
    requerido."
  - `executiveGeneralManagementEmail` required + email format "El campo Correo Electrónico de la
    Dirección General/Ejecutiva es requerido." (max 128)
  - `programAndProjectOperationName` required (max 128) "El campo Responsable de operación de
    programas y proyectos es requerido."
  - `programAndProjectOperationEmail` required + email format "El campo Correo Electrónico del
    Responsable de operación de programas y proyectos es requerido." (max 128)
  - `institutionalDevelopmentName`/`institutionalDevelopmentEmail` — both OPTIONAL (no
    `[Required]` in legacy either), email-format-if-present, max 128 each.
  - `numberOfMembers` (int) required "El campo ¿Cuántos miembros tiene su Patronato o Consejo? es
    requerido.", max 7 digits (0–9999999) "...debe tener como máximo 7 dígitos"
  - `governingBody[]`: list-level required "Se requiere ingresar al menos un miembro de su
    Patronato o Consejo." (no trailing period, matches legacy exactly). Each row:
    `name` (max 120), `position` (max 128), `memberSince` (int), `isMemberOfOtherBody` (boolean,
    NOT the legacy string — see the quirk note above), `memberOfOtherBody` (string, max 128,
    optional at the schema level), `rfc` (string, optional at the schema level, no format
    validation per the quirk note above).
- FR-5: Repeatable-row validation for `governingBody[]` (confirmed directly from
  `SaveGovernment`, not just summarized — follow this exactly): for each row, check
  `name`/`position`/`memberSince`/`isMemberOfOtherBody` (and `rfc` — see FR-6) presence. If ALL of
  a row's checked fields are missing AND its id is `0`/absent (new/unsaved) → silently drop it
  from the list. If SOME are missing → `400` with the exact per-field messages: "El campo Nombre
  del miembro es requerido." / "El campo Cargo del miembro es requerido." / "El campo Miembro
  desde es requerido." / "Se requiere seleccionar una opción del campo ¿Participa como miembro de
  otro órgano de gobierno en otra organización de la sociedad civil?." (this exact wording — note
  it's NOT quite the same as the ViewModel's Display Name text, copy this literal controller
  string, not the Display attribute's). After dropping empty rows, if the list is empty → `400`
  with "Se requiere ingresar al menos un miembro de su Patronato o Consejo."
- FR-6: Two conditional requirements within each `governingBody[]` row (service-layer, not a
  static zod rule):
  - `rfc` is required ONLY when the OSC `isMexico` — same rule shape as LegalBase's
    `lastProtocolizationDate`. Missing when required → "El campo RFC es requerido."
  - `memberOfOtherBody` is required ONLY when that same row's `isMemberOfOtherBody === true` —
    this one CAN live in a zod `.superRefine` since it's a same-object conditional (unlike the
    Mexico check, which needs a DB lookup). Missing when required → "El campo En caso de
    participar en otro órgano de gobierno de otra organización, escriba el nombre de la OSC y el
    cargo que desempeña en dicha institución es requerido."
- FR-7: `POST /api/osc/government/governing-body/:id/disable` — soft-delete (`statusid = 2`) a
  single `governingbody` row, fetched by id first (legacy's `DisableGoverningBody` is correctly
  implemented — replicate the correct pattern, not any bug; there is no known bug in this
  particular action, unlike `FinanceController.DisableDonation`).
- FR-8: Upsert semantics matching LegalBase/InstitutionalBase: `government` upserted by
  `governmentId` if present else inserted (backfilling `oscprofileid` from the user's existing
  OSCProfile if any); `governingBody[]` fully replaced on each save (delete rows for this
  `governmentId` not present in the incoming list, upsert the rest).
- FR-9: Reuse `isOSCProfileReadOnly`/`needsResubmission` from `apps/api/src/shared/
osc-profile-lock.ts` exactly as the prior two sections do — `403 osc_profile_locked` on a
  locked profile's `POST`, `needsResubmission` in every successful save response.

Acceptance (Given-When-Then — checkable via `apps/api`'s validation gate, verified against a
GENUINELY FRESH database, same standing requirement as the last 3 tasks in this area):

- Given a fresh database, When the API boots, Then `initializeSchema()` + the full seed sequence
  complete with no errors.
- Given the fixture user, When `GET /api/osc/government?userProfileId=1` is called, Then it
  returns the seeded main fields and 2 `governingBody` rows.
- Given a complete, valid body, When `POST /api/osc/government` is called, Then it upserts
  correctly and returns `needsResubmission`.
- Given a `governingBody` row with only `name` filled (others empty) and a nonzero id, When
  posted, Then it returns `400` with the specific missing-field messages (not silently dropped —
  dropping only applies to NEW/unsaved rows).
- Given a fully-empty new `governingBody` row (id `0`) alongside other complete rows, When
  posted, Then it's silently dropped, no error.
- Given a Mexican OSC (per the seeded fixture's country) and a `governingBody` row with `rfc`
  omitted, When posted, Then it returns `400` with "El campo RFC es requerido."
- Given a non-Mexican OSC and the same row, When posted, Then it succeeds (RFC not required).
- Given `isMemberOfOtherBody: true` and `memberOfOtherBody` omitted, When posted, Then it returns
  the matching validation error.
- Given all `governingBody` rows removed, When posted, Then it returns `400` with "Se requiere
  ingresar al menos un miembro de su Patronato o Consejo."
- Given a read-only OSC profile, When `POST /api/osc/government` is called, Then it returns
  `403 osc_profile_locked`.
- Given a disable call on an existing `governingBody` row, When
  `POST .../governing-body/:id/disable` is called, Then its `statusid` becomes `2` and it no
  longer appears in a subsequent `GET`.

Out of scope: `Finance` (separate, final follow-up task in this area), any CRM call, the frontend
OSC profile screen (separate follow-up task once all backend sections exist).
