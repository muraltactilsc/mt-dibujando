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

## Current Task — task2-password-reset-frontend

Goal: `apps/mobile` gets the forgot/reset-password screens, wired to the already-built backend
from PR #13 (`POST /api/auth/forgot-password`, `GET /api/auth/reset-password/validate`,
`POST /api/auth/reset-password`). This is the last piece of Task 2 (auth reconstruction) — same
backend-then-frontend split already used twice (PR #8→#9, PR #10→#11).

The existing `LoginScreen`'s "Restablecer contraseña" link (merged in PR #9) already points at
`/(auth)/forgot-password` — that route just doesn't exist yet. Do not change the link.

References (read before coding — point, not transcribed):

- `/home/angel/src/Dibujando (FDUM)/Dibujando 1.1/PortalDibujando/Views/Account/
ForgotPassword.cshtml` — title "Restablecer contraseña", one email field (placeholder "Correo
  electrónico"), submit button "Enviar".
- `.../Views/Account/ForgotPasswordConfirmation.cshtml` — static screen: "Por favor revisa tu
  correo electrónico para restablecer tu contraseña." + a "Iniciar Sesión" button → `/login`.
- `.../Views/Account/ResetPassword.cshtml` — title "Restablecer contraseña", fields: email
  (placeholder "Correo electrónico" — the user re-enters it; the reset link's `code` is NOT
  itself tied to an email in the URL, so legacy requires typing it again), password (placeholder
  "Contraseña"), confirm password (placeholder "Confirmación de Contraseña"), submit button
  "Restablecer Contraseña".
- `.../Views/Account/ResetPasswordConfirmation.cshtml` — static: "Tu contraseña ha sido
  restablecida." + "Iniciar Sesión" button → `/login`.
- `.../Views/Account/InvalidResetPassword.cshtml` — static: heading "OOOPS!", body "El link
  para restablecer contraseña ha expirado. Da clic en el enlace aquí abajo para recibir un
  nuevo link.", button "Restablecer contraseña" → `/(auth)/forgot-password`.
- `.../Models/AccountViewModels.cs` (`ForgotPasswordViewModel`, `ResetPasswordViewModel`) —
  exact Spanish validation strings (FR-2/FR-3 below) — note Reset's confirm-password mismatch
  wording ("La contraseña y la confirmación no coinciden.") is subtly different from Register's
  ("...de contraseña no coinciden.") — keep each screen's own exact wording, already matched on
  the backend side in PR #13; don't normalize them to be the same.
- `packages/shared/src/password-reset.schema.ts` (PR #13) — `ForgotPasswordBodySchema`,
  `ResetPasswordBodySchema`, `ResetPasswordValidateResponseSchema`. Import, don't redeclare.
- `apps/api/src/modules/auth/presentation/auth.controller.ts` (PR #13) — the 3 real endpoints:
  `POST /api/auth/forgot-password`, `GET /api/auth/reset-password/validate?code=...`,
  `POST /api/auth/reset-password`.
- `apps/mobile/src/features/account/{LoginScreen,RegisterScreen}.tsx`,
  `src/components/{FormErrorBanner,FormTextField}.tsx` (PRs #9/#11) — reuse these established
  patterns (react-hook-form + zodResolver against the shared-package schema, the shared error
  banner, the shared text field) rather than inventing new ones.

Requirements:

- FR-1: `src/features/account/ForgotPasswordScreen.tsx` — one email field + "Enviar" button,
  `react-hook-form` + `zodResolver(ForgotPasswordBodySchema)`. Client validation: email required
  → "El correo electrónico es requerido.", malformed → "El Correo electrónico no es una dirección
  de correo válida." (same strings already used on Login/Register). On submit,
  `POST /api/auth/forgot-password` — since the backend always returns the same generic success
  (per PR #13's deliberate anti-enumeration fix), always navigate to
  `/(auth)/forgot-password-confirmation` on a `200`, regardless of whether the email existed —
  do not add any client-side "email not found" branch, there isn't one.
- FR-2: `src/features/account/ForgotPasswordConfirmationScreen.tsx` — static, the exact legacy
  copy ("Por favor revisa tu correo electrónico para restablecer tu contraseña.") + a button to
  `/login`.
- FR-3: `src/features/account/ResetPasswordScreen.tsx` — reads `code` from the route's query
  params (Expo Router `useLocalSearchParams`). On mount, call
  `GET /api/auth/reset-password/validate?code=<code>`:
  - No `code` param at all, or `data.valid === false` → render (or redirect to) the
    `InvalidResetPasswordScreen` (FR-5) — don't show the form.
  - `data.valid === true` → render the form: email, password, confirm-password fields (the
    `code` travels along invisibly, not user-editable — matches legacy's hidden field), submit
    button "Restablecer Contraseña". `react-hook-form` + `zodResolver` against
    `ResetPasswordBodySchema` extended client-side with a `.refine` for
    `password === confirmPassword` (message: "La contraseña y la confirmación no coinciden." —
    the RESET-specific wording, not Register's). Client validation messages: email required/
    malformed (same as FR-1), password required "La contraseña es requerida.", password too short
    "La contraseña debe tener al menos 6 caracteres; contener una mayúscula, un número y un
    carácter especial." (same policy message used elsewhere), confirm-password required "La
    confirmación de contraseña es requerida.". On submit, `POST /api/auth/reset-password` with
    `{ code, email, password, confirmPassword }`:
    - `200` → navigate to `/(auth)/reset-password-confirmation`.
    - `401 reset_token_expired` → navigate to `/(auth)/invalid-reset-password`.
    - `400 user_not_found` / `400 reset_mismatch` / `400 weak_password` → show the server's exact
      `error.message` in the shared error banner (already Spanish, no client re-translation),
      stay on the form.
- FR-4: `src/features/account/ResetPasswordConfirmationScreen.tsx` — static: "Tu contraseña ha
  sido restablecida." + a button to `/login`.
- FR-5: `src/features/account/InvalidResetPasswordScreen.tsx` — static: heading "OOOPS!", body
  "El link para restablecer contraseña ha expirado. Da clic en el enlace aquí abajo para recibir
  un nuevo link.", button labeled "Restablecer contraseña" → `/(auth)/forgot-password`.
- FR-6: Routes (all under the existing `app/(auth)/` group): `forgot-password.tsx`,
  `forgot-password-confirmation.tsx`, `reset-password.tsx` (must accept a `code` query param,
  e.g. `dibujando:///reset-password?code=...` / `http://localhost:8081/reset-password?code=...`
  on web — this is the deep-link the email points at), `reset-password-confirmation.tsx`,
  `invalid-reset-password.tsx`.
- FR-7: `src/api/password-reset.api.ts` + `.queries.ts` — thin calls (forgot-password mutation,
  reset-password-validate query, reset-password mutation), same pattern as `auth.api.ts`. All
  through the existing authenticated client (these 3 endpoints don't need a bearer token, but
  still go through `src/api/client.ts` — no raw `fetch`).

Acceptance (Given-When-Then — checkable via the frontend validation gate:
`dev-up.sh --web`, seeded fixture user `qa.auth@dibujando.test`):

- Given the seeded fixture email, When submitted on `/(auth)/forgot-password`, Then the app
  navigates to `/(auth)/forgot-password-confirmation` and the API log shows a real signed reset
  link was generated (check the API's stdout/log for the notifications-stub line).
- Given a non-existent email, When submitted on the same screen, Then the app navigates to the
  SAME confirmation screen (no way to tell the difference — proving the anti-enumeration fix
  holds all the way through the UI).
- Given a reset link's `code` extracted from the API log (or captured via a direct
  `POST /api/auth/forgot-password` + `GET .../validate` round trip in a test), When
  `/(auth)/reset-password?code=<that code>` loads, Then the form renders (not the invalid screen).
- Given no `code` query param, When `/(auth)/reset-password` loads directly, Then it shows the
  invalid/expired screen, not a broken or blank form.
- Given a valid code, the fixture's email, and a new policy-meeting password entered twice
  correctly, When "Restablecer Contraseña" is submitted, Then the app navigates to
  `/(auth)/reset-password-confirmation`, and logging in afterward at `/login` with the OLD
  password fails while the NEW password succeeds.
- Given mismatched new/confirm passwords, When submitted, Then "La contraseña y la confirmación
  no coinciden." shows without a network call.
- Screenshot comparison (per the standing verify-against-original rule): capture legacy's 5
  screens with `--public` (`/Account/ForgotPassword`, `/Account/ForgotPasswordConfirmation`,
  `/Account/ResetPasswordConfirmation`, `/Account/InvalidResetPassword` — `/Account/ResetPassword`
  needs a `code`/`createdDate` query pair to render its form instead of redirecting, so just note
  if that one falls back to a redirect rather than treating it as a failure, same as PR #11 did
  for `/Account/Register`) against the 5 new screens.

Out of scope: actually wiring a real Microsoft Graph email send (still stubbed per PR #13 —
that's an infra-phase task), the CRM-approval-promotion sub-piece (separate, already-named
blocker), any change to `apps/api` (backend is done, PR #13) or to already-merged screens.
