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

## Current Task — task2-auth-core-ci-fix

Goal: PR #8 (`feature/task2-auth-core`) has flaky-then-failing CI on the `ts-quality` check
(`pnpm turbo run lint typecheck`), reporting bogus `@typescript-eslint/no-unsafe-*` errors in
`apps/api/src/modules/auth/**` and `apps/api/src/shared/roles.guard.ts` pointing at types "that
cannot be resolved". This is a root-caused, pre-existing **turbo pipeline config bug**, not a real
defect in the auth code from this task — fix root cause only, do not touch the auth
implementation.

Root cause (already confirmed by the orchestrator, not something to re-diagnose): in
`turbo.json`, the `lint` task has no `dependsOn`, while `typecheck` does depend on `["^build"]`.
`apps/api`'s ESLint config does typed-linting (needs `packages/shared`'s built `dist/*.d.ts` to
resolve `@dibujando/shared`'s exported types, e.g. `AuthUser`, `LoginBodySchema`). Because `lint`
has no dependency edge, turbo is free to run `@dibujando/api#lint` concurrently with (or before)
`@dibujando/shared#build` finishes — a race. `pnpm turbo run lint typecheck --dry=json` on this
branch confirms it: `@dibujando/api#lint` and `@dibujando/mobile#lint` both show `"dependencies":
[]`, while their `typecheck` siblings correctly show `["@dibujando/shared#build"]`. This exact
task is the first one where `apps/api` imports enough from `@dibujando/shared` for the race to
actually surface as a lint failure (Task 0's `health` module didn't import shared types this way).

Requirements:

- FR-1: In `turbo.json`, add `"dependsOn": ["^build"]` to the `"lint"` task entry (same shape
  `"typecheck"` already has). Do not change anything else in the file.
- FR-2: Verify the fix with `pnpm turbo run lint typecheck --dry=json` — confirm
  `@dibujando/api#lint` and `@dibujando/mobile#lint` now list `"@dibujando/shared#build"` in
  their `"dependencies"`.
- FR-3: Run `pnpm turbo run lint typecheck --force` (force to bypass any stale cache) and confirm
  all 7 tasks succeed, with zero errors in `apps/api`'s lint output.
- FR-4: Do **not** modify any file under `apps/api/src/modules/auth/**`,
  `apps/api/src/shared/{jwt-auth.guard.ts,roles.guard.ts,roles.decorator.ts}`, or
  `packages/shared/src/auth.schema.ts` — the auth implementation itself is not the bug, don't
  "fix" it defensively (e.g. no `eslint-disable` comments, no `as any`/`as unknown` casts added
  anywhere in this task).

Process — this is a fix-up on an ALREADY-OPEN PR, not a new task:

- Do **not** run `new-branch.sh` — `feature/task2-auth-core` already exists (both locally and on
  origin) with open PR #8. Just `git checkout feature/task2-auth-core` (it should already be the
  current branch; confirm with `git branch --show-current`) and `git pull --ff-only` first in
  case anything changed upstream.
- After FR-1–FR-3 pass, do **not** run `finish-task.sh` (it calls `gh pr create`, which would fail
  — PR #8 already exists for this branch). Instead: `git add -A`, `git commit -m "fix(ci): make
lint depend on ^build in turbo pipeline"`, `git push`. This pushes onto the existing branch and
  updates PR #8 in place — no new PR.
- Update `.claude/dev/last-task.md` as usual (`status: done`, this `task_id`, the PR #8 URL,
  a summary noting this was a turbo-pipeline fix, not an auth-code fix).

Acceptance (Given-When-Then):

- Given `turbo.json` before the fix, When `pnpm turbo run lint typecheck --dry=json` is run,
  Then `@dibujando/api#lint`'s dependencies do NOT include `@dibujando/shared#build` (confirms the
  bug, for your own sanity check before fixing).
- Given `turbo.json` after FR-1, When the same dry-run is repeated, Then
  `@dibujando/api#lint`'s dependencies DO include `@dibujando/shared#build`.
- Given the fix is applied, When `pnpm turbo run lint typecheck --force` runs, Then all 7 tasks
  (`build`×1, `lint`×3, `typecheck`×3) succeed with no errors.
- Given the commit is pushed, When CI re-runs on PR #8, Then the `ts-quality` check passes.

Out of scope: any change to the auth implementation (already correct — the lint failure was
never about the auth code); any other `turbo.json` task; opening a new PR or branch.
