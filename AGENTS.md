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

## Current Task — task2-registration-frontend

Goal: `apps/mobile` gets the two screens that complete self-registration — the pre-registration
"verification" quiz (legacy: `QuestionController`/`Views/Question/*`) and the account-creation
form (legacy: `AccountController.Register`/`Views/Account/Register.cshtml`) — wired to the
already-built backend from PR #10 (`GET /api/registration/questions`,
`POST /api/registration/validate-answers`, `POST /api/auth/register`,
`GET /api/catalogs/countries`). This is the frontend half of the pattern already used for auth
(PR #8 backend → PR #9 frontend); same split here (PR #10 backend → this task, frontend).

Faithful-flow note (read this before wiring routes): in legacy, `Register` is NOT directly
reachable — hitting it without a valid quiz-pass token redirects to the quiz
(`Question/Index`); only passing the quiz grants a short-lived window to actually register. The
existing Login screen's "Regístrate" button (already merged in PR #9) already links to
`/(auth)/register` — **do not change that link**. Instead, make the `register` route itself
redirect to the quiz when there's no valid unexpired registration token, exactly mirroring
legacy's own gate. This keeps PR #9 untouched.

References (read before coding — point, not transcribed):

- `/home/angel/src/Dibujando (FDUM)/Dibujando 1.1/PortalDibujando/Views/Question/Index.cshtml`
  — title "Pre-Registro", one block per question (required-asterisk + question text), answers
  rendered as a single-select group per question (legacy fakes a radio group with checkboxes +
  JS; just use a real radio group here — same observable behavior: exactly one answer per
  question). Submit button "Aceptar", **disabled until all 3 questions have a selection**
  (see `Content/Custom/js/Question/ScriptView.js` for the exact enable/disable rule you're
  reproducing).
- `.../PortalDibujando/Views/Question/QuestionFail.cshtml` — the terminal rejection screen's
  exact copy (reproduce verbatim, it's real user-facing content, not a placeholder):
  title "Estimado participante:", body paragraph: "Agradecemos su tiempo e interés en nuestra
  organización. Fundación Dibujando un Mañana, A.C. tiene como propósito contribuir a que las
  niñas, niños, adolescentes y jóvenes en situación vulnerable ejerzan sus derechos para mejorar
  su calidad de vida. Esto lo hacemos a través de la profesionalización continua de
  organizaciones de la sociedad civil, para que estas sean más eficaces y sostenibles en el
  tiempo. Detectamos en su registro que no cuenta con los requisitos mínimos necesarios que
  Fundación Dibujando un Mañana solicita a las organizaciones para poder desarrollar una alianza
  entre nuestras organizaciones.", then a line inviting them to the org's FAQ page (a real
  external link, `https://dibujando.org.mx/osc/` — link text "Preguntas Frecuentes"), and one
  button, "Iniciar Sesión", going to `/login`. No retry link back to the quiz — this is a
  dead end by design.
- `.../PortalDibujando/Views/Account/Register.cshtml` — title "Creación de cuenta", a warning
  line in red "La creación de cuenta caducará en 5 minutos." (matches the backend's real 5-min
  token expiry from PR #10), fields in this order: `InstitutionName` ("Nombre corto de la
  organización"), `NationalRegistryNumber` ("RFC o Número de Registro Nacional"), `CountryId`
  (a select, placeholder "Selecciona un país", populated from `GET /api/catalogs/countries`),
  `Email` ("Correo electrónico"), `Password` ("Contraseña" — legacy shows a helper tooltip with
  the password policy text, reproduce as helper/caption text, not a hidden tooltip), and
  `ConfirmPassword` ("Confirmar contraseña"). Submit button "Crear Cuenta".
- `.../PortalDibujando/Models/AccountViewModels.cs` (`RegisterViewModel`) — exact Spanish
  client-validation strings (FR-3 below).
- `apps/mobile/src/features/account/LoginScreen.tsx` + `src/auth/` (PR #9) — the established
  patterns to reuse: react-hook-form + zodResolver against a shared-package schema, the single
  error-banner treatment, the session store's `login`-equivalent token-storage call (register's
  success response is the exact same `AuthSessionData` shape login's is — treat it identically:
  store tokens, navigate to `/`).
- `packages/shared/src/registration.schema.ts` (PR #10) — `QuestionSchema`/`AnswerSchema`,
  `ValidateAnswersBodySchema`/`ValidateAnswersResponseSchema` (a discriminated union on
  `passed`), `RegisterBodySchema`, `CountrySchema`. Import these, don't redeclare.
- `apps/api/src/modules/{registration,catalogs}/` (PR #10) — the 3 real endpoints' exact
  request/response shapes; the seeded fixture (for manual/smoke verification): 3 questions in
  order — "¿Cuál es la capital de México?" (correct answerId `1`, "Ciudad de México"),
  "¿Cuántos días tiene un año bisiesto?" (correct answerId `6`, "366"), "¿Qué color resulta de
  mezclar azul y amarillo?" (correct answerId `10`, "Verde") — and 5 seeded countries including
  "México".

Requirements:

- FR-1: A small client-only holder for the registration token between the two screens — a
  Zustand store in `src/state/useRegistrationStore.ts` (this is ephemeral client/UI state, not a
  session concern, so `state/` not `auth/`): `{ registrationToken: string | null, expiresAt:
number | null }` + `setToken(token, expiresAt)` + `clear()`. Not persisted (no
  `expo-secure-store`/`AsyncStorage`) — it only needs to survive the in-app navigation between
  the quiz and the register screen.
- FR-2: `src/features/account/QuestionScreen.tsx` — fetches `GET /api/registration/questions`
  (TanStack Query) and renders one block per question: the question text, and its answers as a
  real single-select radio group (Paper `RadioButton.Group`) — exactly one selectable answer per
  question, matching the legacy single-choice-per-question behavior. A "Aceptar" submit button,
  **disabled until all 3 questions have a selection** (mirrors the legacy JS gate exactly). On
  submit, `POST /api/registration/validate-answers` with the 3 selected answer ids:
  - `data.passed === true` → store `data.registrationToken` + a computed `expiresAt` (now + 5
    minutes, matching the token's real server-side expiry) in the FR-1 store, then navigate to
    `/(auth)/register`.
  - `data.passed === false` → navigate to `/(auth)/question-fail` (no token stored, nothing to
    show inline — this is a hard redirect to the terminal screen, not an error banner).
- FR-3: `src/features/account/RegisterScreen.tsx` — on mount, if the FR-1 store has no token or
  it's past `expiresAt`, redirect to `/(auth)/question` immediately (mirrors legacy's Register
  GET redirecting to Question when there's no valid token — do this instead of touching the
  already-merged Login screen's existing `/(auth)/register` link). Otherwise render the form:
  `react-hook-form` + `zodResolver` against `RegisterBodySchema` (from `@dibujando/shared`,
  extended client-side with a `.refine` for `password === confirmPassword` — same message as
  FR-shared below — the shared schema doesn't include this cross-field check since the backend
  validates it separately). Fields in the legacy order (see References). `CountryId` populated
  from `GET /api/catalogs/countries` (TanStack Query) as a Paper `Menu`/dropdown, placeholder
  "Selecciona un país". Password field shows helper/caption text with the policy ("La contraseña
  debe tener al menos 6 caracteres; contener una mayúscula, un número y un carácter especial.").
  Submit button "Crear Cuenta". Reuse the single error-banner pattern from `LoginScreen` (extract
  it into a shared `src/components/FormErrorBanner.tsx` now that a second screen needs it — per
  the standing "extract genuinely shared elements where a pattern recurs" rule — and have
  `LoginScreen` adopt the extracted component too, so there's one implementation, not two).
  Client-validation messages, exact legacy strings: email required "El correo electrónico es
  requerido.", email malformed "El Correo electrónico no es una dirección de correo válida.",
  password required "La contraseña es requerida.", password too short "La contraseña debe
  contener al menos 6 caracteres.", confirm-password required "La confirmación de contraseña es
  requerida.", passwords don't match "La contraseña y la confirmación de contraseña no
  coinciden.", institution name required "El nombre corto de la organización es requerido.",
  registry number required "El RFC o Número de Registro Nacional es requerido.", registry number
  too long "El RFC o Número de Registro Nacional solo puede tener 25 caracteres", country
  required "El campo País es requerido.". Server error mapping (banner shows `error.message`
  verbatim — already Spanish from PR #10): `registration_token_expired` (redirect to the quiz
  after showing it briefly, or immediately — your call, but the user must end up back at
  `/(auth)/question`, not stuck on a dead form), `email_taken`, `duplicate_registry_number`,
  `weak_password`. On success: same handling as `LoginScreen`'s success path — store the returned
  tokens via the session store (PR #9) and navigate to `/`. Clear the FR-1 registration-token
  store on both success and on the token-expired redirect.
- FR-4: `src/features/account/QuestionFailScreen.tsx` — static screen, the exact copy from the
  References section above, ending in a "Iniciar Sesión" button linking to `/login`. No retry
  path back to the quiz.
- FR-5: Routes — `app/(auth)/question.tsx` (renders `QuestionScreen`),
  `app/(auth)/question-fail.tsx` (renders `QuestionFailScreen`), and `app/(auth)/register.tsx`
  (new — renders `RegisterScreen`, which owns the token-check redirect from FR-3). The existing
  `LoginScreen`'s "Regístrate" button already links to `/(auth)/register` (PR #9) — that route
  simply didn't exist until now; no change needed there.
- FR-6: `src/api/registration.api.ts` + `.queries.ts` (questions fetch, validate-answers mutation)
  and `src/api/catalogs.api.ts` + `.queries.ts` (countries fetch) — same thin-layer pattern as
  `auth.api.ts`/`auth.queries.ts` from PR #9, all through the one authenticated client (though
  these 3 endpoints don't require a bearer token — still go through `src/api/client.ts`, no raw
  `fetch`).

Acceptance (Given-When-Then — checkable via the frontend validation gate: `dev-up.sh --web --seed`
then exercise `http://localhost:8081`):

- Given the seeded 3 questions, When `/(auth)/question` loads, Then all 3 render with their
  answers, and "Aceptar" is disabled.
- Given exactly one answer selected per question (any combination), When all 3 are selected,
  Then "Aceptar" becomes enabled.
- Given the correct answers (`1`, `6`, `10`) selected, When "Aceptar" is submitted, Then the app
  navigates to `/(auth)/register` and the form renders (not a quiz-redirect loop).
- Given at least one wrong answer among the 3 selected, When submitted, Then the app navigates to
  `/(auth)/question-fail` showing the exact terminal copy and a working "Iniciar Sesión" link.
- Given no registration token held (e.g. navigating to `/(auth)/register` directly), When the
  screen mounts, Then it redirects to `/(auth)/question`.
- Given a valid token and a complete, valid form (a fresh email, matching passwords meeting the
  policy, an institution name, a not-already-used national registry number, a selected country),
  When "Crear Cuenta" is submitted, Then the app navigates to `/` and Home shows the new user's
  institution name and role `OSCNotApproved`.
- Given an empty required field, When submitted, Then the matching client-validation message
  shows without a network call.
- Given mismatched passwords, When submitted, Then "La contraseña y la confirmación de contraseña
  no coinciden." shows without a network call.
- Given a national registry number already used by the seeded fixture user or a prior test
  registration, When submitted with a valid token, Then the banner shows the exact
  `duplicate_registry_number` message from the server.
- Screenshot comparison (per the standing verify-against-original rule): capture legacy's quiz
  (`node .claude/shared/scripts/legacy-ui-shot.mjs /Question/Index legacy/question "Pre-Registro"
--public`) and Register (`node .claude/shared/scripts/legacy-ui-shot.mjs /Account/Register
legacy/register "Creación de cuenta" --public` — note: this legacy URL will actually redirect to
  Question without a real token; if so, capture whatever legacy shows and note that in
  `last-task.md` rather than treating it as a failure) against the new `/question` and `/register`
  screens (the latter only reachable in the new app with a real token from completing the quiz
  first, same as legacy) — confirm equivalent fields/copy are present.

Out of scope: the OSC-registration-wizard's later profile-completion screens
(InstitutionalBase/LegalBase/Government/Finance — separate task), the CRM push, email
confirmation (dead in legacy), forgot/reset-password (separate, next task), any change to
`apps/api` (backend is done, PR #10) or to the already-merged `LoginScreen`'s "Regístrate" link.
