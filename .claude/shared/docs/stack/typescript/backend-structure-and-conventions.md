# Backend — NestJS (typescript stack)

Concrete backend conventions. Makes [`coding-standards.md`](../../coding-standards.md) real for
the NestJS API. Read for any task touching `apps/api`. Keep small — split if it grows.

## Architecture — modular monolith, clean per module

A NestJS **module = a bounded context**. Inside each module, clean architecture in four layers;
dependencies point inward — **domain has zero Nest/infra imports**.

```text
apps/api/src/
├── modules/<context>/
│   ├── domain/           entities, value objects — plain TS, no Nest, no IO
│   ├── application/      use-case services, ports (repository interfaces), mappers
│   ├── infrastructure/   Kysely repositories, external SDK adapters (implement the ports)
│   ├── presentation/     controllers, zod schemas, guards — HTTP only
│   └── <context>.module.ts
├── shared/               cross-cutting only: config, auth guard, logging, the zod pipe
└── main.ts               bootstrap only — no logic, no hardcoded config
```

Extract a module to its own deployable container (same ingress, path routing) **only when scale
or ownership demands it** — the module boundary is the seam; don't pre-split.

## Controllers — thin, by resource

- **Thin only:** parse the request, call one service operation, shape the response. No business
  logic, no queries, no mapping beyond DTO↔HTTP.
- **Validation lives in the zod schema at the boundary** (a shared validation pipe), never as
  inline `if` checks in the handler; error→status translation lives in the **service** (return a
  result the controller maps). No `try/catch` around business calls in a controller.
- **Budget:** the uniform line budget (150/200/250 — see
  [`coding-standards.md`](../../coding-standards.md)), plus ~7 routes as a responsibility smell.
  Crossing either triggers a split, not a hard ban.
- **One controller per resource _or_ sub-resource** — `audits/:id/annexes` gets its own
  `audit-annexes.controller.ts`, not more routes on the parent.
- **NEVER a controller by technical concern.** No `pdf.controller.ts` / `export.controller.ts`
  spanning modules.
  > Anti-pattern (real, prior repo): a single `PdfController` grew to **568 lines / ~40
  > endpoints** across every module because it was organized by format, not domain. Each module
  > owns its own PDF/export endpoint.
- **Routes:** explicit kebab-case — `@Controller('api/service-stations')`.

## Services — one aggregate, composed collaborators

- **One service per aggregate root**; it **composes** child collaborators — it does not absorb
  every sub-collection's CRUD. Blob/file/email/external-SDK work moves to its own injected
  collaborator.
- **Budget:** the uniform line budget (150/200/250). Past it, split a sub-collection or an IO
  concern out; a genuinely cohesive aggregate root that still won't fit takes an approved
  exception (≤250), never a quiet return to 400.
  > Anti-pattern (real, prior repo): an aggregate service reached **824 lines** by holding the
  > root plus three sub-collections and a blob workflow. Split into composed `…AnnexService` etc.
- Services are concrete classes registered in the module; an interface only where a port
  genuinely has multiple implementations (repositories do; services usually don't).

## Data access — Kysely only, no ORM, no mapping libraries

- **No ORM.** Do **not** use Prisma, TypeORM, Sequelize, Drizzle, or MikroORM. Data access is
  **Kysely** over `pg` — a type-safe SQL builder, types generated from the DDL
  (`kysely-codegen`). The SQL stays yours; repositories in `infrastructure/` own the queries.
  Enforced by `.claude/shared/checks/banned-deps.sh` (a build failure, not a guideline).
- **Schema is plain SQL:** numbered scripts in `db/scripts/` (`001_….sql`), applied on startup
  or by a small initializer — never ORM migrations.
- **No mapping libraries** (`class-transformer`, automapper ports). Mapping is **manual**:
  `DB row → domain entity → DTO`, a small `map…()` per hop. Manual mapping fails at compile
  time, not runtime.
- **Pooling:** one `pg` `Pool` per container, sized deliberately. Few containers with real pools
  — that is the stack's answer to connection limits (see the hosting doc's sync/async rule).

## Validation & contracts — zod at the boundary

- Request/response shapes are **zod schemas**; DTO types derive via `z.infer<>` — never a
  hand-written duplicate of a schema.
- Schemas the frontend also needs (request bodies, shared payloads) live in
  **`packages/shared`** and are imported by both apps — contract drift becomes a compile error.
  Module-private schemas stay in the module's `presentation/`.
- `class-validator`/`class-transformer` decorators are **not** used — one validation idiom, not
  two. (Also enforced by `banned-deps.sh`.)

## HTTP & API style

- **REST, OpenAPI generated** from the controllers + schemas. GraphQL only if access-pattern
  variety genuinely justifies it — confirm with the user first.
- **Engine:** Nest's default Express adapter. Write platform-agnostic code (no raw `req`/`res`
  in handlers) so the **Fastify adapter is a profile-driven swap**, not a rewrite.
- **API envelope:** `{ success, data, error }` always. `error` is a structured
  `{ code, message }` (e.g. `{ "code": "post_not_found", … }`) — callers branch on the stable
  `code`, never on free text.
- **Auth:** app-managed, NOT a cloud identity provider (no Entra ID/Cognito) — this project
  faithfully replicates the legacy portal's own authentication mechanism exactly (see
  `architecture/backend.md`'s auth module once the legacy mechanism is documented from
  `AccountController.cs`). Whatever the legacy scheme turns out to be (session cookie, JWT,
  custom membership), it is validated in a **guard** — never per-handler token parsing.

## Conventions

- **One class per file**; file name = the type (`audit-program.service.ts`).
- **All identifiers English.**

| Element    | Pattern                                        | Example                   |
| ---------- | ---------------------------------------------- | ------------------------- |
| Controller | `<resource>.controller.ts`                     | `policies.controller.ts`  |
| Service    | `<aggregate>.service.ts`                       | `policy.service.ts`       |
| Repository | `<aggregate>.repository.ts` (+ port interface) | `policy.repository.ts`    |
| zod schema | `<resource>.schema.ts`                         | `create-policy.schema.ts` |
| Module     | `<context>.module.ts`                          | `policies.module.ts`      |

- **DB:** `snake_case`, `timestamptz`, numbered SQL scripts.

## Strictness — enforced mechanically

`tsconfig` ships `"strict": true` and stays that way; ESLint + Prettier run in CI
(`standards.yml`) and locally before a PR. Style is not the executor's taste. Do not weaken
compiler options per-app.

## Dependencies — framework first

Prefer what Node/Nest ships. A new third-party package must be confirmed with the user.

- **Approved (stack):** `@nestjs/*`, `kysely`, `pg`, `zod` (+ `kysely-codegen` as a dev dep).
- **Banned:** any ORM — `prisma`, `typeorm`, `sequelize`, `drizzle-orm`, `@mikro-orm/*`;
  `class-validator` / `class-transformer` (zod is the boundary). Enforced by
  `.claude/shared/checks/banned-deps.sh`.
- **Other project packages:** `TODO:` none approved yet. Likely candidates once the CRM/Blob/
  email integrations are ported (confirm with the user before adding any): `@azure/storage-blob`
  (Blob Storage), `@azure/msal-node` (Azure AD OAuth for Dynamics 365 Web API and for Microsoft
  Graph's client-credentials flow), `@microsoft/microsoft-graph-client` (email via Graph
  `sendMail` — **not** `postmark`; the legacy app uses Postmark, this rewrite uses Microsoft
  Graph instead, decided 2026-07-07, real credentials wired at the infra phase) — the Dynamics
  365 Web API calls themselves are plain HTTP/OData, matching the legacy `DynamicsConnector`'s own
  hand-rolled client, so no CRM SDK is assumed.

## Validation gate

A green `tsc` is **not** done. Before opening the PR: (1) run the API and exercise every touched
endpoint/verb against real data; (2) lint + format must be clean; (3) restore any
temporarily-removed guard byte-for-byte (re-grep the diff to confirm net-zero). Details in the
area's `architecture/<area>.md`.

## Enforced in CI

`.claude/shared/checks/file-size.sh` (the uniform 150/200/250 line budget), `.claude/shared/checks/banned-deps.sh`
(no ORM / no class-validator), and the lint + typecheck job in `standards.yml`. Any violation
fails the build.
