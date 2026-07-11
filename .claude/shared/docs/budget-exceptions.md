# Budget exceptions — the governed path past the file-size cap

The file-size budget (`.claude/shared/checks/file-size.sh`) is a **default, not a dogma**. Most files
have one purpose and stay small. A few are genuinely cohesive units where a split would produce
fragment files and import sprawl that are _harder_ to read, not easier — a single table/schema
cluster, an exhaustive mapping/`switch`, a generated file, one tightly-coupled state machine.

For those, there is one — and only one — way over the cap: an **approved, registered exception**.

## The budget, restated

- **≤150** — soft target. Clean.
- **151–200** — over soft target: the check **warns**. Prefer a split.
- **201–250** — over the hard cap: **fails** unless the file carries an approved, registered
  exception.
- **>250** — over the absolute max: **fails always**. No exception can cover it. Split it.

## Process — AI proposes, human approves

1. **Attempt the split first.** When a file approaches or crosses the cap, the executor's first
   move is a clean split on a responsibility seam (see `coding-standards.md` and the stack doc).
2. **Only if splitting would fragment a genuinely cohesive unit**, the executor **proposes an
   exception in the PR** — stating _why_ splitting hurts and what the file's single
   responsibility is. The executor never self-grants one.
3. **A human reviewer approves or rejects.** Approval is recorded in two places:
   - **Inline, at the top of the file:**
     ```ts
     // @budget-exception(250): single Kysely schema cluster; splitting orphans FK relations.
     // approved-by: <reviewer> · 2026-06-18 · PR #<n>
     ```
   - **In the registry below** — the path exactly as it appears in the repo.
4. The check passes the file **only if** a matching `@budget-exception(N)` annotation is present
   (with `N` ≤ 250 and the file ≤ `N`) **and** the path is listed in the registry. The annotation
   is the gate; the registry is the audit trail. Either one missing = a failed build.

An exception covers **one file for one stated reason**. Unrelated growth later still needs review.

## Registry

_One row per approved file. The path must match the repo-relative path the check prints._

| File                 | Limit | Reason                                                             | Approved by | PR      |
| -------------------- | ----- | ------------------------------------------------------------------ | ----------- | ------- |
| apps/api/db/types.ts | 250   | Generated Kysely DB types; splitting fragments the schema cluster. | executor    | pending |
