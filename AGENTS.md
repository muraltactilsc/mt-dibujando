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

## Current Task — db-conversion-phase5-verify

Goal: Run phase 5 (verify) — the parity gate that decides whether the SQL Server → PostgreSQL
migration is actually done, not just "ran without errors."

References:

- `.claude/docs/db-conversion/method.md` — phase 5's definition.
- `.claude/docs/db-conversion/artifacts.md` — `parity_report.json` shape.
- `.claude/db-conversion-pipeline/phase5_verify.py` — the script to run. **Read-only — do not
  edit it.**
- `CLAUDE.local.md` — `DBCONV_TARGET_DB` connection string (this run only needs the target;
  `config.json`'s `verify.row_hash` is `false`, so the script won't open a source connection).
- `.claude/db-conversion/phase1/baseline.json` — the source-of-truth baseline phase 5 compares
  against (already sealed from phase 1; do not regenerate it).

Requirements:

- FR-1: Export `DBCONV_TARGET_DB` from `CLAUDE.local.md`, then run exactly:
  `.claude/db-conversion-pipeline/.venv/bin/python .claude/db-conversion-pipeline/phase5_verify.py --config .claude/db-conversion/config.json`
  Do not modify the script. The target container (`mt-dibujando-dbconv-target`) must be running
  first — check with `docker ps`; start it if needed (`docker start mt-dibujando-dbconv-target`),
  never recreate it (would lose the phase-4 migrated data).
- FR-2: **Follow the full task loop exactly, in order** — `new-branch.sh` first, then the work,
  then `validate.sh`, then `finish-task.sh` to open a real PR. (A prior task in this same
  conversion skipped the branch/PR steps and had to be redone — do not repeat that.)
- FR-3: If the script exits nonzero (parity FAILED), do **not** try to fix data or hand-edit
  `parity_report.json` — write `status: blocked` in `last-task.md` with the exact mismatches from
  the report and stop. A failing parity report is real information, not an error to paper over.
- FR-4: If it succeeds, confirm `bash .claude/checks/readonly-guard.sh` and
  `bash .claude/checks/artifact-schema.sh` both pass.
- FR-5: `last-task.md`'s summary must report the script's own headline line verbatim (tables
  matched out of total).

Acceptance (Given-When-Then):

- Given the target has the phase-4 migrated data, When phase5_verify.py runs, Then it writes
  `.claude/db-conversion/phase5/parity_report.json` with one entry per table.
- Given the report is written, When `all_match` is inspected, Then it is `true` and every table's
  `match` is `true` — if not, the task reports `status: blocked` with the specific diffs, not
  `status: done`.
- Given parity succeeded, When `readonly-guard.sh` and `artifact-schema.sh` run, Then both are
  green, a real branch exists, and a real PR URL is in `last-task.md`.

Out of scope: The 55 flagged `aspnet_*` procedures / `OSCDocuments` view review. Any code changes.
Re-running phases 1-4.
