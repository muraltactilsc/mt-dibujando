# Hosting — Azure (typescript stack)

> **DEFERRED.** Hosting/infra was explicitly deferred at bootstrap for a local-first start. No
> Azure resources exist yet; the values below (`<subscription-id>`, `<resource-group>`, etc.) are
> illustrative only. Do not provision anything from this doc without confirming with the user
> first — revisit once the core portal screens have a working local vertical slice.

The cloud layer of the typescript stack. The code layers (Expo, NestJS, Kysely) and
[`repo-and-delivery.md`](repo-and-delivery.md) are cloud-neutral; this doc is the Azure binding.
Retargeting to AWS = swapping this file for `aws-hosting-infrastructure.md` (the service
mapping lives in `repo-and-delivery.md`).

## Hosting model

| Concern            | Service                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API compute (sync) | Azure Container Apps behind built-in ingress (App Gateway only if WAF/path rules demand it)                                                                                                                                                                                                                                                                                                                           |
| Async / scheduled  | Azure Functions + Storage Queues / Service Bus; timer triggers for schedules — fire-and-forget only                                                                                                                                                                                                                                                                                                                   |
| Database           | Azure Database for PostgreSQL — Flexible Server                                                                                                                                                                                                                                                                                                                                                                       |
| Cache              | Azure Cache for Redis                                                                                                                                                                                                                                                                                                                                                                                                 |
| Identity           | **App-managed, not an external IdP.** Faithful-transcription decision (2026-07-07): Entra ID/External ID is explicitly NOT used — auth is rebuilt exactly as the legacy portal implements it (see `architecture/backend.md`'s auth section once the legacy mechanism is documented), backed by the migrated `UserProfile` table. No `expo-auth-session`/OAuth redirect flow unless the legacy system itself uses one. |
| Web hosting        | Azure Static Web Apps (Expo web static export)                                                                                                                                                                                                                                                                                                                                                                        |
| File storage       | Blob Storage — SAS tokens issued by the API, never public containers                                                                                                                                                                                                                                                                                                                                                  |
| Container registry | ACR                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Secrets / config   | Key Vault + App Configuration — never in tracked config                                                                                                                                                                                                                                                                                                                                                               |
| DNS / TLS          | Azure DNS + managed certs (Front Door / Static Web Apps)                                                                                                                                                                                                                                                                                                                                                              |
| Email / push       | **Microsoft Graph `sendMail`** (decided 2026-07-07 — replaces legacy Postmark; app-registration/credentials configured at the infra phase, alongside the rest of this DEFERRED table); mobile push via Expo Push                                                                                                                                                                                                      |
| WAF / edge         | Front Door WAF (or App Gateway WAF)                                                                                                                                                                                                                                                                                                                                                                                   |
| IaC                | Terraform, in `infra/` — not Bicep; portability with the AWS flavor is the point                                                                                                                                                                                                                                                                                                                                      |

## The sync/async rule (why two compute services)

**Anything a user waits on → the container (Container Apps). Fire-and-forget and scheduled →
Functions.** This avoids the two classic serverless failures against Postgres: connection
exhaustion (every concurrent Function opens its own connection) and cold starts on interactive
paths. Corollary: **few containers with real `pg` pools** — no PgBouncer until profiling
demands it.

Extract a NestJS module to its own Container App (same ingress, path routing) only when scale
or ownership demands it — the module boundary inside the monolith is the seam.

## Conventions

- **Resource names:** kebab-case, env-suffixed — `ca-dibujando-api-dev`, `appi-dibujando-dev`.
- **Config:** the local/dev profile boots without cloud RBAC (local Postgres, no Azure calls).
  Secrets only in `CLAUDE.local.md` (git-ignored) for local work, Key Vault for deployed.
- **No secrets in tracked files. Ever.** Validation overrides are passed by env var for the run
  only, never committed.
- **Managed Identity + RBAC:** containers and Functions use Managed Identity; no secrets in
  connection strings where MI works.

## Diagnostics

Prefer **Application Insights** (KQL; OpenTelemetry-native) for after-the-fact errors/requests;
container logs for live tailing.

```bash
# History / search / aggregation — App Insights (use -o json; read .tables[0].rows)
az monitor app-insights query --subscription <subscription-id> \
  -g <resource-group> --app <appinsights-name> -o json \
  --analytics-query "exceptions | where timestamp > ago(1d) | project timestamp, type, outerMessage, operation_Name | order by timestamp desc"

# Real-time — container console (immediate; App Insights lags ~1–5 min)
az containerapp logs show --name <api-container-app> -g <resource-group> --type console --tail 200
```

> Gotcha: use `-o json` and read `.tables[0].rows`. `-o table` renders blank for many
> grouped/empty-looking results — the data is there; the renderer hides it.

## Deploy-time validation

Infra/deploy tasks change money-costing, hard-to-reverse resources. Confirm cloud decisions
(SKU/tier, capacity, what to provision) with the user **before** `terraform apply`, then
validate the deployed endpoint and check App Insights for exceptions after rollout.
