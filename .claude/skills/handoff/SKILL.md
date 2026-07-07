---
name: handoff
description: Session/track-boundary handoff — persist context to its correct home (via the update-context skill), archive finished work to history, refocus CLAUDE.md, reset AGENTS.md, verify a fresh session resumes cleanly. Run only when explicitly invoked.
---

You are doing the **handoff / doc-hygiene** routine for this repo. Run it ONLY because the user
invoked `handoff` — never auto-run it. Goal: leave the docs so a brand-new session — possibly on a
**different host** — can resume correctly, with no staleness and nothing stranded, **without
bloating the rules**.

This is a judgment checklist, not a rigid script — skip steps that don't apply.

## Steps

1. **Confirm clean state.** No open agent PRs (`gh pr list`), nothing running,
   `.claude/dev/last-task.md` is `done`/no blockers, the default branch is up to date. If a task is
   mid-flight, finish/merge it first — don't hand off over unfinished work.

2. **Persist context to its correct home.** Run the **`update-context`** skill in sweep mode: route
   every durable fact from this session to shared (version-controlled) vs local memory per the
   CLAUDE.md "Context persistence — local vs shared" test, reconcile duplicates (one home per fact),
   and heal dead `[[ ]]` links. This is the step that keeps a second host from starting blind — bias
   to restraint, but lose nothing durable.

3. **Archive the finished track.** If a track just completed, move its detail into
   `.claude/dev/docs/<track>-history.md` (concise bullets, PR numbers, key decisions, what was
   deferred). Add/refresh a one-line pointer under a "Completed" section in `CLAUDE.md`. Do NOT
   leave the finished plan inline in "Current focus".

4. **Refocus `CLAUDE.md` "## Current focus".** Rewrite it to the NEXT track: a short plan + a
   clear "how to resume" block (read `last-task.md`; merge any open PR; the first task and
   whether it needs user input; the standing constraints). Purge anything done/stale. Keep tight.

5. **Reset `AGENTS.md ## Current Task`** to `_No active task._` so no stale spec sits there.

6. **Verify resume works.** Re-read the updated "Current focus" as if starting fresh **on a
   different machine**: does it unambiguously say what to do first? Is any _shared_ knowledge
   stranded only in local memory, or any unresolved `[[ ]]` link left in CLAUDE.md? Fix if so.

7. **Report** what was archived, the next track + first task, what `update-context` routed (shared
   vs local), and any uncommitted doc edits.
