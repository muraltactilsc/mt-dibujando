---
name: update-context
description: Persist durable context to its correct home — shared (version-controlled .claude/{shared,dev}/docs / CLAUDE.md) vs local durable memory — per the local-vs-shared test in CLAUDE.md. Use to save a fact now, or to sweep the session for context worth keeping. Reused by the handoff skill.
---

You are routing **durable context** to its correct, single home so knowledge is neither lost nor
stranded on one machine. The classification test and the "one home per fact" rule live in
**CLAUDE.md → "Context persistence — local vs shared"** — read it first. This skill is the
_procedure_ that applies that rule, not a second copy of it.

## Modes

- **Explicit** — `update-context <fact>`: route just that fact.
- **Sweep** — no args (and how `handoff` calls it): review the session for durable context worth
  keeping, and route each item.

## Procedure — for each candidate fact

1. **Filter.** Keep only what is _durable_ (true beyond this session) and _not already derivable_
   from code, git history, or existing docs. Drop one-offs and anything the repo already records.
2. **Classify** by the CLAUDE.md test — _would any host need it, and is it true regardless of
   machine?_
   - **Shared → version-controlled.** A top-level _rule_ → CLAUDE.md; **detail → the right
     `.claude/{shared,dev}/docs/*`** (`shared/docs/` for house standards: architecture/, stack/,
     coding-standards; `dev/docs/` for orchestrator working docs: spec-technique, a track's
     history). Don't bloat CLAUDE.md. Reproducible machine _setup_ → a setup doc, not memory.
   - **Local → durable memory.** `memory/<slug>.md` (with the frontmatter the harness expects) +
     a one-line pointer in `MEMORY.md`. Only genuinely host-specific, non-reproducible state.
3. **One home / reconcile.** Search existing docs **and** memory before writing. If the fact already
   exists, **update it in place** — never create a second copy. If it's in the wrong home (a shared
   fact sitting in local memory, or vice-versa), **move** it.
4. **Heal dead links.** Scan CLAUDE.md and `.claude/{shared,dev}/docs/*` for `[[name]]` references.
   For each, confirm the target is either a real, genuinely-local memory **or** already
   inline/checked-in. Any link that resolves only to a _missing_ local memory → inline the content
   (or move it into the right doc) and replace the link. Report any you cannot resolve.
5. **Report** a table: _item → shared | local → destination file_, plus any dead links healed or
   flagged.

## Notes

- The harness may still prompt to write durable facts to local memory; for **shared** facts, prefer
  the checked-in home anyway — that is the entire point (see CLAUDE.md).
- Writing files ≠ committing. Leave the commit to the user / the normal flow.
