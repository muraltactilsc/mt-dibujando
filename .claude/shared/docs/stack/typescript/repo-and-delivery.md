# Repo & delivery — monorepo, CI, releases (typescript stack)

How the TypeScript stack's repo is laid out, built, and shipped. Cloud-agnostic — everything
here is identical on AWS and Azure; only the hosting doc changes.

## Monorepo layout

```text
apps/mobile        Expo app (iOS / Android / Web)
apps/api           NestJS API
packages/shared    contracts: zod schemas + z.infer types BOTH apps import
infra/             Terraform (the cloud bindings — see the hosting doc)
```

- **`packages/shared` is the contract layer.** A request/response shape lives there **once**:
  the API validates with the schema, the app's forms resolve against it, both import the
  inferred type. Never copy a type across apps — drift must be a compile error, not a runtime 404. This is the main payoff of full TypeScript; protect it.
- Single root `CLAUDE.md` / `AGENTS.md` — agent conventions live at the root only, never
  per-app copies that drift.
- **Composed flavor (Expo + .NET backend):** the .NET API lives outside the pnpm/Turborepo
  workspace (its own `apps/api` project, built by `dotnet`), so there is **no** `packages/shared`
  spanning the boundary. The contract crosses via the API's **OpenAPI** document → a generated
  TS client in the app (see the frontend doc's contract-seam note). `validate.sh` runs the TS
  workspace **and** the `dotnet` build/test (it detects both); CI path-gates them separately.

## Orchestration — Turborepo + pnpm

- **pnpm workspaces** + **Turborepo** for task running (`turbo run build lint typecheck test`)
  with caching. Start here; move to Nx only if affected-graph detection genuinely becomes
  necessary — don't pre-buy the complexity.
- Every workspace exposes the same script names (`build`, `lint`, `typecheck`, `test`, plus
  `format:check`) so the pipeline, CI, and `.claude/shared/scripts/validate.sh` stay uniform.

## Lint/format & tests — one toolchain each

- **Lint + format:** **ESLint + Prettier** is the stack default; CI runs them via `lint` +
  `format:check`. **Biome** (one tool for both lint and format) is a viable single-tool
  alternative a project may adopt instead — if it does, it _replaces_ ESLint **and** Prettier and
  owns the `lint`/`format:check` scripts. Never run both toolchains; pick one.
- **Tests — one runner across the monorepo:**
  - **Vitest** — unit/integration for both `apps/api` and `apps/mobile` (the `test` script).
  - **React Native Testing Library** — component tests for the Expo app.
  - **Maestro** — end-to-end flows against the web target and native simulators.

## CI — GitHub Actions, path-gated

- `dorny/paths-filter` gates per-app workflows: an `apps/mobile`-only change does not build the
  API, and vice versa. `packages/shared` changes trigger **both** — the contract touched both
  sides by definition.
- The standards job (`.github/workflows/standards.yml` — file sizes, banned deps, raw-fetch,
  lint + typecheck) always runs; it is the floor, not a path-gated extra.

## IaC — Terraform

Terraform in `infra/`, whichever cloud — that is what makes the cloud a swappable layer. Remote
state; plan in CI, apply deliberately. Cloud decisions that cost money (SKUs, tiers, what to
provision) are confirmed with the user **before** apply — see the hosting doc.

## Mobile release — EAS

- **EAS Build + EAS Submit** for store binaries; **EAS Update** for over-the-air JS updates.
- The split that matters: **JS-only changes ship OTA** via EAS Update; anything touching native
  modules/config requires a new store build — bump `runtimeVersion` and say so in the PR.
- The web target deploys as a static export to the hosting in the cloud doc (S3+CloudFront /
  Static Web Apps).

## Config & secrets

- Per-app non-secret config in checked-in `.env` examples; real values per environment.
- **No secrets in tracked files. Ever.** Local secrets in `CLAUDE.local.md` (git-ignored);
  deployed secrets in the cloud secret store (see the hosting doc). Validation overrides are
  passed by env var for the run only, never committed.

## Portability — AWS ↔ Azure service mapping

Everything above the infra line (Expo, NestJS, Kysely, Terraform, GitHub Actions) is identical
on both clouds; only the bindings change. The mapping when retargeting:

| Concern            | AWS                  | Azure                          |
| ------------------ | -------------------- | ------------------------------ |
| Containers (API)   | ECS Fargate + ALB    | Container Apps (+ App Gateway) |
| Serverless (async) | Lambda               | Functions                      |
| Queue              | SQS                  | Service Bus / Storage Queues   |
| Event bus          | EventBridge          | Event Grid                     |
| PostgreSQL         | RDS / Aurora         | PostgreSQL Flexible Server     |
| Redis              | ElastiCache          | Azure Cache for Redis          |
| Identity           | Cognito              | Entra External ID              |
| Static web         | S3 + CloudFront      | Static Web Apps / Front Door   |
| Object storage     | S3                   | Blob Storage                   |
| Secrets            | Secrets Manager      | Key Vault                      |
| Config             | SSM Parameter Store  | App Configuration              |
| Registry           | ECR                  | ACR                            |
| Logs / APM         | CloudWatch (+ X-Ray) | Monitor + App Insights         |
| CDN / WAF          | CloudFront + WAF     | Front Door + WAF               |
