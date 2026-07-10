# CLAUDE.md

Guidance for Claude Code (the **orchestrator**) when working in this repository.
Read `.claude/dev/last-task.md` at the start of every session before doing anything else.

## Project overview

`mt-dibujando` is a faithful re-build of **Portal Dibujando** (a grant/announcement management
portal for OSCs — civil-society organizations — integrating Microsoft Dynamics 365 CRM, plus its
Azure Functions background worker for CRM↔SQL sync and OSC email notifications; legacy stack:
.NET Framework 4.6.1 ASP.NET MVC + Azure Functions v1 + SQL Server, available at
`/home/angel/src/Dibujando (FDUM)/Dibujando 1.1` (portal) and
`/home/angel/src/Dibujando (FDUM)/FunctionsDibujando 1.2` (worker)) on a new stack: a TypeScript
monorepo — Expo/React Native (web + iOS + Android via React Native Web) + NestJS + PostgreSQL,
hosted on Azure. **The original is the source of truth.** Its data, behavior, flow, and screens
are preserved exactly — nothing inferred or invented; when in doubt, read the original's code,
don't guess.

Fidelity is about **what**, not **how**. A ported piece reproduces the original's **every** part —
for a screen: every panel/section, control (search, filters, status chips), column, title, the
detail view, **and** the create/edit/delete forms; for an endpoint: the same inputs, outputs, and
behavior. The _implementation_ (libraries, patterns, code structure) is free to be the best
available.

**Granted adaptation — cross-platform presentation.** Because this targets web + iOS + Android,
layout/spacing/theming/animation and the choice of components MAY adapt to work across them (e.g.
native components, modal-vs-page, responsive, a shared table/calendar). Keep the **data (names,
not raw IDs), behavior, flow, and screen type** identical; adapt only the presentation. Extract
genuinely shared elements where a pattern recurs — but don't force every view into one shape.

User-facing text is Spanish (es-MX), matching the original portal's UI language; all identifiers
(code, files, commits) are English per `coding-standards.md`.

**Standing rules (faithful-transcription — keep these):**

- **Read the WHOLE original first.** Before building a screen/feature, read the _entire_ original
  page (all sub-components, not just the main table) and enumerate every panel, control, filter,
  column, title, detail view, and form — then reproduce them all.
- **Replicate the screen TYPE, adapt only presentation.** A table stays a table, a calendar a
  calendar. Use shared components where a pattern recurs, but not every view becomes a table.
- **Substance is non-negotiable; presentation is granted.** Data, action-behavior, flow, and
  screen type match the original exactly (names not IDs, full detail not a field-dump). Layout,
  animation, and components adapt for cross-platform. Implementation technique is free.
- **Deferral is for genuine blockers only — never for sequencing.** Mark a part deferred _only_
  when a real upstream gap blocks it, and **name the blocker** (and ship it disabled, not shrunk).
  If a dependency is merely missing, **build it and proceed** — never ship a thinner version to
  dodge a missing piece.
- **Verify against the original, every time.** The legacy portal is already hosted (a DEV test
  deployment — see `.claude/dev/docs/legacy-app-runbook.md`); use
  `node .claude/shared/scripts/legacy-ui-shot.mjs <path> <module>/<name> [wait-text]` to screenshot
  the real legacy screen and compare it against the rebuilt one (`ui-shot.mjs` for the new app) —
  same data, same behavior, same flow. A green build is not parity; reject spinner/empty/404
  "evidence" from either tool. Treat the legacy site as read-only — never submit a write action
  through it, screenshots and reads only.

## Standards & architecture (read before specing — both roles use these)

Shipped house standards (durable; both roles read them):

- `.claude/shared/docs/coding-standards.md` — universal principles + the decomposition method.
- `.claude/shared/docs/stack/typescript/` — concrete conventions, budgets, split recipes, anti-patterns
  (backend, frontend, hosting). A **composed** project (e.g. Expo frontend + .NET backend) keeps
  more than one `stack/<name>/` folder; each area's `architecture/<area>.md` names which
  conventions doc applies to that area.

Per-project specifics (this repo only):

- `.claude/shared/docs/architecture/backend.md` — modules, real commands, the validation gate.
- `.claude/shared/docs/architecture/frontend.md` — modules, real commands, the validation gate.

Do not restate architecture in this file. When you spec, hold the executor to the standards
(thin edges, resource-not-tech organization, the budgets) and to the area's validation gate.

## Context persistence — local vs shared (read before saving any durable note)

Durable knowledge has exactly **one home**, chosen by a single test:

> **Would any host working on this repo need it, and is it true regardless of which machine you're on?**

- **YES → shared, version-controlled.** It belongs in the repo: a top-level _rule_ goes in this
  file; **detail goes in the right `.claude/{shared,dev}/docs/*`** — `shared/docs/` for house
  standards (coding-standards, stack/, architecture/), `dev/docs/` for orchestrator working docs
  (spec-technique, a track's history). Don't bloat CLAUDE.md. Reconcile against what's already
  there: update in place, never a second copy. Reproducible machine _setup_ is shared too, but its
  home is a setup doc, not memory.
- **NO → local durable memory** (the harness's `memory/` + `MEMORY.md`). Only genuinely
  host-specific, non-reproducible state lives here (a one-off local path, an installed version, a
  transient PID/cred location). This never reaches another host — keep it minimal.

Local memory does **not** travel with the repo; treating repo knowledge as memory strands it on one
machine (this is why a fresh host starts blind). When in doubt, it's shared. The harness may still
prompt to write durable facts to local memory — for **shared** facts, prefer the checked-in home
anyway.

Persist via the **`update-context` skill** (classifies + routes one fact, or sweeps the session);
**`handoff` runs it automatically**. Both skills reference this test — never restate it elsewhere.

## Role: orchestrator

You plan, write specs, and evaluate. You do **not** write production code, and you never
`git commit` or `git push`.

| System                             | Role                        | Context file |
| ---------------------------------- | --------------------------- | ------------ |
| **Claude**                         | planning, specs, evaluation | `CLAUDE.md`  |
| **Coding agent** (`opencode-kimi`) | code execution, PRs         | `AGENTS.md`  |

Active executor is set in `.claude/shared/agent-config`.

### Task loop

1. **Spec** — write the `## Current Task` body to a file, then `bash .claude/dev/scripts/set-task.sh
<file>` (swaps just that section of `AGENTS.md`). Instructions, not implementations.
2. **Invoke** — `bash .claude/shared/scripts/run-agent.sh` as its **own** Bash command (never chain
   it after a heredoc — `codex exec` hangs on inherited stdin).
3. **Execute** — the agent reads `AGENTS.md`, loads the relevant area doc, codes, validates
   (`bash .claude/shared/scripts/validate.sh`), opens a PR (`bash .claude/shared/scripts/finish-task.sh`),
   writes `.claude/dev/last-task.md`.
4. **Evaluate** — read `last-task.md`; `bash .claude/dev/scripts/wait-ci.sh <N>` for CI; **review any
   screenshot for REAL rendered data** (reject spinner/empty/404 shots); then
   `bash .claude/dev/scripts/merge-pr.sh <N>` to merge + delete branch + sync.
5. **Checkpoint** — summarize and pause. Always. No auto-advance.
6. **Continue** — the user decides.

**Helper scripts.** Orchestrator (`.claude/dev/scripts/`): `set-task.sh <file>` (swap Current Task),
`wait-ci.sh <N>` (poll CI), `merge-pr.sh <N>` (merge + delete-branch + sync — uses `gh pr merge`,
allowed; it does **not** `git commit`/`push`). Executor (`.claude/shared/scripts/`): `new-branch.sh`,
`validate.sh`, `ui-shot.mjs`, `finish-task.sh` — catalogued in `AGENTS.md`. If the executor is
`codex`, `.claude/dev/scripts/codex-usage.sh` / `codex-spark-usage.sh` read its rate-limit caps;
otherwise delete them.

### Strictly enforced rules

- **Git discipline.** Never `git commit`/`git push`. Allowed: `git status`, `git log`,
  `git pull`, `git checkout`, `git branch -d`, `gh pr` view/checks/merge. After an executor PR,
  **never switch to `master` by hand** — `merge-pr.sh` owns the checkout-main + pull
  transition (post-merge, so it's safe). Hand-switching a shared checkout while work lives only on
  the feature branch churns the tree (and can strip the `.claude/**` tooling from disk).
- **Spec discipline.** Write every `## Current Task` in the shape defined in
  `.claude/dev/docs/spec-technique.md` (required core: **Goal** + **Given-When-Then Acceptance**
  tied to the validation gate). Include only what the agent cannot derive — file names,
  mappings, non-obvious rules; point at source files, never transcribe them. Flag any ambiguity
  as `[NEEDS CLARIFICATION: …]` rather than guessing. For an **editor-only executor** (aider),
  point via `Read:`/`Edit:` lines (see spec-technique.md's aider section) — they become the
  agent's chat attachments; a file it isn't given, it hallucinates.
- **One task at a time.** Everything under `## Current Task` is overwritten each cycle.
- **Reuse before build.** Confirm the capability/data doesn't already exist before specing
  new work; prefer extending an existing path.
- **Provide deterministic scripts yourself.** Repeatable, **deterministic** processes become
  `.claude/{shared,dev}/scripts/` helpers (`shared/` if the executor or CI runs them, `dev/` if only
  you do) that **you** (the orchestrator) author and provide — never the
  executor: it sees only its one task, lacks the project-wide context to spot them, and must not
  be pulled off its purpose. You hold the general context, so this detection is yours. Decide
  _with the user_ whether each is worth scripting; mechanical enforcement over prose (the recipe's
  own scripts came from exactly this). Pragmatic bar: add one **only** if it is genuinely
  deterministic and reliable; if the process needs judgment or isn't guaranteed reproducible,
  leave it as prose — don't manufacture a script that can't hold the line.
- **Validation is mandatory.** Each area doc defines how a change there is proven to work.
  Spec the task so the agent must run that gate — a green build alone is never "done."
- **Blocker handling.** If `last-task.md` is `blocked` or CI fails, surface details and stop. An
  editor-only executor that produced no deliverable self-reports `blocked` with no PR (run-agent's
  guard) — re-spec (inline the facts, attach the right `Read:`/`Edit:` files) and drop the stale
  `feature/<task-id>` branch before re-invoking; don't hand-patch its code.

### Resuming a new session

1. Read `.claude/dev/last-task.md`.
2. If an agent PR is open, merge it: `bash .claude/dev/scripts/merge-pr.sh <N>`
   (squash + delete-branch + sync `master`).
3. Write the next `## Current Task` (via `bash .claude/dev/scripts/set-task.sh <file>`) and invoke
   the agent.

## DB conversion (Task 1 — SQL Server → PostgreSQL)

Grafted from `ai-db-engine-conversion` (see `/home/angel/src/mt-ai-tools/ai-db-engine-conversion/`)
onto this repo's existing ai-collab-pattern loop — conversion tasks flow through the same
`## Current Task` slot in `AGENTS.md`, evaluated the same way. Method:
`.claude/docs/db-conversion/method.md`; artifact contracts: `.claude/docs/db-conversion/artifacts.md`;
dialect mapping: `.claude/docs/db-conversion/flavor/sqlserver-to-postgresql.md`. Direction:
**sqlserver → postgresql** only.

Hard rules, on top of the general ones above:

- **Fidelity is the law.** The target is the source schema in another dialect — one table per
  table, one column per column, same names/nullability/keys/indexes. No renames, no
  denormalization, no "improvements." That is a separate engagement, after this one is green.
- **Read-only source.** Neither the source database nor the app source tree is ever modified;
  `bash .claude/checks/readonly-guard.sh` enforces it (fails the task on any diff outside
  `.claude/`). All conversion writes go under `.claude/db-conversion/`.
- **Nothing dropped silently.** Every unmapped feature in phase 2's report is a decision made
  **with the user**, recorded — never an executor substitution or omission.
- **Artifacts are immutable** (`.claude/db-conversion/manifest.json` seals each one); a wrong
  artifact means re-running its phase with `--force`, never a hand edit — and invalidates
  downstream phases.
- **Verify, don't trust.** Sign-off only on a green phase-5 parity report (row counts + checksums
  - aggregates) or with each discrepancy explicitly accepted and recorded.

Source for this conversion: a local Dockerized SQL Server (`dibujando-legacy-src`, container port 14330) restored from a `.bacpac` the user supplied (`DB-Prod-PortalDibujando-Migration.bacpac`) —
not a live/VPN connection (none was available; Azure was intentionally not used to look for one,
per the user). The pipeline connects via a dedicated read-only login (`dbconv_reader`,
`db_datareader` + `VIEW DEFINITION` only) — credentials in `CLAUDE.local.md`. Restored table count
(63) matches the tracker's known-facts count exactly, a first parity signal before phase 1 even
runs.

---

## Current focus

The full rebuild plan lives in
[`.claude/shared/docs/rebuild-task-breakdown.md`](.claude/shared/docs/rebuild-task-breakdown.md) —
read it before speccing anything; this section just points at where to start. Hosting/infra is
deferred (local-first); CI runs on the self-hosted runner fleet from day one (see
`.github/workflows/standards.yml`).

**Task 0 is done** (monorepo scaffold — PR #1, merged 2026-07-07; see the tracker for what
landed, including a CI/runner-fleet bootstrap gap found and fixed along the way). **Task 1 is
in progress**: the `ai-db-engine-conversion` pipeline is grafted (see "## DB conversion" above);
**phase 1 (extract)** and **phase 2 (translate)** are both done, sealed, and merged (PR #4) — 63
tables → DDL verified to apply cleanly against a real PostgreSQL 16 instance. **Next: the
orchestrator+user must review phase 2's flags before phase 3** — 3 index-name-collision renames
(mechanical, already applied in the DDL, just need sign-off) and 55 flagged `aspnet_*` stored
procedures (T-SQL → PL/pgSQL, each needs a human decision on whether/how to port). See the
tracker's Task 1 section for the full detail, including two real pipeline bugs found in each
phase (fixed locally, not yet upstreamed to `mt-ai-tools`) and a corrected assumption — 55 stored
procs exist, not zero. Then **Task 2** (auth
reconstruction replicating the legacy ASP.NET Identity/OWIN/CustomAuthorize mechanism exactly —
**no EntraID**, decided explicitly with the user), then the feature tracks (OSC registration
wizard, Document/File management, Announcement lifecycle, User admin, IFrame widgets, CRM
integration, FunctionsDibujando's background jobs) in the order the tracker lists them.

A deep research pass (this session, 2026-07-07) already read the legacy controllers, DB schema,
auth mechanism, and CRM surface in full — the tracker summarizes findings per task, including
known legacy bugs/security issues to fix-not-port (hardcoded secrets, a `Task.Run(...).Wait()`
anti-pattern, an inconsistent CRM-iframe auth check, a no-op `DisableDonation` bug). Re-verify
against the real legacy file when speccing — the summaries are a map, not a replacement for
reading the source per the standing "read the whole original first" rule.

<!-- Keep this section tight. Archive finished work to .claude/dev/docs/<track>-history.md and
     leave only a one-line pointer here. Run the handoff skill at track/session boundaries. -->
