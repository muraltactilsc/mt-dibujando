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

## Current Task — osc-general-data-backend

Goal: `apps/api` exposes the OSC profile's **General Data** section — the parent entity every
other OSC-wizard section (InstitutionalBase/LegalBase/Government/Finance, all separate follow-up
tasks) attaches to — plus the shared read-only gate (`GetReadOnly.ReadOnly`) those sections will
all reuse. This is the FIRST backend slice of a larger area; do not build the other four sections
or any frontend screen in this task.

Context: legacy's `OSCController` is 993 lines covering both this General-Data section AND the
CRM-submission flow (`SendProfileToDynamics`, `UpdateOSCProfile`, `SendRegisterFullProcess`,
`GetOSCFeedbackClass`) — **the CRM parts are explicitly out of scope**, a separate future task.
This task only needs: `GetGeneralData`/`SaveGeneralData`/`ValidateGeneralData`,
`GetReadOnly.ReadOnly`, and `SendMessageRegister` (a pure read, described below — do NOT build
any CRM call to support it).

References (read before coding — point, not transcribed):

- `/home/angel/src/Dibujando (FDUM)/Dibujando 1.1/PortalDibujando/Controllers/OSCController.cs`
  — `GetGeneralData` (~line 122), `SaveGeneralData` (~line 260), `ValidateGeneralData` instance
  overload (~line 451), `SendMessageRegister` (~line 824, static — described exactly below).
- `.../PortalDibujando/Models/ViewModelRegisterOSC.cs` — `ViewModelGeneralData` (starts ~line 20) — exact fields + Spanish validation strings (FR-2 below).
- `.../PortalDibujando/Classes/GetReadOnly.cs` — `ReadOnly(int UserProfileId)` (~line 12-41):
  returns `true` only when `OSCProfile.DynamicsOSCStatusId` is `"206430000"` (Sent) or
  `"206430001"` (InReview); everything else (`null`, Approved `206430002`, NotApproved
  `206430003`, Expired `206430004`) is editable. Reproduce this exact rule.
- `.../PortalDibujando/Classes/GetOSCProfile.cs` (`GetOSC(int UserProfileId)`) — the shared
  "find this user's active OSCProfile row" lookup, reused by every section controller
  (including the four follow-up tasks) — build it as a genuinely shared helper now, not
  something each future task reimplements.
- `.claude/db-conversion/phase2/target/ddl/010_tables.sql` — sealed column defs to reuse
  verbatim: `oscprofile` (~line 733), and catalogs `state` (~line 950), `osctype` (~line 804),
  `actionline` (~line 1), `actionlinesecondary` (~line 15), `osctypeconstitution` (~line 818),
  `oscstatus` (~line 790). `country` already exists (Task 2, PR #10) — reuse it, don't recreate.
- `apps/api/src/modules/{auth,registration,catalogs}/` — existing 4-layer module shape and
  conventions to match. This task's business module is a natural new one: `osc` (the parent
  module the four follow-up section controllers will extend, per the tracker's framing of one
  composite OSC profile entity).

Key relationship to get right (do not simplify away): `OSCProfile.UserProfileId` is the durable
key (always present); `OSCProfileId` is nullable everywhere else and only exists once a user has
saved General Data at least once. A user CAN start filling other sections before an `OSCProfile`
row exists — this task's job is only to make that row creatable/fetchable; the "other sections
tolerate a not-yet-existing OSCProfile" logic belongs to each of those follow-up tasks, but they
all depend on `GetOSCProfile.GetOSC` existing here first.

Requirements:

- FR-1: Schema — new script `apps/api/db/scripts/003_osc_general_data.sql`: `oscprofile` +
  the 6 catalog tables listed above, column defs copied verbatim from the sealed DDL. FKs within
  this set only (e.g. `oscprofile.userprofileid → userprofile.userprofileid`,
  `oscprofile.countryid → country.countryid`, `state.countryid → country.countryid`) — no FKs to
  tables outside this set (e.g. no FK for `oscprofile.oscstatusid` if `oscstatus` weren't already
  included — it is, so that one FK IS in scope). Seed: a handful of representative rows per
  catalog (a few `osctype`, `actionline`, `actionlinesecondary`, `osctypeconstitution`, `oscstatus`
  rows, and a few `state` rows for the México `country` row already seeded in Task 2) — real
  production catalog content is a later data-migration concern, not this task's job (same status
  as the registration quiz's placeholder-then-corrected content — note clearly in `last-task.md`
  that this seed is representative, not production data). Regenerate `apps/api/db/types.ts` via
  `kysely-codegen` (established pattern, do not hand-write).
- FR-2: New `osc` module (`apps/api/src/modules/osc/`, same 4-layer shape as `auth`/
  `registration`). `GET /api/osc/general-data?userProfileId=<id>` — returns the section's fields
  (mapped from `oscprofile` if a row exists, else defaults sourced from the `userprofile` row per
  legacy: `name` ← `userprofile.institutionname`, `email` ← `userprofile.email`,
  `nationalRegistryNumber` ← `userprofile.nationalregistrynumber`, `countryId` ←
  `userprofile.countryid`) plus `readOnly: boolean` (FR-4) and the 6 catalog lists (or point the
  frontend at the existing `catalogs` module for those instead — your call, but don't duplicate
  catalog-serving logic in two places; extending the existing `catalogs` module with these 6 new
  read-only lists is the reuse-first option per house rules).
- FR-3: `POST /api/osc/general-data` — body validated by a new zod schema (add to
  `packages/shared`, e.g. `osc.schema.ts`) mirroring `ViewModelGeneralData`'s exact fields and
  Spanish messages: `name` required "El campo Nombre corto de la organización es requerido."
  (max 150) — reuse the `{0}`-template pattern's RESOLVED text, i.e. substitute the Display Name
  into the message yourself since there's no `{0}` templating in zod; do this for every field
  below the same way. `socialReason` required (max 150), `oscTypeId` required, `nationalRegistryNumber`
  required (max 25), `financeMinistryNumber` optional (max 30), `contactName` required (max 128),
  `contactPosition` required (max 60), `contactTelephone` optional (10-12 chars if present),
  `contactTelephoneExt` optional (max 10), `contactMobilePhone` optional (10-12 chars if present),
  `contactEmail` required + email format, `countryId` required, `stateId` required, `city`
  required (max 60), `postalCode` required, exactly 5 digits (legacy regex
  `^(?:0[0-9]\d{3}|[0-9]\d{4}|5[0-9]\d{3})$` — reproduce as a zod `.regex()`, exact pattern),
  `address` optional (max 128), `reference` optional, `actionLineId`/`actionLineSecondaryId`
  optional, `oscTypeConstitutionId` required. On save: upsert `oscprofile` keyed by
  `oscProfileId` if present (update) else insert a new row (`userprofileid` from the body,
  `statusid = 1`). After a successful save, compute `sendMessageRegister` (FR-5) and include a
  `needsResubmission: boolean` field in the response — the frontend (a later task) uses this to
  show the "you must re-submit to FDUM" banner; don't build the banner text/UI here, just the
  boolean signal.
- FR-4: `GetReadOnly.ReadOnly`-equivalent — a small pure function (in `osc`'s domain layer)
  taking the user's `oscprofile.dynamicsoscstatusid` and returning the exact boolean rule from
  the References section. Used by `GET /api/osc/general-data`'s `readOnly` field. `POST
/api/osc/general-data` must itself reject a write when read-only is true (a case legacy's own
  controller doesn't explicitly re-check server-side beyond the UI disabling fields — **this is a
  deliberate hardening, not a faithful-bug-port**: legacy trusts the client to not submit a
  disabled form; the rewrite enforces it server-side too) — `403 { error: { code:
'osc_profile_locked' } }` if so.
- FR-5: `sendMessageRegister`-equivalent — a pure function: given the user's
  `oscprofile.dynamicsoscstatusid`, return `true` if it's any of the 5 known CRM-lifecycle values
  (`206430000` Sent, `206430001` InReview, `206430002` Approved, `206430003` NotApproved,
  `206430004` Expired), else `false` (including when it's `null`, or when no `oscprofile` row
  exists at all). This is a **pure read of an existing column** — it does not call CRM, and
  nothing in this task writes `dynamicsoscstatusid` (that's the CRM-submission task's job,
  entirely out of scope here — for THIS task's seed/tests, a fixture row with
  `dynamicsoscstatusid = NULL` is sufficient; `needsResubmission` will simply be `false` until a
  later task's CRM flow ever sets that column).

Acceptance (Given-When-Then — checkable via `apps/api`'s validation gate):

- Given a `userprofile` row with no `oscprofile` yet, When
  `GET /api/osc/general-data?userProfileId=<id>` is called, Then it returns defaults sourced from
  `userprofile` (name/email/nationalRegistryNumber/countryId) with no `oscProfileId`, and
  `readOnly: false`.
- Given a valid, complete body, When `POST /api/osc/general-data` is called for a user with no
  existing `oscprofile`, Then it creates one and returns its new `oscProfileId`.
- Given that same user, When `POST /api/osc/general-data` is called again with an updated field
  and the returned `oscProfileId`, Then it updates the existing row (not a duplicate insert).
- Given a required field missing (e.g. `name` empty), When `POST /api/osc/general-data` is
  called, Then it returns a 400 with the exact matching Spanish message from FR-3.
- Given a `postalCode` that doesn't match the 5-digit pattern, When submitted, Then it returns
  the exact regex-failure message.
- Given an `oscprofile` row with `dynamicsoscstatusid = '206430000'` (Sent), When
  `GET /api/osc/general-data` is called for that user, Then `readOnly: true`; When
  `POST /api/osc/general-data` is called for that user, Then it returns
  `403 osc_profile_locked`.
- Given an `oscprofile` row with `dynamicsoscstatusid = '206430002'` (Approved), When
  `POST /api/osc/general-data` is called, Then it succeeds (Approved is NOT read-only) and
  `needsResubmission: true` in the response (Approved is one of the 5 "already submitted at
  least once" statuses).
- Given an `oscprofile` row with `dynamicsoscstatusid = NULL`, When saved, Then
  `needsResubmission: false`.

Out of scope: `InstitutionalBase`/`LegalBase`/`Government`/`Finance` (separate follow-up tasks,
each gets its own backend spec), any CRM call (`SendProfileToDynamics`, `UpdateOSCProfile`,
`SendRegisterFullProcess`, `GetOSCFeedbackClass` — a later CRM-integration task), the frontend OSC
profile screen (separate follow-up task once all backend sections exist), real catalog content
(placeholder/representative seed only, same status as prior placeholder-content tasks).
