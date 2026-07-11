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

## Current Task — task2-auth-core

Goal: `apps/api` exposes a working auth core (login, session refresh, logout, `/me`, and a
reusable role guard) that faithfully reproduces the legacy Portal Dibujando login/session/role
mechanism (`AccountController.Login`/`LogOff`, `Startup.Auth.cs`, `IdentityConfig.cs`,
`CustomAuthorize`) on top of NestJS + Kysely + Postgres — including a verifier compatible with
the already-migrated ASP.NET Identity 2.x password hashes, so existing users' passwords keep
working without a forced reset.

References (read before coding — point, not transcribed):

- `/home/angel/src/Dibujando (FDUM)/Dibujando 1.1/PortalDibujando/Controllers/AccountController.cs`
  — read `Login` (both GET/POST overloads) and `LogOff` in full. (`Register`/`ForgotPassword`/
  `ResetPassword` are OUT of scope for this task — separate follow-ups; you may skim them for
  context but do not implement them.)
- `.../PortalDibujando/App_Start/Startup.Auth.cs` — cookie auth options: 30-min security-stamp
  revalidation window, `LoginPath`.
- `.../PortalDibujando/App_Start/IdentityConfig.cs` — password policy (min length 6, requires
  digit+lower+upper+non-alphanumeric), lockout config (see FR-9 — it's configured but dead,
  don't implement enforcement).
- `.../PortalDibujando/Classes/CustomAuthorize.cs` — the exact authorization-denial behavior:
  unauthenticated OR wrong-role does **not** 401/403 to the end user, it redirects to Home. In
  this API, reproduce the _signal_ (a structured error code), not a browser redirect — the
  browser-redirect UX itself belongs to the frontend router in the future login-screen task.
- `.../PortalDibujando/Config/AppVariablesPortal.cs` (lines ~212-219) — the 3 known role
  id/name pairs: `SysAdmin` = `c2e45f98-8961-4530-b976-d1cdc4e7e8fb`, `OSCApproved` =
  `a78a41bb-960e-44f0-994e-f10f8b54e9bc`, `OSCNotApproved` = `5cbb1883-96c9-402f-8af3-778ccbf64977`.
  (A 4th role, `Admin`, was created ad-hoc through the legacy UI with no code constant — not
  needed for this task's seed/tests, just don't assume the list above is exhaustive elsewhere.)
- `.claude/shared/docs/stack/typescript/backend-structure-and-conventions.md` — module layout
  (domain/application/infrastructure/presentation), envelope shape, guard placement in `shared/`.
- `apps/api/src/modules/health/` — the one existing module; match its layering exactly (this
  task is the second module ever added, keep it consistent).
- `.claude/db-conversion/phase2/target/ddl/010_tables.sql` (lines ~163-204, ~978-994) — the
  ALREADY TRANSLATED-AND-VERIFIED Postgres column definitions for `aspnetusers`, `aspnetroles`,
  `aspnetuserroles`, `userprofile` (Task 1 sealed this; reuse the column list/types verbatim,
  don't re-derive). `oscprofile` exists in that file too but is NOT needed for this task — the
  seeded test user has no OSC profile (see FR-2).

Requirements:

- FR-1: Add `apps/api/db/scripts/001_auth_core.sql` (numbered plain-SQL script, per the stack
  doc's "no ORM migrations" rule) creating exactly 4 tables against the app's real dev Postgres
  (the one `docker compose up -d db` / `DATABASE_URL` points at — **not** the disposable
  `.claude/db-conversion` target container, a different database entirely):
  - `aspnetusers`, `aspnetroles`, `aspnetuserroles`, `userprofile` — column list/types copied
    verbatim from the referenced sealed DDL (same names, same types, same nullability). Add each
    table's own PRIMARY KEY. Do **not** add FOREIGN KEY constraints from these tables to any table
    outside this set (e.g. `userprofile.fileid` → a `File` table, or anything `oscprofile` would
    need like country/state/osctype catalogs) — those tables don't exist in this app's schema yet;
    this is a deliberate, named scope limit, not a silent omission. `aspnetuserroles.userid` →
    `aspnetusers.id` and `aspnetuserroles.roleid` → `aspnetroles.id` FKs ARE in scope (both sides
    exist in this same script).
  - `auth_sessions` (new table, no legacy counterpart — the OWIN cookie's server-side backing
    store had no DB table of its own; this is its equivalent, needed to make logout/refresh/
    revocation actually work): `id text primary key` (holds the opaque refresh token itself — see
    FR-5, knowledge of this value is the credential, same trust model as the legacy encrypted
    OWIN cookie), `user_id varchar(128) not null references aspnetusers(id)`,
    `security_stamp_at_issue text not null`, `expires_at timestamptz not null`,
    `created_at timestamptz not null default now()`.
  - Wire this script to run on API startup or via a small initializer, per the stack doc
    ("applied on startup or by a small initializer").
  - After applying it against the running dev Postgres, regenerate `apps/api/db/types.ts` with
    the already-installed `kysely-codegen` dev dependency (do not hand-write the `Database`
    interface).
- FR-2: Seed exactly one test fixture row set (in a seed script or migration-adjacent seed file —
  your choice of location under `apps/api/db/`, just keep it out of the numbered schema script):
  - `aspnetusers`: `id`/`username`/`email` = `'11111111-1111-1111-1111-111111111111'` /
    `'qa.auth@dibujando.test'` / same email, `passwordhash` =
    `'AJ8rvRwshbQ1BGuK952T3xjJKXq57CjhInbHs2LbgJSu/7VSm4DOjzIKi+MDXKuH0Q=='` (this is a verified
    ASP.NET Identity 2.x `PasswordHasher`-format hash for the plaintext password `Test1234!` —
    see FR-3 for the exact algorithm it encodes), `securitystamp` =
    `'22222222-2222-2222-2222-222222222222'`, `emailconfirmed=true`, `lockoutenabled=true`,
    `accessfailedcount=0`, `phonenumberconfirmed=false`, `twofactorenabled=false`,
    `lockoutenddateutc=NULL`.
  - `aspnetroles`: seed the 3 known role rows from the References section (id+name pairs above).
  - `aspnetuserroles`: link the seeded user to `SysAdmin`.
  - `userprofile`: one row for the seeded user — `email`/`institutionname`/
    `fullinstitutionname` = `'qa.auth@dibujando.test'` / `'QA Test Institution'` / same,
    `internalid` = the same UUID as the user's `id`, `countryid=NULL`, `nationalregistrynumber=NULL`,
    `externalid=NULL`, `fileid=NULL`, `statusid=1` (Active), `usercreateid='1'`,
    `datetimecreate=now()`.
  - Deliberately do **not** create an `oscprofile` row for this user — a SysAdmin has none in
    legacy either; the login/`/me` response must handle `oscProfileId: null` correctly.
- FR-3: Implement a password verifier reproducing ASP.NET Identity 2.x's stock `PasswordHasher`
  exactly (this is a stock Microsoft Base-Class-Library algorithm, not something in this repo's
  source — Node's built-in `crypto` module can do it, no new dependency): the stored hash is
  base64 of a 49-byte buffer: byte 0 = `0x00` (version marker), bytes 1–16 = a 128-bit salt,
  bytes 17–48 = a 256-bit subkey = `PBKDF2(password, salt, iterations=1000, keylen=32,
digest='sha1')`. To verify: decode the base64, check byte 0 is `0x00`, recompute PBKDF2 with the
  stored salt, and constant-time-compare (`crypto.timingSafeEqual`) against the stored subkey.
  The seeded fixture in FR-2 is a real, verified instance of this exact format — confirm your
  implementation returns `true` for password `Test1234!` against that stored hash, and `false`
  for any other password, before moving on.
- FR-4: `POST /api/auth/login` — body `{ email, password }` (zod schema in
  `packages/shared`, e.g. `auth.schema.ts`, so the future frontend can import the same type).
  Look up by `username`/`email` (legacy treats them as the same value), verify via FR-3.
  - Unknown email → `401 { success:false, error:{ code:'user_not_found', message:'El correo
electrónico no está asociado a un usuario o es incorrecto.' } }`.
  - Known email, wrong password → `401 { success:false, error:{ code:'invalid_credentials',
message:'El correo electrónico y la contraseña no coinciden.' } }` (these are the exact two
    Spanish strings from `AccountController.Login`'s two failure branches — keep them verbatim).
  - Success → `200 { success:true, data:{ accessToken, refreshToken, user:{ userProfileId,
oscProfileId, internalId, institutionName, role, countryId } } }` — this `user` object is the
    session-equivalent payload (mirrors legacy's `Session["UserProfileId"]` etc. set in
    `Login`'s success branch). `role` is the role NAME (e.g. `"SysAdmin"`), not the role id —
    business/authorization code checks by name (see `CustomAuthorize`). If the user has no row in
    `aspnetuserroles` at all, `role` is `null` (matches legacy: session vars are simply never set
    in that branch) — don't throw.
  - Do **not** call any CRM/Dynamics logic (legacy's `ValidateOCSApproved.SetOCSApproved`/
    `UdpateStatusOSC`, called on every login attempt where the user exists). Named blocker: the
    CRM integration module doesn't exist yet. Leave a one-line comment marking exactly where that
    call belongs once it does — don't build a stub CRM client for this task.
- FR-5: Session-issuance shape — `accessToken` is a `jose`-signed JWT (HS256, a `JWT_SECRET` env
  var — add it to `.env.example` if one exists, don't hardcode a real secret), 30-minute
  expiration (mirrors the legacy 30-minute security-stamp revalidation window), claims: `sub`
  (user id), `email`, `role`, `securityStampAtIssue`. `refreshToken` is an opaque random token
  (e.g. `crypto.randomBytes(32).toString('base64url')`), stored directly as `auth_sessions.id`
  (per FR-1 — knowledge of this value is the credential). The row also stores
  `security_stamp_at_issue` (copied from the user's `securitystamp` at login time) and
  `expires_at = now() + interval '14 days'`.
- FR-6: `POST /api/auth/refresh` — body `{ refreshToken }`. Look up the `auth_sessions` row by
  id. Missing/expired row → `401 { code:'session_invalidated' }`. Row found: compare
  `security_stamp_at_issue` against the user's CURRENT `aspnetusers.securitystamp` — mismatch
  (meaning the password changed since this session was issued, even though nothing in this task
  changes a password yet — this must still work once a future task adds password-change) → delete
  the row, `401 { code:'session_invalidated' }`. Match → issue a new access token (FR-5 shape),
  rotate the refresh token (delete the old `auth_sessions` row, insert a new one with a fresh id
  and `expires_at = now() + interval '14 days'` — this rotation-on-use is what makes the
  expiration "sliding"), return both like `/login`.
- FR-7: `POST /api/auth/logout` — body `{ refreshToken }`. Delete the matching `auth_sessions` row
  (idempotent: missing row is still a `200`, not an error — logging out twice isn't a bug).
  `200 { success:true, data:{} }`.
- FR-8: `GET /api/auth/me` — protected by a reusable `JwtAuthGuard` (in `apps/api/src/shared/`,
  per the stack doc's "cross-cutting: auth guard lives in shared/" rule) that reads the
  `Authorization: Bearer <accessToken>` header, verifies the `jose` JWT, and attaches the decoded
  claims to the request. No token / invalid / expired token → `401 { success:false,
error:{ code:'unauthenticated', message: '...' } }`. Valid token → re-fetch the CURRENT
  `userProfileId`/`oscProfileId`/`internalId`/`institutionName`/`role`/`countryId` from the DB
  (do not just echo the JWT claims — this is the "self-heal" `/me` endpoint the future frontend
  calls once after login or whenever its local session state is missing, mirroring legacy's
  `ReloadSessionVariables`) and return the same `user` shape as `/login`'s `data.user`.
- FR-9: Also implement a role-restriction primitive: a `@Roles(...roleNames)` decorator +
  extending the same guard (or a second `RolesGuard` composed with it) that compares the
  authenticated request's `role` claim against the decorator's list, case-sensitive exact match
  — `403 { success:false, error:{ code:'forbidden_role', message: '...' } }` on mismatch. No
  business endpoint consumes `@Roles()` yet (there are none besides `/me`, which is auth-only) —
  this is reusable infrastructure for every future `[Authorize(Roles=...)]`-equivalent endpoint.
  Prove its logic with a focused unit test against the guard class directly (mock
  `ExecutionContext` + a `SysAdmin`-role request passing `@Roles('SysAdmin')`, an
  `OSCApproved`-role request failing it) — a live protected business route isn't needed to prove
  this, and none exists yet.
- FR-10: Legacy lockout (`UserLockoutEnabledByDefault=true`, 5 failed attempts, 5-min lockout) is
  configured but **never actually enforced** — every login call passes `shouldLockout: false`.
  Do **not** implement working lockout enforcement in this task (that would be a behavior change,
  not a faithful port) — ignore `accessfailedcount`/`lockoutenddateutc` entirely for now; a
  future task can add real lockout as a deliberate, user-approved improvement.

Acceptance (Given-When-Then — must be checkable via `apps/api`'s validation gate: run the API,
call each endpoint with `curl`/the Vitest integration suite against real seeded rows):

- Given the seeded fixture user and password `Test1234!`, When `POST /api/auth/login` is called,
  Then it returns `200` with `data.user.role === 'SysAdmin'`, `data.user.oscProfileId === null`,
  and non-empty `accessToken`/`refreshToken` strings.
- Given the seeded fixture user and any wrong password, When `POST /api/auth/login` is called,
  Then it returns `401` with `error.code === 'invalid_credentials'` and the exact Spanish message
  from FR-4.
- Given an email with no matching `aspnetusers` row, When `POST /api/auth/login` is called, Then
  it returns `401` with `error.code === 'user_not_found'`.
- Given a valid `accessToken` from a successful login, When `GET /api/auth/me` is called with
  `Authorization: Bearer <accessToken>`, Then it returns `200` with the same `user` shape,
  re-fetched from the DB (not just decoded from the token).
- Given no `Authorization` header, When `GET /api/auth/me` is called, Then it returns `401` with
  `error.code === 'unauthenticated'`.
- Given a valid `refreshToken` from a successful login, When `POST /api/auth/refresh` is called,
  Then it returns `200` with a NEW `accessToken` and a NEW `refreshToken`, and the OLD
  `refreshToken` no longer works on a second `/refresh` call (`401 session_invalidated`).
- Given a valid `refreshToken`, When the seeded user's `aspnetusers.securitystamp` is changed
  directly in the DB (simulating a future password change) and `POST /api/auth/refresh` is then
  called with that same (now-stale) `refreshToken`, Then it returns `401 session_invalidated`.
- Given a valid `refreshToken`, When `POST /api/auth/logout` is called with it and then
  `POST /api/auth/refresh` is called again with the same token, Then logout returns `200` and the
  subsequent refresh returns `401 session_invalidated`.
- Given a request whose JWT has `role: 'OSCApproved'`, When a route/guard restricted via
  `@Roles('SysAdmin')` is checked (unit test, per FR-9), Then it returns/throws
  `403 forbidden_role`; the matching-role case returns success.

Out of scope: `Register`/self-registration, `ForgotPassword`/`ResetPassword`, the CRM-driven
`OSCNotApproved → OSCApproved` login-time promotion (named blocker: CRM integration module not
built yet), 2FA/lockout enforcement, the frontend login screen (a separate, follow-up task once
this backend core lands), `aspnetuserclaims`/`aspnetuserlogins` tables (unused — legacy's external
login providers are all commented out in `Startup.Auth.cs`), any change to
`.claude/db-conversion/**` (Task 1's sealed artifacts are immutable) or to the legacy source tree.
