# backend — shared contract

Read this for any task touching **backend** (`apps/api`). It is read by **both** the orchestrator
(to write good specs) and the executor (to build + validate). Single source of truth — keep it
small; split if it grows.

---

## Overview

`apps/api` is a NestJS service that faithfully re-implements Portal Dibujando's backend: the
ASP.NET MVC controllers (`Dibujando 1.1/PortalDibujando/Controllers/`) become NestJS
controllers/services, the EF Database-First model (`Dibujando 1.1/PortalDibujando/Models/
ModelPortalDibujando.Context.cs`) becomes the Postgres schema (Kysely, no ORM), and the
`DynamicsConnector` project's Dynamics 365 CRM integration, Azure Blob file storage, and email
(legacy: Postmark; this rewrite: **Microsoft Graph `sendMail`**, decided 2026-07-07 — real
credentials wired at the infra phase) become dedicated backend modules. See
`.claude/shared/docs/stack/typescript/backend-structure-and-conventions.md` for the language-level
conventions this must follow.

## Structure & ownership

```text
apps/api/
├── src/
│   ├── <domain>/            ← resource-not-tech modules: auth, osc, announcements,
│   │                           applications, finance, entries — one per legacy controller area
│   │   ├── <domain>.controller.ts
│   │   ├── <domain>.service.ts
│   │   ├── <domain>.repository.ts   (Kysely queries only, no business logic)
│   │   └── <domain>.schema.ts       (zod request/response shapes)
│   ├── dynamics/            ← CRM integration (OAuth + Web API calls, ported from
│   │                           DynamicsConnector/ConnectionCrm, /Querys, /Class)
│   ├── storage/             ← Azure Blob Storage (ported from Portal's file-storage Classes)
│   └── notifications/       ← Microsoft Graph email (legacy: Postmark; ported from Portal's
│                               email Classes, resending via Graph's sendMail instead)
└── db/                      ← Kysely schema + migrations (Postgres)
packages/shared/             ← zod schemas + z.infer types imported by both apps/api and apps/mobile
```

Each domain module owns its controller, service, repository, and schema — never a shared
"god" service. Status-code mappings between the portal's local integer codes and Dynamics'
optionset values (see the legacy `AppVariablesPortal.cs` / `AppSettings.cs`) live in the
`dynamics` module, not scattered across domain modules.

## Conventions

| Element    | Pattern                                                               | Example                  |
| ---------- | --------------------------------------------------------------------- | ------------------------ |
| Module     | one per legacy controller/domain                                      | `osc/`, `announcements/` |
| Endpoint   | REST, resource-named, matches legacy route's behavior (not URL shape) | `GET /osc/:id`           |
| Validation | zod schema at the controller boundary                                 | `<domain>.schema.ts`     |
| DB access  | Kysely only, in `<domain>.repository.ts`                              | no raw SQL string concat |
| CRM calls  | only from `dynamics/`, never inline in a domain service               | `dynamics.service.ts`    |

## Code patterns

```text
Controller  → validates input (zod) → calls Service
Service     → business logic + orchestrates Repository/Dynamics/Storage/Notifications calls
Repository  → Kysely queries only, returns typed rows
```

---

## Validation gate (MANDATORY)

A green build does **not** prove behavior. Every task that changes backend must pass this gate
before opening a PR:

1. **Run it.** `bash .claude/shared/scripts/dev-up.sh` (starts Postgres + `apps/api` per this
   project's dev-up script), or `pnpm --filter api dev` directly once scaffolded.
2. **Exercise what you touched.** Call each changed endpoint with real inputs (`curl` or the
   Vitest integration suite) and confirm the real expected result against the legacy behavior —
   not just "no crash." For a CRM-touching change, verify against a real (or faithfully mocked in
   dev) Dynamics 365 response, never an empty/stubbed one presented as evidence.
3. **Restore any temporary changes.** If you toggled auth/config/guards to test, restore them
   byte-for-byte and re-grep the diff to confirm they are net-zero.
4. **Record** in `.claude/dev/last-task.md` what you ran and that it returned the expected result.

## Completion criteria

- `pnpm --filter api typecheck`, `pnpm --filter api lint`, `pnpm --filter api test` all pass.
- `bash .claude/shared/checks/banned-deps.sh` passes (no ORM, no `class-validator`).
- Validation gate above passed and recorded.
- New files match the structure and conventions above (no monolithic leftovers).
- PR opened against `master`.
