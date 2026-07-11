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

## Current Task — task2-password-reset-backend

Goal: `apps/api` exposes the forgot/reset-password backend — faithfully reproducing
`AccountController.ForgotPassword`/`ResetPassword`'s behavior, with two deliberate security
fixes (named explicitly, not silent). Frontend screens are a separate, already-planned follow-up
(same backend-then-frontend split as PR #8→#9 and PR #10→#11).

References (read before coding — point, not transcribed):

- `/home/angel/src/Dibujando (FDUM)/Dibujando 1.1/PortalDibujando/Controllers/AccountController.cs`
  — `ForgotPassword` (GET+POST), `ResetPassword` (GET+POST) — already read in full for Task 2's
  research; re-read the POST bodies here for the exact field/message mapping in FR-2/FR-3.
- `.../PortalDibujando/Models/AccountViewModels.cs` (`ForgotPasswordViewModel`,
  `ResetPasswordViewModel`) — exact Spanish validation strings (FR-4).
- `apps/api/src/modules/auth/` (PRs #8, #10) — extend this module. Reuse the existing password
  hash/verify functions (`domain/identity-password-verifier.ts`), the existing JWT-signing
  pattern (`jose`, same as the registration token from PR #10), and role/session code where
  relevant. Do not duplicate the password-hashing format logic.
- `.claude/shared/docs/architecture/backend.md` — the planned `notifications/` module
  ("Microsoft Graph email — legacy: Postmark") this task creates for the first time.

Two deliberate fixes over legacy behavior — implement these, don't port the originals (record in
`last-task.md` as fixes, not silent changes):

- **User-enumeration leak in `ForgotPassword`**: legacy's own code comment says "Don't reveal
  that the user does not exist" but then DOES — showing a distinct "not associated with a user"
  error when the email isn't registered, letting anyone probe which emails have accounts. Fix:
  `POST /api/auth/forgot-password` always returns the same generic success response whether or
  not the email exists; only send the actual email when it does.
- **Unsigned, tamperable reset-link expiration**: legacy appends a plain, unsigned
  `createdDate` query parameter to the reset link and compares it to `DateTime.Now` — trivially
  forgeable to bypass the 24-hour window (already flagged in the tracker as a known weakness).
  Fix: use a single self-contained signed JWT (`jose`, same pattern as PR #10's registration
  token) as the entire reset "code" — no separate unsigned timestamp param at all. It embeds the
  user id and the user's CURRENT `securitystamp` at issuance, with a real 24-hour `exp` claim.
  Bonus property this reuses from PR #8's design: if the password changes via any other means
  before this token is used, the embedded stamp won't match anymore and the token is rejected —
  consistent with how refresh-token invalidation already works.

Requirements:

- FR-1: New `notifications` module (`apps/api/src/modules/notifications/`, 4-layer shape like
  `health`/`auth`) — a `NotificationsService.sendPasswordResetEmail(email, resetUrl,
institutionName)` method. **Stub the actual send for now** (no real Microsoft Graph credentials
  exist yet — per the project's standing rule, real Graph wiring happens at the infra phase):
  log the would-be email's recipient/subject/link at `info` level and return successfully. Shape
  the method as an injectable port so swapping in a real `@microsoft/microsoft-graph-client` call
  later is a drop-in, not a rewrite — but do NOT add the Graph SDK dependency in this task (not
  approved yet, nothing to call it for).
- FR-2: `POST /api/auth/forgot-password` — body `{ email }` (zod, new schema in
  `packages/shared`). Always responds `200 { success: true, data: {} }` regardless of whether the
  email matches a user (see the enumeration fix above). If it does match: generate the signed
  reset token described above, build a reset URL as
  `${APP_BASE_URL}/reset-password?code=<token>` (new env var `APP_BASE_URL`, default
  `http://localhost:8081` for dev — add to `.env.example`; production value is wired at the infra
  phase, same status as the Graph credentials), and call
  `notifications.sendPasswordResetEmail(...)`.
- FR-3: `GET /api/auth/reset-password/validate?code=<token>` — verifies the token (signature,
  `purpose: 'password_reset'`, not expired, embedded security stamp still matches the user's
  CURRENT `aspnetusers.securitystamp`). Returns `200 { success: true, data: { valid: boolean } }`
  either way (an invalid/expired code is an expected outcome the frontend renders as its own
  screen, not a 4xx error) — this lets the frontend show the "expired" state on page load, before
  the user types anything, matching legacy's GET-time check.
- FR-4: `POST /api/auth/reset-password` — body `{ code, email, password, confirmPassword }`.
  Validate in order (exact legacy Spanish strings, verbatim — note these are subtly different
  from Register's analogous messages in legacy itself, e.g. "no coinciden" here vs "de contraseña
  no coinciden" there — keep each screen's own wording, don't normalize):
  - Token invalid/expired/wrong purpose/stamp mismatch → `401 { error: { code:
'reset_token_expired' } }`.
  - No `aspnetusers` row for `email` → `400 { error: { code: 'user_not_found', message: 'El
correo electrónico no está asociado a un usuario o es incorrecto.' } }` (reuse the exact
    existing code/message from login — same string, same meaning).
  - `email`'s user id doesn't match the token's subject (code/email don't correspond to the same
    account) → `400 { error: { code: 'reset_mismatch', message: 'La solicitud para restablecer
contraseña no corresponde al correo ingresado.' } }`.
  - Password policy fails → `400 { error: { code: 'weak_password', message: 'La contraseña debe
tener al menos 6 caracteres; contener una mayúscula, un número y un carácter especial.' } }`
    (reuse the exact same code/message already used by `/api/auth/register`).
  - `password !== confirmPassword` → `400 { error: { code: 'password_mismatch', message: 'La
contraseña y la confirmación no coinciden.' } }` (note: this exact wording, not Register's).
  - All pass → hash the new password (reuse the existing hash function), update
    `aspnetusers.passwordhash`, **rotate `securitystamp`** to a fresh random value (invalidates
    other outstanding sessions/reset tokens, consistent with PR #8's existing design), return
    `200 { success: true, data: {} }`. Unlike `/api/auth/register`, do **not** auto-issue a new
    session here — legacy shows a confirmation screen with a manual link to Login, it does not
    sign the user in after a reset.
- FR-5: Add the new zod schemas (`ForgotPasswordBodySchema`, `ResetPasswordBodySchema`,
  `ResetPasswordValidateResponseSchema`) to `packages/shared` (new file
  `password-reset.schema.ts`, re-exported from `index.ts`, same pattern as `auth.schema.ts`/
  `registration.schema.ts`).

Acceptance (Given-When-Then — checkable via `apps/api`'s validation gate):

- Given a registered email, When `POST /api/auth/forgot-password` is called, Then it returns
  `200 { success: true }` and the notifications stub logs a reset link containing a real signed
  token.
- Given an unregistered email, When the same endpoint is called, Then it returns the exact same
  `200 { success: true }` shape (no way to distinguish the two cases from the response).
- Given a freshly issued reset token, When `GET /api/auth/reset-password/validate?code=...` is
  called, Then it returns `{ valid: true }`.
- Given a token whose user's `securitystamp` has since changed (simulate via a direct DB update,
  same technique used in PR #8's refresh-token test), When the same validate endpoint is called,
  Then it returns `{ valid: false }`.
- Given a valid token, the matching email, a policy-meeting password, and matching confirmation,
  When `POST /api/auth/reset-password` is called, Then it returns `200`, the user's
  `passwordhash` changes, `securitystamp` changes, and the OLD password no longer verifies via
  the existing password-verifier while the NEW one does.
- Given a valid token but a different (real, existing) email that doesn't match the token's
  subject, When the same endpoint is called, Then it returns `400 reset_mismatch`.
- Given an expired/invalid token, When the same endpoint is called, Then it returns
  `401 reset_token_expired`.
- Given mismatched password/confirmPassword, When the same endpoint is called, Then it returns
  `400 password_mismatch` with the reset-specific wording (not Register's).

Out of scope: the actual frontend screens (separate follow-up task), wiring a real Microsoft
Graph `sendMail` call (stub only — no credentials exist yet), the CRM-approval-promotion
sub-piece (separate, already-named blocker), any change to `apps/mobile`.
