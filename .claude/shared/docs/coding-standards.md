# Coding standards (universal)

House rules that apply to **every** project, regardless of stack or cloud. Read by both the
orchestrator (to write specs that respect them) and the executor (to build to them). The
stack-specific docs under `stack/<name>/` make these concrete; this file is the why and the
method. Keep it small — principles, not catalogs.

## Principles

1. **Clean architecture.** Dependencies point inward. The domain core knows nothing about the
   framework, the database, the cloud, or HTTP. Outer layers depend on the core, never the
   reverse. The concrete layer map lives in the stack's backend doc.
2. **Service-oriented.** Business logic lives in services. The edges — controllers, UI
   components, jobs — stay thin: parse input, call one service operation, shape output. A
   controller or component with business rules in it is a defect.
3. **One class/component per file.** File name = the type it holds. No multi-type files. (A
   tiny private record/type used only by its host file may be co-located.)
4. **Organize by domain resource, not technical concern.** Group code by _what it is about_
   (the resource), never by _how it is built_ (the format/verb/tech). A `Pdf`, `Export`,
   `Upload`, or `Helpers` unit that spans many domains is the smell — that work belongs with
   each resource it serves.
5. **Prefer the platform standard library; confirm before adding dependencies.** Reach for
   what the framework ships first. A third-party dependency must be justified and confirmed
   (with the user) before it enters the project. The per-stack approved list lives in the
   stack doc.

## The decomposition method

This is the part that prevents the files-grow-forever failure. An execution agent has no
judgment to fall back on, so the rule is explicit and mechanical:

- **One uniform budget, every source file, every language.** `150` soft target · `200` hard cap ·
  `250` absolute max. The budget is a **smell threshold, not a quota** — crossing it is not
  "illegal", it is a **trigger to stop and decide**. The same numbers hold whether the file is
  `.cs`, `.ts`, or `.tsx`, so the rule does not drift per stack.
- **Trigger.** When a file crosses its budget _or_ starts holding more than one responsibility,
  stop and split before adding more. Over `150` warns; over `200` fails the build.
- **Cut on the seam, never mid-responsibility.** Split where each resulting file gets **one
  reason to change** (one resource, one responsibility). Never chop a cohesive unit in half
  just to satisfy a number — that trades a big file for shrapnel.
- **Use the stack's split recipe.** Each stack doc names the deterministic recipe for its file
  types (e.g. fat controller → per-sub-resource controllers; fat page → Page + Table + Form +
  Section + hook) and the real anti-pattern it prevents.
- **The governed exception, for genuinely cohesive units only.** Where a split would fragment a
  truly cohesive unit (a single schema cluster, an exhaustive mapping, a generated file), the
  cap is passable — but only via an **approved, registered exception**: the executor proposes it
  in the PR, a human approves, and it is recorded inline (`// @budget-exception(N)`, N ≤ 250)
  _and_ in the registry. AI proposes, human approves; never self-granted. Full process in
  `budget-exceptions.md`.

## Enforcement

A written rule is not a guardrail — in practice unenforced rules get ignored by humans and
agents alike. The top structural rules are therefore backed by a mechanical check
(`.claude/shared/checks/`) wired into CI (`.github/workflows/standards.yml`) so a violation **fails
the build**. The executor's validation gate must run green before a PR. Docs explain the why;
the check is what holds the line.
