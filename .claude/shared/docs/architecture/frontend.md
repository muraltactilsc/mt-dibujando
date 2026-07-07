# frontend — shared contract

Read this for any task touching **frontend** (`apps/mobile`). It is read by **both** the
orchestrator (to write good specs) and the executor (to build + validate). Single source of
truth — keep it small; split if it grows.

---

## Overview

`apps/mobile` is an Expo/React Native app (iOS, Android, and Web via React Native Web) that
faithfully re-implements Portal Dibujando's Razor views (`Dibujando 1.1/PortalDibujando/Views/`)
as screens under `src/features/`. Theme: **system default** (light/dark follows OS), accent
color `#E4312A` (estimated from the legacy portal's sidebar branding — confirm/adjust once the
exact brand hex is available). See `.claude/shared/docs/stack/typescript/
frontend-structure-and-conventions.md` for the language-level conventions this must follow.

## Structure & ownership

```text
apps/mobile/
├── app/                     ← Expo Router routes (thin — render a screen from features/)
└── src/
    ├── api/                 ← network layer only (client.ts, <resource>.api.ts, .queries.ts)
    ├── auth/                ← session provider (ported from legacy AccountController flow)
    ├── state/               ← Zustand stores, client/UI state only
    ├── features/
    │   ├── account/         ← login, password reset (AccountController + Views/Account)
    │   ├── osc/             ← OSC profile (OSCController + Views/OSC)
    │   ├── announcements/   ← AnnouncementList/AnnouncementApplication controllers+views
    │   ├── finance/         ← Finance-related screens
    │   └── entries/         ← Entry-related screens
    ├── components/          ← SHARED components only (used by >1 feature)
    └── hooks/               ← SHARED hooks only
```

Each `features/<module>/` maps to one (or a small cluster of related) legacy controller(s) —
named after the legacy domain, not the new screen shape, so fidelity reviews can find the source
view directly.

## Conventions

| Element     | Pattern                                                                        | Example                                             |
| ----------- | ------------------------------------------------------------------------------ | --------------------------------------------------- |
| Screen      | one per legacy view/controller action                                          | `features/announcements/AnnouncementListScreen.tsx` |
| Route       | thin, renders one screen from `features/`                                      | `app/(tabs)/announcements/index.tsx`                |
| API calls   | only via `src/api/<resource>.api.ts` through the one authenticated client      | never inline `fetch`                                |
| Forms       | `react-hook-form` + zod schema from `packages/shared`                          | mirrors legacy create/edit forms field-for-field    |
| Data labels | names, never raw IDs (legacy Dynamics optionset values resolve to their label) | `"Approved"`, not `206430002`                       |

## Code patterns

```text
Screen  → renders List/Form/Section per legacy view's panels; no inline data fetching
List/Form/Section → extracted per the component budget when a Screen crosses it
Module hook (use<Module>...) → owns the stateful logic a Screen would otherwise inline
```

---

## Validation gate (MANDATORY)

A green typecheck does not prove the UI talks to a real API. Every task that changes frontend
must pass this gate before opening a PR:

1. **Run it.** `pnpm --filter mobile start` (Expo), and confirm the **web target** renders
   (`pnpm --filter mobile web` or the Expo web build) — web is a first-class target here, not an
   afterthought.
2. **Exercise what you touched.** For each changed screen, confirm every panel/control/filter
   from the legacy original renders and behaves against a real (or realistic dev-seeded) API
   response — reject a spinner/empty/404 screenshot as evidence.
3. **Restore any temporary changes.** If you toggled auth/config/guards to test, restore them
   byte-for-byte and re-grep the diff to confirm they are net-zero.
4. **Record** in `.claude/dev/last-task.md` what you ran and that it returned the expected result,
   including a screenshot of the real rendered screen.

## Completion criteria

- `pnpm --filter mobile typecheck`, `pnpm --filter mobile lint`, `pnpm --filter mobile test` all
  pass.
- Validation gate above passed and recorded, including a web-target screenshot.
- New files match the structure and conventions above (no monolithic leftovers).
- PR opened against `master`.
