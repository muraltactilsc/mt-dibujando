# Faithful rebuild task tracker

This is the durable progress tracker for orchestrators. It is not a spec list. When the user says
`continue`, the orchestrator should pick up the next sensible unchecked item (Task 0 first, always,
if the boilerplate isn't done yet), research the referenced legacy source, then write one
executor-ready `## Current Task` in `AGENTS.md`.

## Status legend

- `[ ]` not started.
- `[~]` researched or in progress; see nearby notes or `.claude/dev/last-task.md`.
- `[x]` complete and validated.
- `[!]` blocked; blocker must be named nearby.
- `[>]` split after research; use the child subtasks instead of the parent.

## Tracker maintenance rules

- Update this tracker after every completed, partial, or blocked executor run.
- A task may add researched subtasks when the current agent discovers the real size. Expected,
  especially for a legacy controller that turns out to be several screens, not one.
- Prefer adding subtasks under the original item instead of replacing history. Mark the parent
  `[>]` when the parent is too broad and child tasks become the real work.
- Keep task granularity balanced: one scaffold slice, one migration phase, one vertical feature
  slice, or one validation improvement per executor run. Avoid giant tasks ("rebuild the whole
  Announcement lifecycle") and tiny tasks ("add one field").

## Global source rules

- Legacy source is **read-only**, never modified:
  - Portal: `/home/angel/src/Dibujando (FDUM)/Dibujando 1.1/PortalDibujando/` (quote the path —
    spaces/parens). Canonical version (newest, most files) — `Dibujando` (no `1.1`) is the older
    sibling, not used.
  - CRM connector library: `/home/angel/src/Dibujando (FDUM)/Dibujando 1.1/DynamicsConnector/`.
  - Background worker: `/home/angel/src/Dibujando (FDUM)/FunctionsDibujando 1.2/` (Azure
    Functions v1, .NET 4.6.1). `FunctionsDibujando`/`FunctionsDibujando 1.1` are older stub
    siblings, not used.
- Research already done in this session is summarized per-task below — treat it as a starting
  point, not a substitute for reading the actual legacy file when speccing a task. It was gathered
  by parallel research agents reading real source; file/line references are real, but re-verify
  anything load-bearing before writing an executor spec.
- **No EntraID / no external identity provider** — decided explicitly with the user 2026-07-07.
  Auth is rebuilt to replicate the legacy mechanism exactly (Task 2). This overrides the generic
  stack docs' default cloud-IdP guidance, already corrected in
  `.claude/shared/docs/stack/typescript/{backend,frontend}-structure-and-conventions.md` and
  `azure-hosting-infrastructure.md`.
- **Database migration is a real data migration, not a from-scratch re-design** — decided
  explicitly with the user 2026-07-07: SQL Server → PostgreSQL as an **identical replica**
  (same tables/columns/relationships, only the dialect changes), migrating **real data**, not just
  an empty faithful-looking schema. This is Task 1, done via the `/convert-engine` skill — do not
  hand-author a from-memory Postgres schema instead.
- **Verify against the real hosted legacy site, not just the source.** Decided explicitly with the
  user 2026-07-07: a live DEV deployment exists
  (`https://wapp-dev-portal-dibujando.azurewebsites.net`, credentials in `CLAUDE.local.md`, a test
  environment — read-only, never submit a write action through it). See
  `.claude/dev/docs/legacy-app-runbook.md` and `.claude/shared/scripts/legacy-ui-shot.mjs`
  (Playwright, mirrors this repo's own `ui-shot.mjs`) — screenshot the real legacy screen before
  and after porting it, don't rely on reading the controller/view source alone.
- **Email: Microsoft Graph `sendMail`, not Postmark** — decided explicitly with the user
  2026-07-07. Legacy uses Postmark throughout (password reset, announcement invitations, finance/
  followup reminders); the rewrite replaces it with Microsoft Graph's mail-sending API. Build the
  code against a `NotificationsPort`/email-service abstraction from the start (call sites assume
  Graph), but the **real Graph app-registration/credentials wiring is deferred to the infra
  phase**, alongside the rest of hosting (see `azure-hosting-infrastructure.md`'s DEFERRED banner)
  — don't block a feature task on having real Graph credentials; stub/mock the send in the
  meantime and say so.

---

## Task 0 — Foundation: monorepo boilerplate scaffold

**This is the next session's `continue` entry point.** Nothing beyond the ai-collab-pattern
machinery exists in this repo yet — no `apps/`, no `packages/`, no `package.json`.

- [ ] Scaffold the pnpm/Turborepo monorepo per
      `.claude/shared/docs/stack/typescript/repo-and-delivery.md`: `apps/mobile` (Expo Router +
      React Native Paper), `apps/api` (NestJS), `packages/shared` (zod contracts), root
      `package.json`/`pnpm-workspace.yaml`/`turbo.json`, strict `tsconfig.base.json`.
- [ ] Baseline manifests: NestJS, Expo, React Native Paper, Kysely, `pg`, zod, TanStack Query,
      Zustand, React Hook Form, `kysely-codegen` — nothing beyond this list without asking the user
      first (see `backend.md`/`frontend.md`'s "Other project packages: TODO" note).
      `expo-auth-session` is explicitly **not** wired for an OAuth/cloud-IdP flow (see Task 2) — Expo's
      own secure-store/session-cookie handling is still fine to use as plumbing.
- [ ] Wire local validation: `validate.sh` passes on the empty scaffold (format, build, lint,
      typecheck, test, `file-size.sh`, `banned-deps.sh`, `no-raw-fetch.sh`).
- [ ] Fill `dev-up.sh` for real once `apps/api`/`apps/mobile` exist (it's currently written ahead
      of the scaffold in `.claude/shared/scripts/dev-up.sh` — verify the ports/commands still match
      what gets scaffolded, adjust if not).
- [ ] Local Postgres via `docker compose` (a `db` service) — this is the LOCAL dev database only;
      Task 1 (below) is the actual legacy-data migration into it, not part of this scaffold task.
- [ ] Install Playwright's Chromium (`npx playwright install chromium`) so both `ui-shot.mjs` (new
      app) and `.claude/shared/scripts/legacy-ui-shot.mjs` (hosted legacy reference, already written —
      see `.claude/dev/docs/legacy-app-runbook.md`) work from day one; every subsequent screen task
      needs the legacy tool to verify against the real original.

## Task 1 — Database migration: SQL Server → PostgreSQL (identical replica, real data)

- [ ] **Run the `/convert-engine` skill** against `mt-dibujando`, source = the legacy SQL Server
      database backing Portal Dibujando. Do not hand-translate the schema yourself — that skill's
      pipeline (direction gate → closed-world interview → phase 1 scan → phase 2 translate → ... →
      phase 5 parity) is the mechanism for a **verified**, identical-structure, real-data migration.
  - **What's already known that the skill's interview will need** (from this session's research —
    re-verify, don't just paste):
    - Source is on-prem SQL Server, **not** Azure SQL: `Web.config`'s `EntitiesPortalDibujado`
      connection string targets `Data Source=LOCALHOST; Initial Catalog=DB-Prod-PortalDibujando02`
      via SQL auth (`user id=sa`, plaintext password committed in `Web.config` — **rotate this
      credential as part of migration kickoff, don't just reuse it**). A second connection string
      (`DefaultConnection`, used by ASP.NET Identity) targets the **same** physical DB via Windows
      integrated auth. Confirm with the user how read-only access to the actual live server will
      be obtained (VPN/hostname reachable from this machine, a restored copy, or a `.bak` — none
      of `.sql`/`.bak`/`.mdf` files exist anywhere in the legacy source tree, so there is no
      offline schema/data artifact to fall back on; the live server is the only source of truth).
    - Schema is EF6 Database-First (`PortalDibujando/Models/ModelPortalDibujando.edmx`), **63
      physical tables**, all in-DB (no separate `.sql`/migrations folder — see closed-world
      interview's "in-DB code" question). No stored procs/triggers were found referenced from the
      edmx itself, but the interview's catalog-scan question should confirm this directly against
      the live DB, not just the edmx.
    - **Known schema anomalies to carry into `config.type_overrides`/`out_of_scope`, not silently
      "fix"**: 7 columns that look like FKs but have no declared referential constraint
      (`AnnouncementHasFileType.AnnouncementId`, `FileType.PeriodValidityId`,
      `FileType.FileEligibilityId`, `Finance.OSCProfileId`,
      `OSCHasAnnouncementFile.AnnouncementApplicationId`,
      `OSCHasDownloadFile.AnnouncementApplicationId`, `UserProfile.FileId`) — migrate the columns
      as-is (identical replica means identical, including its gaps), decide later whether the
      rewrite's Postgres schema adds the constraint. Two tables have non-conforming audit-column
      names (`LegalBase`: `UserCreated`/`UserUpdatedId`; `VolunteerActivities`: `UserCreatedId`)
      instead of the universal `UserCreateId`/`UserUpdateId` — migrate verbatim.
    - **Orphaned model files with no edmx/table backing** — `Models/ContractType.cs`,
      `IncomeExpenseType.cs`, `InterventionModelProgram.cs` (singular), `OSCProfileHasOSCType.cs`,
      `PoblationType.cs`, `TypeFinancing.cs` — these are NOT real tables (confirm live, but
      research found no EntityType/DbSet for any of them); do not migrate them, and do not port
      any legacy code path that might reference them without first confirming it's dead.
    - **No standalone "Announcement" table exists** — announcements/convocatorias live only in
      Dynamics CRM (`mt_announcements`), referenced from SQL Server only via `Dynamics*Id` string
      columns on `AnnouncementApplication`/`AnnouncementStatus`/`AnnouncementHasFileType`. The
      migration only needs to bring over the SQL Server side; the Announcement master data itself
      is a CRM read (see Task "CRM integration" below), not part of this DB migration.
    - `AspNetUsers`/`AspNetRoles`/`AspNetUserClaims`/`AspNetUserLogins`/`AspNetUserRoles` (standard
      ASP.NET Identity 2.x tables) are in-scope for the migration — Task 2's auth rebuild reads the
      migrated data (existing users must be able to log in after the rewrite, matching
      password hashes — see Task 2's hashing note).
  - [ ] Closed-world interview, phase 1–5, `bash .claude/checks/*.sh` smoke tests — per that
        skill's own steps. Report headline numbers (tables, FKs, rows migrated) back to the user.
  - [ ] Confirm live row-count/data parity (phase 5) before treating this task as done — a
        green phase-1 scan is not a migrated database.

## Task 2 — Auth reconstruction (no EntraID — replicate the legacy mechanism exactly)

Legacy mechanism, confirmed by direct source read (`AccountController.cs`, `Startup.Auth.cs`,
`IdentityConfig.cs`, `CustomAuthorize.cs`, `Web.config`) — replicate this shape in NestJS + Expo,
not a generic "add JWT auth" implementation:

- **Library equivalents, not the libraries themselves**: legacy is ASP.NET Identity 2.2.1 + OWIN
  cookie auth. The rewrite doesn't need OWIN, but it must reproduce the _behavior_:
  session-cookie-based (not necessarily JWT-only — decide with the user whether a cookie or
  bearer-token session fits the Expo/NestJS stack better, but the **login/password/role semantics
  below are not optional**), a 14-day sliding expiration by default, and a security-stamp-style
  revalidation window (legacy: 30 min) that invalidates a session if the password changed.
- **Password hashing — migration compatibility matters.** Legacy uses ASP.NET Identity 2.x's
  stock `PasswordHasher`: PBKDF2/HMAC-SHA1, 1000 iterations, 128-bit salt, stored as one base64
  string in `AspNetUsers.PasswordHash` (migrated verbatim by Task 1). **Existing users' passwords
  must keep working after the rewrite** — either implement a compatible verifier for this exact
  scheme, or a lazy-rehash-on-successful-login strategy that upgrades to a modern KDF over time.
  Do NOT silently force a password reset for the whole user base as a shortcut.
  Password policy to replicate: min length 6, requires digit + lower + upper + non-alphanumeric.
- **Roles — replicate exactly, don't invent a cleaner model.** `SysAdmin`, `OSCApproved`,
  `OSCNotApproved`, plus an ad-hoc `Admin` role created through the UI (no code constant — read it
  from the migrated `AspNetRoles` table, don't assume the list from `AppVariablesPortal.cs` alone
  is complete). New self-registrations are auto-assigned `OSCNotApproved`.
- **`CustomAuthorize`'s exact denial behavior — a real UX contract, not incidental.** Unauthenticated
  or wrong-role access does **not** 401/403 — it silently redirects to the Home/landing screen.
  Reproduce this (or make a deliberate, user-approved decision to change it — but as a decision,
  not a silent "the framework does 403 now" default).
- **Login-time CRM-driven role promotion is load-bearing business logic, not incidental
  plumbing.** On every login, the legacy checks Dynamics CRM for OSC-approval status and can
  promote `OSCNotApproved → OSCApproved` on the fly, syncing OSC status fields locally. This
  depends on the CRM integration (see the "CRM integration" task below) — sequence auth's
  CRM-approval-check sub-piece after that lands, but everything else in this task (login form,
  password verify, session issuance, role-gated redirects) does not need to wait for it.
- **Dual state model — Session-equivalent data, not just claims.** Legacy keeps
  `UserProfileId`/`OSCProfileId`/`UserRoleId`/`InstitutionName`/etc. in ASP.NET `Session`, read by
  business controllers directly (not from the identity/claims). The rewrite's equivalent: decide
  with the user whether this becomes richer JWT claims, a server session store, or a
  `/me`-style endpoint the frontend calls once — but the same fields must be available wherever
  the legacy code reads them from Session, and the app must "self-heal" (re-derive) if that state
  is ever missing, same as legacy's `ReloadSessionVariables`.
- **Forgot/reset password flow** — replicate: email lookup by username(=email), a reset token
  - email via **Microsoft Graph `sendMail`** (legacy used Postmark; this project uses Graph
    instead — real credentials wired at the infra phase, stub/mock the send until then, see the
    global source rules above), a 24-hour expiration
    (legacy checks this via an **unsigned** `createdDate` query param — a known legacy weakness; flag
    for the user whether to fix this in the rewrite or replicate as-is), Spanish-localized error
    messages mapped by **error code**, not by matching legacy's brittle English/Spanish substring
    matching.
- **Lockout/2FA are configured in legacy but practically dead** (`shouldLockout: false` on every
  login call; no reachable `SendCode`/`VerifyCode` action despite 2FA cookies being wired). Do NOT
  build a working 2FA flow as part of a "faithful port" — replicate the absence, unless the user
  explicitly wants to add real 2FA as a deliberate improvement (a decision, not a default).
- **Anonymous-by-design surfaces must stay anonymous.** `FileControlController`,
  `IFrameController`, `IFrameAnnouncementUploadController`, `IFrameEntryProgressReportController`,
  `IFrameTabsController`, `QuestionController` are `[AllowAnonymous]` on purpose (CRM-iframe
  embedding, pre-registration flows) — do not "fix" these by adding auth as part of this task; the
  IFrame-widget rebuild task (below) is where their access-control story (today: CRM-Referrer-header
  trust, inconsistently applied — a real security gap) gets a deliberate decision.
- [ ] Spec + build the login screen + session issuance + role model, reading
      `AccountController.cs`'s Login/Register/LogOff actions in full first (per the standing "read the
      whole original" rule) — this is the first faithfully-replicated screen.
- [ ] Spec + build forgot/reset-password.
- [ ] Defer the CRM-approval-promotion sub-piece explicitly (named blocker: CRM integration not
      yet built) rather than skipping it silently.

## Feature rebuild order

Grouped by bounded area, roughly in dependency order. Each area below has already been read in
full by a research pass this session — the summary is enough to scope a task, but the executor
spec should still point at (not restate) the real controller/view files.

- [ ] **OSC registration wizard** — `OSCController` (the only one of this group with live CRM
      calls: pushes the profile to CRM as a `contacts` record via `SendDataToDynamics`, pulls reviewer
      feedback via `GetOSCFeedbackClass`) + `InstitutionalBaseController` + `LegalBaseController` +
      `GovermentController` (sic — legacy typo, "Goverment") + `FinanceController`. All five are
      sections of one composite OSC profile entity, keyed by `(UserProfileId, OSCProfileId)`; editing
      any section flags the whole registration as needing re-submission
      (`OSCController.SendMessageRegister`). `InstitutionalBase`/`LegalBase`/`Government`/`Finance` are
      pure local CRUD (no CRM calls) — sequence `OSCController` (with its CRM push) after the other
      four are working, or build it CRM-mocked first and wire the real CRM call once the CRM
      integration task lands. `FinanceController` has one confirmed legacy bug (`DisableDonation`
      never resolves the real entity — a no-op) and one large dead/commented-out method
      (`DisableFinance`) — do not port the bug or the dead code; note both as fixed, not silently
      dropped.
- [ ] **Document/File management (shared infrastructure)** — `FileControlController` (the actual
      Azure Blob + `File`/`OSC*HasFile` junction-table CRUD layer — **anonymous by design**, called by
      everything else) underneath three distinct checklist contexts that are NOT redundant with each
      other despite similar shapes: `DocumentController` (OSC **registration-level** documents),
      `AnnouncementDocumentController` (**per-announcement/application-stage** documents, also used by
      Evaluation/Monitoring for file-completeness gating), `MonitoringDocumentController`
      (**per-monitoring-entry/"partida"** documents, CRM-integrated via `ValidateActiveEntry`). Build
      the shared file-control layer first, then the three checklist contexts — they're a strong
      consolidation candidate (near-identical Document/Category DTO shapes) worth a single generic
      "document checklist" service parameterized by context, rather than three parallel
      implementations, but confirm that refactor with the user before doing it (it changes internal
      structure, not behavior, so it's allowed per "HOW is free" — just flag it as a deliberate choice).
- [ ] **Announcement lifecycle** — stage order confirmed via
      `AppVariablesPortal.Enum_Opportunity_Stage_CRM`: **List (browse/select) → Application (fill +
      first CRM sync) → Evaluation (interview/approved-amount) → ProjectStart/"Start" (bank data,
      contract exchange) → Monitoring ("Entry"/partida tracking: bank data, payment-reflect, report
      files) → Close (final wrap-up check)**. Controllers:
      `AnnouncementListController`, `AnnouncementApplicationController`,
      `AnnouncementEvaluationController`, `AnnouncementStartController`,
      `AnnouncementMonitoringController`, `AnnouncementCloseController`. Every CRM write in these
      controllers is dispatched via a blocking `Task.Run(...).Wait()` in legacy — do NOT reproduce that
      anti-pattern, use real async/await or a proper job queue. `AnnouncementApplication` (with its
      `DynamicsAnnouncementApplicationId`/`DynamicsApplicationStatusId`/`DynamicsOpportunityStageId`
      fields) is the shared entity backbone across all six controllers — build it once. Build stages in
      their listed order; each stage's read side can ship before its CRM-write side if the CRM
      integration task hasn't landed yet (name that as the blocker, don't skip the stage).
- [ ] **User administration + post-login routing** — `UserController` (SysAdmin/Admin-only:
      list/create/edit/disable portal user accounts + role assignment — distinct from
      `AccountController`'s self-service login/register) and `ViewSelectorController` (single
      post-login dispatcher: reads role + `OSCProfile.DynamicsOSCStatusId` to route to the correct
      landing page). Depends on Task 2's role model.
- [ ] **IFrame widget controllers (CRM-embedded)** — `IFrameController` (document
      approve/reject/feedback), `IFrameAnnouncementUploadController` (contract/letter hand-off),
      `IFrameTabsController` (read-only profile tabs, no live CRM calls), `IFrameEntryProgressReportController`
      (per-partida compliance checklist approve/reject/feedback). All four are meant to be embedded as
      `<iframe>` panels inside Dynamics 365 CRM forms (`Web.config`'s `UrlReferrer =
dev-fdum.crm.dynamics.com`), hence `[AllowAnonymous]` + Referrer-header-based pseudo-auth instead
      of cookie auth. **Security finding to resolve as a deliberate decision, not a silent carry-over**:
      the Referrer check is inconsistently applied in legacy — present on page-load actions, absent on
      most of the actual mutating actions (approve/reject/upload/feedback), meaning those are reachable
      by anyone who can guess/enumerate the record ids. Options to put to the user before building this:
      replicate as-is (matches legacy exactly but keeps a real vulnerability), or replace
      Referrer-trust with a signed/short-lived CRM-issued token validated on every action (same iframe
      UX, closes the gap) — this is presentation/security-boundary "HOW", not "WHAT", so it's within
      the license to improve, but the user should choose, not have it decided silently.
- [ ] **DynamicsConnector / CRM integration surface** — the full operation catalogue (from this
      session's research) groups into: OSC-profile-as-`contacts` (insert/update/status/feedback),
      Announcement (`mt_announcements`)/Opportunity (`opportunities`) read+write, Entry/"partida"
      (`mt_entries`) read+write, Contract (`mt_opportunitycontracts`) read+write, and a
      catalogue-sync pattern (Country/State/FileType/generic — CRM read → local-DB diff → apply,
      clearly the ETL half of what FunctionsDibujando's timer jobs run). Auth to CRM is OAuth2
      client-credentials (Azure AD app registration), **not** the OSC end-user's own identity — a
      service-to-service call from the backend, straightforward to port. **Two security findings to
      flag/fix, not port verbatim**: a CRM client secret is hardcoded in
      `DynamicsConnector/Config/AppSettings.cs` (the `KVGetUserAndPassword`/Key Vault code that should
      have loaded it is dead/commented-out), and the CRM base URL in source is the **QA** endpoint
      (`qa-fdum.crm.dynamics.com`), with the real prod endpoint commented out — confirm which
      environment to target with the user before wiring this up for real. **Do not port** the
      `mmed_*`-prefixed "Example"/medicine-treatment classes found in the same library
      (`InsertExample`, `UpdateExample`, `SelectExampleExpand`, `GetAllDoctorQuery`, etc.) — these
      belong to an unrelated vertical riding along in the same assembly, out of scope for Dibujando.

## FunctionsDibujando — background jobs (own track, after the portal core lands)

Azure Functions v1 (.NET 4.6.1), 12 functions, mostly timer-triggered. Port as NestJS scheduled
tasks (or a lightweight worker service — decide with the user per the hosting doc's sync/async
split) once the portal's core schema + CRM integration exist, since every job here reads/writes
the same entities.

- [ ] `GetTokenAPIDynamics` (HTTP) — dev-only helper minting a raw CRM bearer token for a
      hardcoded username allow-list. Likely not worth porting as a production endpoint — confirm scope
      with the user (probably drop, replace with normal backend-internal CRM auth).
- [ ] `ExpiredFiles` (every minute) — expires OSC file relations past their validity period, then
      mirrors OSC-Expired status to CRM.
- [ ] `SyncCountryState` (every minute) — CRM→local one-way catalog sync (Country, then State).
- [ ] `SendFollowupReportReminder` (hourly) — CRM Entry-based reminder emails (1-month/7-day/
      deducible-file), flips CRM notification flags on send, via **Microsoft Graph** (legacy: Postmark).
- [ ] `SendInvitation` (every minute) — announcement invitation emails (Private/Public), flags
      CRM announcement as invited on success, via **Microsoft Graph** (legacy: Postmark).
- [ ] `ChangeOSCProfileToExpired` (gated to a 3–4 AM window + a DB-configured annual date) —
      yearly OSC-expiration sweep based on Finance-record presence.
- [ ] `SyncFileType` (every 3 min) — three sequential CRM→local catalog syncs (FileType,
      FileType-has-Country, Announcement-has-FileType).
- [ ] `ActivateAnnouncement` / `DisableAnnouncement` (every minute, CRM-only, no local DB) —
      flips Announcement status Posted→Active / Active-or-FullCapacity→Closed based on dates.
- [ ] `SyncCatalogue` (HTTP) — generic metadata-driven picklist sync engine (reads catalog
      definitions from a local table, diffs any named table against a CRM option set).
- [ ] `SendMailUpdateFinances` (hourly, same 3–4AM+annual-date gate as `ChangeOSCProfileToExpired`)
      — yearly finance-reminder sweep + email, via **Microsoft Graph** (legacy: Postmark).
- [ ] `SyncEntryFileType` (every minute) — CRM Entry-checklist sync + a "CheckListHasEntry" join
      table populate.

**Security finding, moot in the rewrite**: a Postmark API key is hardcoded in
`FunctionsDibujando`'s `App_Start/AppConfig.cs` — irrelevant once Postmark itself is dropped for
Microsoft Graph (see the global source rules), but confirms Postmark must not be reintroduced.

## Known legacy issues — carry forward as explicit decisions, not silent fixes or silent copies

Collected across this session's research. For each: either **fix it** (and say so in the PR/spec,
since "fidelity" is about behavior a user can observe, not about reproducing internal bugs) or
**replicate it deliberately** (name why) — never silently do either.

- Production DB name + a live-looking `sa` password are committed in the legacy `Web.config`
  (`EntitiesPortalDibujado` connection string) — rotate as part of Task 1 kickoff, regardless of
  which way the migration goes.
- CRM client secret hardcoded in `DynamicsConnector/Config/AppSettings.cs` — must move to real
  secret storage, never re-committed in the rewrite. (The legacy Postmark API key in
  `FunctionsDibujando/App_Start/AppConfig.cs` is moot — Postmark itself is dropped for Microsoft
  Graph, see the global source rules.)
- `FinanceController.DisableDonation` is a no-op bug (operates on an unattached blank entity) —
  fix in the rewrite.
- Several CRM writes across Announcement-lifecycle controllers use blocking `Task.Run(...).Wait()`
  — replace with real async/await or a job queue.
- IFrame-widget controllers' Referrer-based pseudo-auth is inconsistently applied (see the IFrame
  task above) — needs an explicit user decision.
- No `machineKey` configured in legacy `Web.config` — irrelevant to the rewrite directly (new
  stack, new token scheme) but explains why legacy password-reset tokens/cookies may not have
  survived app-pool recycles; not something to replicate.

## Suggested first tasks

- [ ] First: Task 0 — scaffold the monorepo, make empty-project validation pass.
- [ ] Second: Task 1 — run `/convert-engine` for the SQL Server → PostgreSQL migration.
- [ ] Third: Task 2 — auth reconstruction (login + session + roles), unblocking every other
      `[Authorize]`-gated screen.
- [ ] Fourth: the OSC registration wizard's non-CRM sections (InstitutionalBase/LegalBase/
      Government/Finance) — the first real vertical slices with zero external-integration dependency.
