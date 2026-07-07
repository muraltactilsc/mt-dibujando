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

---

## Current Task — task-0-scaffold

Goal: Stand up the pnpm/Turborepo monorepo skeleton (`apps/mobile`, `apps/api`,
`packages/shared`) with baseline manifests, strict TypeScript, local Postgres via Docker
Compose, and a passing empty-project validation gate — the foundation every later task builds
on. Nothing beyond the ai-collab-pattern machinery exists in this repo yet: no `apps/`, no
`packages/`, no root `package.json`.

References:

- `.claude/shared/docs/stack/typescript/repo-and-delivery.md` — monorepo layout, pnpm +
  Turborepo, one script-name set per workspace (`build`/`lint`/`typecheck`/`test`/`format:check`).
- `.claude/shared/docs/stack/typescript/backend-structure-and-conventions.md` — `apps/api`
  internal layout (`modules/<context>/{domain,application,infrastructure,presentation}`), Kysely
  (no ORM), zod at the boundary.
- `.claude/shared/docs/stack/typescript/frontend-structure-and-conventions.md` — `apps/mobile`
  layout (`app/` Expo Router routes, `src/{api,auth,state,features,components,hooks}`).
- `.claude/shared/docs/architecture/backend.md` / `architecture/frontend.md` — this repo's
  module list and validation gates.
- `.claude/shared/scripts/validate.sh` — the exact gate this task must pass (already written,
  do not modify): `pnpm run format:check`, `pnpm turbo run build lint typecheck test`, then the
  three house checks (`file-size.sh`, `banned-deps.sh`, `no-raw-fetch.sh`).
- `.claude/shared/scripts/dev-up.sh` — already written ahead of the scaffold; expects
  `docker compose up -d db`, `apps/api` on `$API_PORT` (default 3000) with a `/health` route,
  and `apps/mobile` web target on `$WEB_PORT` (default 8081) via `pnpm --filter mobile web`.
  Verify your scaffolded scripts/ports actually match these defaults; adjust `dev-up.sh` if you
  deliberately pick different ones (name the change in your PR).
- `.github/workflows/standards.yml` — CI already expects `pnpm install --frozen-lockfile` then
  `pnpm turbo run lint typecheck` to work once `turbo.json` exists — so a committed
  `pnpm-lock.yaml` is required.

Node.js v24 (LTS), pnpm (via corepack), and Docker + Docker Compose v2 are already installed and
on `PATH` on this machine — no environment setup needed, just build the workspace.

Requirements:

- FR-1: Root `package.json` (private, pnpm workspaces), `pnpm-workspace.yaml` (`apps/*`,
  `packages/*`), `turbo.json` (pipeline for `build`, `lint`, `typecheck`, `test`,
  `format:check`, with sane `dependsOn`/caching), and a strict root `tsconfig.base.json`
  (`strict: true`, and whatever else the backend/frontend docs call for) that each workspace
  `tsconfig.json` extends.
- FR-2: `apps/api` — a minimal NestJS app scaffolded per `backend-structure-and-conventions.md`'s
  module shape (a `shared/` cross-cutting folder is fine to stub empty), with one real module
  proving the shape end-to-end: a `health` module (`GET /health` → `{ success: true, data: {
status: "ok" } }`, matching the backend doc's envelope convention) — this is what
  `dev-up.sh`'s health-wait polls. Kysely + `pg` wired for a Postgres connection (connection
  string from env), but no schema/tables yet (Task 1 owns the real schema) — a
  `db/` folder with just the Kysely `Database` interface stub and a pool setup is enough.
- FR-3: `apps/mobile` — a minimal Expo Router app scaffolded per
  `frontend-structure-and-conventions.md`'s folder shape (`app/_layout.tsx` with a React Native
  Paper `PaperProvider` + TanStack Query `QueryClientProvider`; `src/{api,auth,state,features,
components,hooks}` present, even if only `api/client.ts` has real content — the one
  authenticated client stub, no other network calls yet). One real route (`app/index.tsx`)
  rendering a placeholder screen from `src/features/` so the web target has something to render.
- FR-4: `packages/shared` — a zod-based contracts package (empty schema barrel file is fine for
  now) that both `apps/api` and `apps/mobile` import as a workspace dependency, proving the
  wiring (e.g. re-export one trivial schema and consume it from both apps).
- FR-5: Baseline manifests only — NestJS, Expo, React Native Paper, Kysely, `pg`, zod, TanStack
  Query, Zustand, React Hook Form (+ `@hookform/resolvers`), `kysely-codegen` (dev dep). ESLint +
  Prettier (per `repo-and-delivery.md` — pick this over Biome unless you have a strong reason,
  and if you do pick Biome instead, say so explicitly in the PR since it changes the `lint`/
  `format:check` toolchain for every future task). Vitest as the one test runner for both apps.
  Do **not** add any package beyond this list (including anything from backend.md's "Other
  project packages: TODO" — Azure Blob/MSAL/Graph clients are for later tasks) without asking.
- FR-6: Root `docker-compose.yml` with a `db` service (Postgres, a pinned version tag, a named
  volume, host port mapped so `dev-up.sh`'s `docker compose up -d db` works unmodified) — this is
  the LOCAL dev database only, empty schema (Task 1 migrates real data into it later).
- FR-7: `pnpm run format:check`, `pnpm turbo run build lint typecheck test`, and the three house
  checks (`file-size.sh`, `banned-deps.sh`, `no-raw-fetch.sh`) all pass on this empty-but-real
  scaffold.
- FR-8: Install Playwright's Chromium (`npx playwright install chromium`) so both this repo's
  (not-yet-written) `ui-shot.mjs` and the already-written `.claude/shared/scripts/legacy-ui-shot.mjs`
  have a browser available from here on.

Acceptance (Given-When-Then):

- Given a fresh clone of this branch, When running `pnpm install --frozen-lockfile`, Then it
  completes with a committed `pnpm-lock.yaml` (matches what CI's `ts-quality` job does).
- Given the workspace installed, When running `bash .claude/shared/scripts/validate.sh`, Then it
  passes end-to-end (format, build, lint, typecheck, test, and all three house checks) with no
  manual fixes.
- Given `docker compose up -d db` has been run, When `apps/api` starts
  (`pnpm --filter api dev` or via `dev-up.sh`) and connects to Postgres via the Kysely pool,
  Then `curl http://localhost:3000/health` returns `{"success":true,"data":{"status":"ok"}}`
  (or your chosen envelope shape — just document it) with a 200.
- Given `apps/api` is up, When running `pnpm --filter mobile web` (or `dev-up.sh --web`), Then
  the Expo web target renders the placeholder screen at `http://localhost:8081` with no error
  overlay — capture this with a screenshot proving real rendered content, not a blank/loading
  page (Playwright is now installed per FR-8; a minimal one-off screenshot script under
  `.claude/shared/scripts/` is acceptable here since this repo's own `ui-shot.mjs` doesn't exist
  yet — note in the PR if you added it as a placeholder for a later task to formalize).
- Given `packages/shared`'s one trivial schema, When imported from both `apps/api` and
  `apps/mobile`, Then both typecheck against the same inferred type with no duplicated
  declaration.

Out of scope:

- Task 1 (the real Postgres schema / SQL Server data migration) — `db/` here is a stub only.
- Task 2 (auth) — no login screen, no session logic; `src/auth/` and the backend's future auth
  guard stay empty stubs.
- Any feature screen/controller from the legacy portal — this task is pure scaffolding.
- `infra/` (Terraform) — hosting/infra is deferred repo-wide (local-first); do not add it.
- Filling in `dev-up.sh`'s `seed-db.sh` TODO — no schema exists yet to seed.
- Any package not explicitly listed in FR-5.
