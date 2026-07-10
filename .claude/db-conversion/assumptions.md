# Closed-world declaration — SQL Server → PostgreSQL conversion

Recorded 2026-07-10, per `ai-db-engine-conversion`'s required interview (SETUP.md step 3).

## Direction

`sqlserver → postgresql` (the only shipped direction). Source detected from the legacy app's
`Web.config` (`System.Data.SqlClient`, T-SQL DDL) — confirmed with the user.

## Source

Not a live/VPN connection to the real production or DEV SQL Server (none was available; Azure
was deliberately not used to hunt for one, per explicit user instruction). Source is a local
Dockerized SQL Server 2022 container (`dibujando-legacy-src`, host port 14330) restored from
`DB-Prod-PortalDibujando-Migration.bacpac`, a real export the user supplied (placed in
`~/Downloads`, not committed anywhere). Restore verified: 63 tables (matches
`rebuild-task-breakdown.md`'s Task 1 known-facts count exactly). The pipeline connects with a
dedicated read-only login (`dbconv_reader` — `db_datareader` + `VIEW DEFINITION` only, no write
grants); credentials in `CLAUDE.local.md`, referenced by env var from `config.json`.

## In-DB code — is it all in the catalog?

**Yes, all in the catalog** (user-confirmed). Catalog scan found:

- 55 stored procedures — **all** `aspnet_*` (the stock ASP.NET SQL Membership/Role/Profile
  Provider, pre-dating ASP.NET Identity). The legacy app's real auth is ASP.NET Identity 2.x
  (`AccountController.cs`/`IdentityConfig.cs`), which never calls these — near-certainly dead
  schema, left over from an earlier `aspnet_regsql`-provisioned membership DB. Flagged to the
  user; **decision: convert them anyway** (see Out-of-scope below) for strict fidelity, not
  pruned as dead weight.
- 1 view, 0 user-defined functions, 0 triggers, 0 check constraints, 0 computed columns, 0
  sequences, 0 user-defined CLR assemblies.

No out-of-band SQL (deploy scripts, ad-hoc migrations applied outside the DB) — nothing goes into
`config.extra_sources`.

## Out-of-catalog schema

**None** (user-confirmed) — no SQL Agent jobs, no linked-server objects, no SSIS/ETL packages, no
external app reads/writes this schema directly. (SQL Agent jobs are server-level and would never
appear in a bacpac regardless — the user directly confirmed none exist on the real server, not
just "none visible here.")

## Out-of-scope (tables/objects intentionally NOT converted)

**None.** The 55 `aspnet_*` stored procedures were raised as a candidate (confirmed-unused legacy
Membership-provider boilerplate) but the user chose **"convert anyway"** — full 1:1 fidelity over
pruning dead schema. Phase 5 parity must therefore account for all 63 tables + 55 procs + 1 view;
nothing is exempted from the parity report.

## Known schema facts carried into phase 2 (from prior source-read research — re-verify against
phase 1's actual output, don't just trust this list)

- 7 columns that look like FKs but have no declared referential constraint:
  `AnnouncementHasFileType.AnnouncementId`, `FileType.PeriodValidityId`,
  `FileType.FileEligibilityId`, `Finance.OSCProfileId`,
  `OSCHasAnnouncementFile.AnnouncementApplicationId`,
  `OSCHasDownloadFile.AnnouncementApplicationId`, `UserProfile.FileId` — migrate as-is (identical
  replica means identical, including its gaps); phase 2 review decides whether to flag these for
  a future (separate) schema-improvement engagement, never silently added as new constraints here.
- Non-conforming audit-column names on 2 tables (`LegalBase`: `UserCreated`/`UserUpdatedId`;
  `VolunteerActivities`: `UserCreatedId`) instead of the universal `UserCreateId`/`UserUpdateId` —
  migrate verbatim, no renames.
- No standalone "Announcement" table — announcements live only in Dynamics CRM; SQL Server only
  has `Dynamics*Id` string columns on `AnnouncementApplication`/`AnnouncementStatus`/
  `AnnouncementHasFileType`. Out of this conversion's scope by nature (there's no such table to
  convert), not a declared exclusion.
- `AspNetUsers`/`AspNetRoles`/`AspNetUserClaims`/`AspNetUserLogins`/`AspNetUserRoles` are in-scope
  (Task 2's auth rebuild reads the migrated data).
