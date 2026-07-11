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

## Current Task — task2-registration-backend

Goal: `apps/api` exposes the backend for self-registration — the pre-registration "human
verification" quiz (`QuestionController` in legacy) AND account creation (`AccountController.
Register`) — faithfully reproducing both, including the countries catalog the registration form
needs. Frontend (the actual screens) is a separate, already-planned follow-up task; this is
backend only, same pattern as PR #8 (auth core) → PR #9 (login screen).

Context you need that isn't obvious from a quick skim: in legacy, `GET /Account/Register` redirects
to `Question/Index` unless it's given a valid `TokenFiveMinutes` query value — you CANNOT reach
Register directly. `TokenFiveMinutes` is generated only after answering 3 pre-registration
"verification" questions correctly at `Question/ValidateQuestions`. Read the actual legacy source
before coding — this is genuinely two coupled backend capabilities, not a simple form.

References (read before coding — point, not transcribed):

- `/home/angel/src/Dibujando (FDUM)/Dibujando 1.1/PortalDibujando/Controllers/QuestionController.cs`
  — `Index` (list active questions), `ValidateQuestions` (POST body `List<int> ListAnswersInt`):
  null/empty → re-show with "No ha seleccionado ninguna respuesta."; count < 3 → re-show with
  "No ha respondido todas las preguntas."; any submitted answer id not among
  `Answer.IsCorrect == true` rows → **terminal rejection** (not "try again" — legacy renders a
  dead-end `QuestionFail` view offering only a link back to Login); all 3 correct → logs the
  attempt and redirects to Register with a fresh token.
- `.../PortalDibujando/Classes/QuestionsClass.cs` (`GetListQuestion`) — active questions
  ordered by `Order`, each with its active answers (id + text only — **never expose which
  answer is `IsCorrect`** to the client).
- `.../PortalDibujando/Utilities/Conversions.cs` (`TokenFiveMinutes`) — legacy's "token" is not
  a real security token, just the current time rounded to a 15-minute bucket as a string (same
  value for anyone hitting it in the same window — no real secrecy). **Deliberate improvement,
  not a faithful port**: replace this with a real short-lived signed token (reuse `jose`, ~5
  minute expiry, matches the legacy UX copy "La creación de cuenta caducará en 5 minutos.") —
  same user-visible behavior (quiz-pass grants a short window to complete registration, then
  expires), a real mechanism instead of a guessable one. Log this as a fix, not silently kept.
- `.../PortalDibujando/Controllers/AccountController.cs`'s `Register` (both GET and POST
  overloads, already read in full for the login-screen task, re-read the POST body here) —
  field set, duplicate-`NationalRegistryNumber` check (scoped to `StatusId == Active` profiles),
  auto-assigns the `OSCNotApproved` role, creates the `UserProfile` row, and **signs the user in
  immediately on success** (no separate login step after registering).
- `.../PortalDibujando/Models/AccountViewModels.cs` (`RegisterViewModel`) — exact Spanish
  validation strings (FR-4 below) and the field list: `Email`, `Password`, `ConfirmPassword`,
  `InstitutionName`, `NationalRegistryNumber` (max 25 chars), `CountryId`.
- `.claude/db-conversion/phase2/target/ddl/010_tables.sql` — sealed, verified column defs to
  reuse verbatim (same pattern as PR #8): `question` (~line 924), `answer` (~line 135),
  `logtriedquestions` (~line 671), `country` (~line 272).
- `apps/api/src/modules/auth/` (PR #8) — extend this module for `Register`; reuse its existing
  password-hashing code (add a **hash** function alongside the existing **verify** function in
  `domain/identity-password-verifier.ts` — same PBKDF2/HMAC-SHA1/1000-iterations/16-byte-salt/
  32-byte-subkey format, do not duplicate the format logic) and its existing session-issuance
  logic (successful registration returns the exact same `AuthSessionData` shape `/login` does —
  reuse that code path, don't reimplement it).
- `apps/api/src/shared/` (PR #8's `JwtAuthGuard`/`roles.guard.ts` pattern) and
  `packages/shared/src/auth.schema.ts` (existing `LoginBodySchema`/`AuthSessionData`/`AuthUser`
  — add new schemas here for registration, following the same file/pattern).

Requirements:

- FR-1: Schema — add to `apps/api/db/scripts/` (a new numbered script, e.g. `002_registration_
core.sql`) the 4 tables above, column defs copied verbatim from the sealed DDL, each with its
  own PK. No FKs to tables outside the existing set except `answer.questionid → question.
questionid` (both are in this same script). Seed a representative fixture set (this is
  bot-deterrence UI copy, not identity-critical data — realistic placeholder content is fine,
  note that real production question/answer/country content is a later data-migration concern,
  not this task's job): 3 active `question` rows (`order` 1-3), 3-4 `answer` rows per question
  with exactly one `iscorrect = true` per question, and ~5 `country` rows (include Mexico).
  Regenerate `apps/api/db/types.ts` via `kysely-codegen` after applying (per PR #8's established
  pattern) — do not hand-write it.
- FR-2: New `registration` module (`apps/api/src/modules/registration/`, same 4-layer shape as
  `health`/`auth`): `GET /api/registration/questions` — returns the active questions (ordered)
  with their active answers, **id + text only, never the `iscorrect` flag**.
- FR-3: `POST /api/registration/validate-answers` — body `{ answerIds: number[] }` (exactly 3
  expected — one per question, matching the 3-question fixture). Logs every attempt to
  `logtriedquestions` (`iscorrect`, `iptried` from the request's IP, `datetimetried`/
  `datetimecreate` = now) regardless of outcome, matching legacy's `LogTriedQuestionaireClass.
CreateLog`. Three distinct outcomes (do not collapse them — they're genuinely different UX in
  legacy, see the QuestionController reference above):
  - Fewer than 3 answer ids submitted → `400 { error: { code: 'incomplete_answers' } }` (the
    frontend's own UI should prevent this in practice — this is a defensive backend check, not
    the primary UX gate).
  - 3 submitted but at least one doesn't match an `iscorrect = true` answer row → `200
{ success: true, data: { passed: false } }` — a normal successful response signaling
    **terminal rejection**, not a client error (this is a deliberate business outcome the frontend
    renders as its own dead-end screen, not an error banner — mirrors legacy's non-retryable
    `QuestionFail` view).
  - All 3 correct → `200 { success: true, data: { passed: true, registrationToken } }` — a
    `jose`-signed JWT, 5-minute expiry, a `purpose: 'register'` claim (so it can't be reused as
    any other kind of token), no other payload needed.
- FR-4: `POST /api/auth/register` (extends the existing `auth` module) — body: `email`,
  `password`, `confirmPassword`, `institutionName`, `nationalRegistryNumber`, `countryId`,
  `registrationToken`. Validate, in order:
  - `registrationToken` missing/expired/wrong `purpose` → `401 { error: { code:
'registration_token_expired', message: 'Lo sentimos la creación de cuenta expiró, vuelve a
realizar el pre-registro.' } }` (exact legacy copy from `Question/IndexTimeOut`).
  - Password policy (min 6, upper+lower+digit+non-alphanumeric — same policy as login's existing
    `IdentityConfig.cs` reference) fails → `400 { error: { code: 'weak_password', message: 'La
contraseña debe tener al menos 6 caracteres; contener una mayúscula, un número y un carácter
especial.' } }` (exact legacy string).
  - `password !== confirmPassword` → `400 { error: { code: 'password_mismatch', message: 'La
contraseña y la confirmación de contraseña no coinciden.' } }` (exact legacy string).
  - Email already registered (an `aspnetusers` row with that `username`/`email` already exists)
    → `409 { error: { code: 'email_taken', message: 'El correo electrónico ya existe.' } }`.
  - A `userprofile` with the same `nationalregistrynumber` AND `statusid = 1` (Active) already
    exists → `409 { error: { code: 'duplicate_registry_number', message: 'Ya existe una OSC
registrada con ese RFC o número de registro nacional.' } }` (exact legacy string).
  - All pass → create the `aspnetusers` row (new id, `username`/`email` = the given email,
    `passwordhash` via the new hash function, `securitystamp` = a fresh random value,
    `emailconfirmed = false`, `lockoutenabled = true`, `accessfailedcount = 0`,
    `twofactorenabled = false`, `phonenumberconfirmed = false`), assign the `OSCNotApproved` role
    (`aspnetuserroles` — look up the role id from `aspnetroles` by name, don't hardcode the guid),
    create the `userprofile` row (`email`, `institutionname`/`fullinstitutionname` = the given
    institution name for both — matches legacy's `String.Format("{0}", ...)` no-op formatting,
    `internalid` = the user's id, `countryid`, `nationalregistrynumber`, `statusid = 1`,
    `usercreateid = '1'`, `datetimecreate = now()`), then **sign the new user in immediately** —
    return the exact same `200 { success: true, data: <AuthSessionData> }` shape `/login` returns
    (reuse that session-issuance code path from PR #8, don't reimplement token issuance).
- FR-5: New lightweight `catalogs` module (`apps/api/src/modules/catalogs/`) —
  `GET /api/catalogs/countries` — active countries (`statusid = 1`), `{ countryId, name }[]`,
  ordered by name. (Small enough it doesn't need the full domain/application/infrastructure/
  presentation split if it's under the line budget with just presentation+infrastructure — your
  call per the file-size budget in `coding-standards.md`.)
- FR-6: Add the new zod schemas to `packages/shared/src/auth.schema.ts` (or a new
  `registration.schema.ts` alongside it, re-exported from `packages/shared/src/index.ts` the same
  way `auth.schema.ts` already is) for: the questions list response, the validate-answers
  request/response, the register request, and the countries list response.

Acceptance (Given-When-Then — checkable via `apps/api`'s validation gate, curl/Vitest against
real seeded rows):

- Given the seeded fixture questions, When `GET /api/registration/questions` is called, Then it
  returns 3 questions with their answers, and no response field reveals which answer is correct.
- Given the 3 correct answer ids, When `POST /api/registration/validate-answers` is called, Then
  it returns `data.passed === true` and a non-empty `registrationToken`.
- Given at least one wrong answer id (but 3 submitted), When the same endpoint is called, Then it
  returns `200` with `data.passed === false` (not a 4xx) — and a row is added to
  `logtriedquestions` with `iscorrect = false`.
- Given fewer than 3 answer ids, When the same endpoint is called, Then it returns `400
incomplete_answers`.
- Given a valid `registrationToken` and all-valid fields, When `POST /api/auth/register` is
  called, Then it returns `200` with the same shape `/login` returns, a new `aspnetusers` row
  exists with role `OSCNotApproved`, and a new `userprofile` row exists with the given data.
- Given an expired or missing `registrationToken`, When `POST /api/auth/register` is called, Then
  it returns `401 registration_token_expired` with the exact legacy message.
- Given a `nationalRegistryNumber` that already belongs to an active `userprofile`, When
  `POST /api/auth/register` is called (with an otherwise-valid token/fields), Then it returns
  `409 duplicate_registry_number`.
- Given an email that already has an `aspnetusers` row, When the same endpoint is called, Then it
  returns `409 email_taken`.
- Given active countries seeded, When `GET /api/catalogs/countries` is called, Then it returns
  them ordered by name.

Out of scope: the actual Question/Register frontend screens (separate, already-planned follow-up
task), the CRM push (`OSCController.SendDataToDynamics` — that's the OSC-registration-wizard task,
not self-registration), email confirmation flow (legacy has commented-out
`SendEmailAsync`/`GenerateEmailConfirmationTokenAsync` — dead code, don't build it), any change to
`apps/mobile`.
