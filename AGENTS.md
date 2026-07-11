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

## Current Task — task2-registration-quiz-content-fix

Goal: `apps/api/db/seeds/002_registration_fixture.sql`'s 3 quiz questions are **placeholder
trivia** ("¿Cuál es la capital de México?" etc.) that do not match the real legacy content. The
orchestrator captured the real, live legacy `/Question/Index` page (screenshot + a DOM text dump,
read-only — no form was submitted) and confirmed the actual questions are real OSC-eligibility
screening questions, not trivia. Replace the fixture with the real content, verified below.

Context: this is a genuine fidelity bug found after PR #10 (backend) and PR #11 (frontend) both
merged using the placeholder content — the mechanism (schema, endpoints, screens) is correct and
does NOT change; only the seeded question/answer row content is wrong and needs correcting.

Real content (verified live, verbatim — do not rephrase):

1. "¿Eres una Organización de la Sociedad Civil con más de dos años de haberte constituido?"
2. "¿Cuentas con la autorización del Servicio de Administración Tributaria o del Ministerio de
   Hacienda de tu país para recibir donativos deducibles (Donataria Autorizada)?"
3. "¿Dentro de tus programas o actividades brindas atención a Niñas, Niños, Adolescentes y
   Jóvenes de 0 a 21 años de edad?"

Each question has exactly 2 answers, verbatim text **"Si"** (no accent — confirmed from the live
page's actual rendered text, not a typo to fix) and **"No"**. These are eligibility gates for a
children/youth-focused OSC grant program — **"Si" is the correct/required answer for all 3**
(an organization must affirmatively meet all three criteria to be eligible; this also matches
`QuestionFail.cshtml`'s rejection copy, "no cuenta con los requisitos mínimos necesarios").

Requirements:

- FR-1: Replace `apps/api/db/seeds/002_registration_fixture.sql`'s `question`/`answer` INSERT
  blocks with: 3 questions (verbatim text above, `order` 1-3), 2 answers each — "Si" (`iscorrect
= true`, `order = 1`) and "No" (`iscorrect = false`, `order = 2`). Renumber cleanly: question
  ids 1-3, answer ids 1-6 (question 1 → answers 1/2, question 2 → answers 3/4, question 3 →
  answers 5/6). The `country` INSERT block is unaffected — leave it as-is.
- FR-2: Since this reduces the row count from 12 answers to 6 and the file's `ON CONFLICT DO
UPDATE` only upserts matching ids (it won't remove the now-stale ids 7-12 from an
  already-seeded dev database), also add explicit statements to remove any leftover rows from
  the old placeholder content: `DELETE FROM answer WHERE answerid IN (7, 8, 9, 10, 11, 12);` and
  `DELETE FROM answer WHERE questionid NOT IN (1, 2, 3);` (defensive) placed appropriately (after
  the new answers are inserted, so the surviving 6 rows are never touched by the delete).
- FR-3: Verify against a fresh apply: bring the dev DB up, confirm `GET /api/registration/
questions` returns exactly the 3 real questions in order, each with exactly 2 answers ("Si"/
  "No", in that order), and that `POST /api/registration/validate-answers` with the 3 "Si"
  answer ids (`[1, 3, 5]` after the FR-1 renumbering) returns `passed: true`, while any
  combination including a "No" returns `passed: false`.
- FR-4: No application code changes — this is a data-only fix. Confirm no `.ts`/`.tsx` file
  hardcodes the old answer ids (already checked by the orchestrator — none do), so nothing else
  needs updating.

Acceptance (Given-When-Then):

- Given the corrected seed applied to a fresh dev database, When `GET /api/registration/
questions` is called, Then it returns the 3 real questions verbatim, each with "Si"/"No"
  answers only (no trivia content remains).
- Given answer ids `[1, 3, 5]` (all "Si"), When `POST /api/registration/validate-answers` is
  called, Then it returns `{ passed: true }` with a `registrationToken`.
- Given any one "No" among the 3 submitted, When the same endpoint is called, Then it returns
  `{ passed: false }`.
- Given the mobile web target (`dev-up.sh --web`), When `/​(auth)/question` loads, Then it shows
  the 3 real questions with "Si"/"No" options (screenshot it and compare against
  `.claude/dev/screenshots/legacy/question.png`, already captured — confirm they now match in
  substance, not just mechanism).

Out of scope: any change to the registration/auth mechanism itself, the country catalog, or any
frontend component (`QuestionScreen.tsx` already renders whatever the API returns generically —
no code change needed there, this is purely backend seed-data content).
