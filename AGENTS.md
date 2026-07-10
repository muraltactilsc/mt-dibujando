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

## Current Task — db-conversion-phase2-translate

Goal: Run phase 2 (translate) of the grafted `ai-db-engine-conversion` pipeline — turn the sealed
phase-1 SQL Server schema facts into PostgreSQL DDL plus an unmapped-feature report — without
resolving any flagged item yourself.

References:
- `.claude/docs/db-conversion/method.md` — the pipeline method.
- `.claude/docs/db-conversion/artifacts.md` — artifact shapes/contracts.
- `.claude/docs/db-conversion/flavor/sqlserver-to-postgresql.md` — the type/feature mapping phase 2
  applies (read this to understand what a FLAG means, not to hand-write DDL yourself).
- `.claude/db-conversion-pipeline/phase2_translate.py` — the script to run. **Read-only — do not
  edit it.**
- `.claude/db-conversion/config.json` / `assumptions.md` — this conversion's config and recorded
  interview answers (out_of_scope is empty; the 55 `aspnet_*` procs are in-scope per the user's
  decision).

Requirements:
- FR-1: Run exactly:
  `.claude/db-conversion-pipeline/.venv/bin/python .claude/db-conversion-pipeline/phase2_translate.py --config .claude/db-conversion/config.json`
  Do not modify the script, and do not hand-edit any file it writes under `.claude/db-conversion/phase2/`.
- FR-2: After it runs, confirm both `bash .claude/checks/readonly-guard.sh` and
  `bash .claude/checks/artifact-schema.sh` pass.
- FR-3: `last-task.md`'s summary must report the script's own headline numbers verbatim (tables
  translated to DDL, unmapped-feature count, in-DB object/flag counts, how many need review) — not
  a paraphrase, and not your own assessment of whether the flags are OK to proceed with.

Acceptance (Given-When-Then):
- Given phase 1's sealed artifacts (`schema.json`/`objects.json`/`baseline.json`) exist, When
  phase2_translate.py is run with the repo's `config.json`, Then
  `phase2/target/ddl/{001_schemas,010_tables,020_constraints,030_foreign_keys,040_indexes}.sql`,
  `phase2/unmapped_features.json`, and `phase2/flag_manifest.json` are written and their hashes
  appear in `.claude/db-conversion/manifest.json`.
- Given the script has run, When `bash .claude/checks/readonly-guard.sh` is run, Then it prints
  "✓ source untouched".
- Given the script has run, When `bash .claude/checks/artifact-schema.sh` is run, Then it prints
  "✓ ... sealed artifact(s) intact" with no missing/mismatched entries.

Out of scope: Resolving any entry in `unmapped_features.json` or `flag_manifest.json` — that
review happens next, with the orchestrator and the user together, per `method.md`'s phase-2-review
step. Do not run phase 3. Do not touch anything outside `.claude/db-conversion-pipeline/`'s own
venv invocation and `.claude/db-conversion/`'s output paths — same read-only-on-source discipline
as phase 1.
