# Spec technique (universal)

How the orchestrator writes a `## Current Task` so the executor builds the right thing — and so
you can review the spec _before_ spending an agent invocation. Stack-agnostic; adapted from
GitHub Spec Kit (Spec-Driven Development), scaled to this pattern's one-task loop. Both roles
read this: the orchestrator to write specs, the executor to read them.

## The shape

A `## Current Task` uses this skeleton. **Required core: `Goal` + `Acceptance`.** Everything
else is include-when-relevant — don't pad a one-line change into a six-section form.

```text
## Current Task — <task-id>

Goal: <one sentence, the user-observable outcome>

References: <files / endpoints the executor must read first — point, don't transcribe>

Requirements:
  - FR-1: System MUST <capability>.
  - FR-2: System MUST <capability>.

Acceptance (Given-When-Then — must tie to the area's validation gate):
  - Given <state>, When <action>, Then <observable result>.
  - Given <edge case>, When <action>, Then <result>.

Out of scope: <what NOT to touch — the line that stops the agent wandering>

[NEEDS CLARIFICATION: <anything ambiguous>]   ← only if present
```

## Notation rules (Spec Kit native)

- **Requirements** are `System MUST …` statements (`FR-1`, `FR-2`, …). Testable, no
  implementation detail (say _what_, never _how_).
- **Acceptance** is **Given-When-Then**, and each scenario must be checkable by the area's
  validation gate (e.g. an endpoint returning a real 200 with the right body, a screen loading
  with no 404). If a scenario can't be observed by running the thing, it isn't acceptance.
- **`[NEEDS CLARIFICATION: …]`** flags ambiguity instead of guessing. This is a contract: the
  executor must **not** invent an answer (see AGENTS.md — it's a blocker).
- **Out of scope** is not optional padding — for any non-trivial task, naming what's excluded
  is the cheapest way to keep the change bounded.

## The method (orchestrator)

1. **Read the source first.** Open the legacy/reference files yourself; don't make the agent
   re-derive what you already know. Name them in `References`.
2. **Reuse-check.** Confirm the capability/data doesn't already exist; prefer extending an
   existing path (and say so) over a new one.
3. **Slice to one capability.** One task = one shippable capability. If it needs an a/b split
   (e.g. backend then frontend), spec only the current slice.
4. **Write Goal + Acceptance first**, then the minimum Requirements/References/Out-of-scope the
   agent can't derive.
5. **Self-check before invoking:** Is the Goal one observable outcome? Can every acceptance line
   be proven by the validation gate? Is anything ambiguous flagged rather than guessed? If yes,
   invoke the agent; if no, fix the spec — it's free now and expensive after.

## Executor-specific: aider (editor-only agents)

Applies when `.claude/shared/agent-config` is an aider executor (`aider-deepseek`, `aider-kimi`).
aider is **editor-only** (no shell; `auto-commits`/`suggest-shell-commands` off) and reads only
chat-attached files plus a shallow repo-map — repo-map gaps are how it hallucinates APIs. Everything
below is how a spec meets that constraint; a shell-capable executor (codex, claude) ignores it.

- **`Read:` lines.** A spec line `Read: <repo-relative-path>` becomes an aider `--read`
  (read-only) attachment via `run-agent.sh` — this is how the `References:` intent reaches an
  editor-only agent. Attach the few RIGHT files (aider guidance: 1–3 focused, ~6–7 max; more
  degrades edits): the conventions doc, the exact source files whose exports the task must use —
  and when a test must follow a pattern, attach the PATTERN'S SPEC/SOURCE FILE too (naming a
  pattern without attaching it produced a hand-rolled fake adapter that failed typecheck). Missing
  paths are skipped; `.claude/domain-split/` is refused.
- **`Edit:` lines.** A spec line `Edit: <repo-relative-path>` adds an EXISTING file to the chat
  as editable, so aider edits from real content instead of repo-map guesses. New files the task
  creates need no line. A path must never appear in both `Read:` and `Edit:`.
- **NEVER `Read:` a file the task must EDIT.** Read-only conflicts either corrupt aider's
  SEARCH/REPLACE mechanics (double-applied blocks → duplicate declarations) or get silently
  skipped (an unwired module passing a green gate). Use `Edit:` for those.
- **Re-run hygiene.** Before re-invoking after a failure: delete the failed attempt's UNTRACKED
  output files (aider can't see untracked files; its create-blocks append onto them → duplicate
  declarations) and the stale `feature/<task-id>` branch. TRACKED files listed under `Edit:`
  may keep their in-worktree edits — aider sees their real content.
- **Self-healing loop** (`.aider.conf.yml`): `auto-lint` lints only source files (linting the
  markdown chat files makes aider invent an `.eslintignore`) and `auto-test` runs typecheck +
  tests, so aider fixes its own lint/type/test failures in-run. Keep `test-cmd` covering typecheck:
  it is the gate signal aider otherwise never sees. Narrow both to the area you're editing.
- **Model metadata.** `.aider.model.metadata.json` declares each deployment's real context window.
  Without it, litellm treats unknown model names with small-model defaults and silently trims — and
  `show-model-warnings: false` hides the warning. Size `map-tokens` to fit the whole repo map.
- **Facts the model copies literally.** Any example line in a fact (e.g. an import list) gets
  transcribed verbatim — write examples COMPLETE or the omission becomes the bug.
- **Facts, not code.** The spec body carries Goal / Requirements / Acceptance plus facts the
  executor cannot discover (env-var names, verified package versions, legacy semantics, quirk
  warnings). Never inline finished code — that reduces the executor to a transcriptionist.
- **Build a standing fact library** — each fact earned by a failed run, restated per task as
  relevant. These are stack-specific; keep yours in the area doc. It typically covers: the test
  runner's exact import style and globals setting; how DI/wiring must be declared; which lint rules
  are hard errors (unused imports, `any`) and the sanctioned cast; strict-typecheck traps; which
  packages are NOT declared deps (don't import them); explicit relative paths; and that tests must
  not need a live DB or ports.
- **Command-produced artifacts** (dependency installs, codegen, DB introspection) are run by the
  orchestrator in the worktree BEFORE invoking the executor; `finish-task.sh`'s `git add -A` ships
  them in the executor's PR (the orchestrator never commits).
- **Audit FR-by-FR against the diff**, not the green gate: `--passWithNoTests` and ride-along files
  mask missing deliverables. Check the PR file list against the spec's deliverables, and verify
  used symbols exist in the referenced sources. (`run-agent.sh` also guards this mechanically: an
  empty deliverable becomes `status: blocked` with no PR.)
- **On failure: fix the spec, drop the branch, re-run.** Delete the failed attempt's output files
  and the stale local `feature/<task-id>` branch before re-invoking; never hand-patch the
  executor's code. Expect 2–5 iterations on novel slices.
