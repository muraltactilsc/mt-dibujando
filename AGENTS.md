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

## Current Task — task2-login-screen

Goal: `apps/mobile` has a working, faithfully-replicated login screen — email/password form,
error handling, links to Register/forgot-password — wired to the already-built backend auth
endpoints from PR #8 (`POST /api/auth/{login,refresh,logout}`, `GET /api/auth/me`), plus an
app-wide session gate (unauthenticated → redirected to login; authenticated → the app) and a way
to log out, so the full login↔session↔logout loop is demonstrable end-to-end on the web target.

References (read before coding — point, not transcribed):

- `/home/angel/src/Dibujando (FDUM)/Dibujando 1.1/PortalDibujando/Views/Account/Login.cshtml`
  — the exact panels: logo, "Iniciar Sesión" title, email field (placeholder "Correo
  Electrónico"), password field (placeholder "Contraseña"), submit button "Iniciar Sesión",
  link "Restablecer contraseña", divider, label "¿No tienes una cuenta?", button "Regístrate".
- `.../PortalDibujando/Models/AccountViewModels.cs` (`LoginViewModel`) — the exact Spanish
  validation-message strings (see FR-5). Note: it has a `RememberMe` field, but the view above
  never renders a checkbox for it — a dead field in the legacy UI. Don't add a RememberMe
  checkbox; see FR-5's last bullet for why it doesn't apply here anyway.
- `.claude/shared/docs/architecture/frontend.md` — module layout, and the just-updated **real**
  brand palette (teal `#46c6b4` primary, blue `#2b92c4` accent, red `#da291c` header) —
  supersedes the placeholder `#E4312A` currently hardcoded in `apps/mobile/app/_layout.tsx`.
- `.claude/shared/docs/stack/typescript/frontend-structure-and-conventions.md` — the `auth/`
  module's exact job ("session provider, IdP wiring, token storage (`expo-secure-store`)"), the
  one-authenticated-client rule, and the Auth section's rule: no cloud IdP, one credential form,
  "whatever token/session the backend issues lives in `expo-secure-store`, never AsyncStorage."
- `apps/api/src/modules/auth/` + `packages/shared/src/auth.schema.ts` (PR #8, already merged) —
  the real, live contract: `LoginBodySchema`/`AuthUser`/`AuthSessionData` types, and the 4
  endpoints' exact request/response shapes (envelope `{ success, data, error }`,
  `error: { code, message }`). Do not re-derive these — import the zod schemas/types from
  `@dibujando/shared` directly.
- `apps/mobile/app/_layout.tsx`, `app/index.tsx`, `src/features/home/HomeScreen.tsx`,
  `src/api/client.ts` — the current Task-0 scaffold state you're extending (no auth exists yet;
  `client.ts` only has an unauthenticated `apiGet`).

Requirements:

- FR-1: In `apps/mobile/app/_layout.tsx`, replace the hardcoded `const accent = '#E4312A'` with
  the real brand teal `#46c6b4` (per frontend.md's updated palette) — a one-line theme-token
  change, nothing else in that file's theme setup changes.
- FR-2: Build the `src/auth/` session module: a token-storage wrapper around `expo-secure-store`
  for the refresh token (get/set/delete — never `AsyncStorage`), and a session store (Zustand —
  the folder doc explicitly carves session state out of `state/` into `auth/`) holding
  `{ status: 'loading' | 'authenticated' | 'unauthenticated', accessToken: string | null,
user: AuthUser | null }` plus `login(email, password)`, `logout()`, and a boot-time
  `bootstrap()` that, if a refresh token is stored, calls `POST /api/auth/refresh` to silently
  re-establish a session (mirrors the legacy's sliding-session behavior) — on any failure, clear
  storage and settle on `'unauthenticated'`.
- FR-3: Extend `src/api/client.ts` into the one authenticated client (per the stack doc): add
  `apiPost`; every request attaches `Authorization: Bearer <accessToken>` read from the session
  store; on a `401` whose body's `error.code` is `unauthenticated` or `session_invalidated`,
  attempt exactly one silent refresh (via the session store) + retry the original request, then
  force `logout()` if that also fails. No raw `fetch` outside this file (enforced by
  `no-raw-fetch.sh`).
- FR-4: `src/api/auth.api.ts` (thin calls: login/refresh/logout/me, typed against
  `@dibujando/shared`'s `LoginBodySchema`/`AuthSessionData`/`AuthUser`) + `src/api/auth.queries.ts`
  (a `useLoginMutation()` TanStack Query hook the screen consumes — no inline fetch logic in the
  screen itself).
- FR-5: `src/features/account/LoginScreen.tsx` — `react-hook-form` + `zodResolver` against
  `LoginBodySchema` (imported from `@dibujando/shared`, not redeclared). Fields: email (Paper
  `TextInput`), password (Paper `TextInput` with `secureTextEntry`). Submit button labeled
  "Iniciar Sesión". A single error banner above the form (a deliberate simplification of legacy's
  scrape-hidden-messages-into-one-banner `ScriptAlerts.js` mechanism — same user-visible outcome,
  simpler implementation) showing, in priority order: (a) a client-side validation message if the
  form didn't pass validation, using these exact legacy strings — email empty: "El correo
  electrónico es requerido.", email malformed: "El Correo electrónico no es una dirección de
  correo válida.", password empty: "La contraseña es requerida."; (b) otherwise the server's
  `error.message` verbatim (already Spanish, from PR #8's auth endpoints — no client-side
  re-translation). Below the form: a divider, the label "¿No tienes una cuenta?", and a
  "Regístrate" button linking to `/(auth)/register` (a route that doesn't exist until a later,
  already-planned task — fine to leave as a forward reference, don't build a placeholder screen
  for it). A "Restablecer contraseña" link goes to `/(auth)/forgot-password` (same: forward
  reference to a later task). On successful login, store the tokens (FR-2) and navigate to `/`.
  Do **not** add a "Recuérdame"/RememberMe checkbox: the legacy view never renders one despite
  the model having the field (dead in the legacy UI), and it doesn't map onto this rewrite's
  session design anyway — PR #8's JWT refresh tokens always use the 14-day sliding window
  regardless, there is no persistent-vs-browser-session distinction to reproduce.
- FR-6: Routing/session gate — add `app/(auth)/_layout.tsx` (a plain Stack/Slot for the public
  group) and `app/(auth)/login.tsx` (renders `LoginScreen`). In the root `app/_layout.tsx`, wrap
  the tree in the session provider from FR-2 (call `bootstrap()` once on mount). While
  `status === 'loading'`, render a minimal loading state (no flash of Home or the login form).
  Once resolved: if `'unauthenticated'` and the current route isn't already under `(auth)`,
  redirect to `/login`; if `'authenticated'` and currently on `/login`, redirect to `/`.
- FR-7: `HomeScreen` — small addition, not a rebuild: show the logged-in user's
  `institutionName` and `role` (from the session store's `user`, sourced from `/me`), and a
  "Cerrar sesión" button that calls `logout()` (hits `POST /api/auth/logout`, clears the stored
  refresh token, resets the session store to `'unauthenticated'`) and returns to `/login`. This is
  only to prove the round trip end-to-end — the real role-based landing-page routing
  (`ViewSelectorController`'s job) is a separate, not-yet-built task; don't build it here.

Acceptance (Given-When-Then — checkable via the frontend validation gate: run
`bash .claude/shared/scripts/dev-up.sh --web --seed`, then exercise the web target at
`http://localhost:8081`; the PR #8 seed fixture user is `qa.auth@dibujando.test` /
password `Test1234!`):

- Given no stored session, When the app loads at `/`, Then it redirects to `/login` (not a blank
  or protected screen).
- Given the seeded fixture credentials entered on `/login`, When submitted, Then the app
  navigates to `/` and Home shows `institutionName: 'QA Test Institution'` and `role: 'SysAdmin'`.
- Given a wrong password for the seeded email, When submitted, Then the banner shows "El correo
  electrónico y la contraseña no coinciden." and the user stays on `/login`.
- Given an empty email and/or password, When the form is submitted, Then the banner shows the
  matching required-field message from FR-5 WITHOUT a network call (pure client-side validation).
- Given a logged-in session, When "Cerrar sesión" is tapped, Then the app returns to `/login`,
  and reloading the page afterward does NOT silently re-authenticate (refresh token was cleared).
- Screenshot comparison (per the standing verify-against-original rule): capture the legacy page
  (`node .claude/shared/scripts/legacy-ui-shot.mjs /Account/Login legacy/login "Iniciar Sesión"`)
  and the new one (`node .claude/shared/scripts/ui-shot.mjs /login account/login "Iniciar
Sesión"`) and confirm the same fields/buttons/links are present on both — reject a spinner/
  empty/404 shot as evidence.

Out of scope: the Register screen's own content (link only), the ForgotPassword screen's own
content (link only), `ViewSelectorController`-style role-based landing-page routing, any
2FA/lockout UI (none exists in legacy either), the unused `_ExternalLoginsListPartial.cshtml`
(no providers configured — dead), any change to `apps/api` (backend is done, PR #8).
