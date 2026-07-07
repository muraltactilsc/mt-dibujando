# Frontend — Expo / React Native (typescript stack)

Concrete frontend conventions. Makes [`coding-standards.md`](../../coding-standards.md) real for
the app. One codebase → iOS, Android, and Web (via React Native Web). Read for any task
touching `apps/mobile`. Keep small — split if it grows.

## Folder structure

```text
apps/mobile/
├── app/                    ← Expo Router routes (file-based; URL support on web)
│   ├── _layout.tsx             providers (QueryClient, Paper theme, session) + auth gate
│   └── (tabs)/…                route files: thin — render a screen from features/, nothing else
└── src/
    ├── api/                ← the network layer (the ONLY place that talks to the backend)
    │   ├── client.ts           the one authenticated client (token attach → bearer → 401 refresh)
    │   ├── <resource>.api.ts   calls only, via client
    │   └── <resource>.queries.ts  TanStack Query hooks (useQuery/useMutation) + query keys
    ├── auth/               ← session provider, IdP wiring, token storage (expo-secure-store)
    ├── state/              ← Zustand stores for CLIENT/UI state only (use<X>Store.ts)
    ├── features/<module>/  ← that module owns its screens
    │   ├── <Module>Screen.tsx   (default export, re-exported by the route file)
    │   ├── <Module>Form.tsx / <Module>List.tsx / <Module>Section.tsx
    │   └── <module>.types.ts    ← module-local types
    ├── components/         ← SHARED components only (used by >1 module)
    └── hooks/              ← SHARED hooks only — never components
```

**Route files are logic-free** — a route in `app/` renders one screen from `features/`; no data
fetching, no business rules in the router layer.

> Anti-pattern (real, prior repo): the route table grew to **851 lines** of inlined logic.

## Component budget + split recipe

- **Budget:** the uniform line budget (150/200/250 — see
  [`coding-standards.md`](../../coding-standards.md)). Crossing it is a trigger to split.
- **Deterministic cut:** `Screen` → extract `List`, `Form`, per-section `Section`, repeated row
  → `Row`, and stateful logic → a module hook (`use<Module>…`). Cut on the seam, never
  mid-component to hit the number.
  > Anti-pattern (real, prior repo): a single form component reached **1,626 lines**.

## Types — module-local, shared contracts from `packages/shared`

- Module-local types live in `<module>.types.ts`. **No project-wide types file.**
  > Anti-pattern (real, prior repo): a global `types/api.ts` reached **4,339 lines**.
- **API contract types are imported from `packages/shared`** (zod schemas + `z.infer` types the
  backend validates with) — never redeclared in the app. Drift = compile error; that is the
  main payoff of full TypeScript.
- **Composed flavor (Expo frontend + .NET backend):** there is **no** shared TS `packages/shared`
  across the language boundary. Generate a typed client from the .NET API's **OpenAPI** document
  (e.g. `openapi-typescript` / an NSwag client) into the app and treat **that** as the contract
  source — never hand-redeclare API types. Forms still use zod (next section), but the
  request/response _types_ come from the generated client. Regenerate on every API change so
  drift stays a compile error, not a runtime 404.

## State — server vs client

- **Server state → TanStack Query.** All API data goes through `useQuery`/`useMutation`. Never
  hand-roll `useEffect` + `useState(loading, error)` per screen, and **never put server data in
  a global store** — the query cache _is_ the server-state store.
  > Anti-pattern (real, prior repo): no query layer → every page hand-rolled fetch/loading/error
  > and one api file ballooned to **1,295 lines**.
- **Client/UI state → Zustand.** Only client state (filters, wizard step, prefs) in
  `state/use<X>Store.ts`; persist selectively (AsyncStorage) — never mirror server data.
- **Layout:** `<resource>.api.ts` holds the calls; `<resource>.queries.ts` wraps them in hooks
  with explicit query keys. Components consume the hooks, not raw calls.

## Forms — React Hook Form + zod

Forms use `react-hook-form` with `zodResolver`. The schema **is** the contract: for payloads the
API validates, resolve against the schema from `packages/shared` — one source of truth for both
sides. No hand-rolled per-field validation state.

## Auth — app-managed (no cloud IdP), one client

- **No Entra ID/Cognito, no `expo-auth-session` OAuth redirect.** This project faithfully
  replicates the legacy portal's own login screen and session mechanism exactly (see
  `architecture/frontend.md`'s account/login feature once the legacy mechanism is documented) —
  a plain credential form posting to the app's own `/auth` endpoint, not a third-party IdP
  hand-off. **Whatever token/session the backend issues lives in `expo-secure-store`** — never
  AsyncStorage, never a hand-rolled cache.
- **One authenticated client.** Every request goes through `api/client.ts`, which attaches the
  bearer and refreshes on `401`. **No raw `fetch`/`axios` outside `src/api/`** — enforced by
  `.claude/shared/checks/no-raw-fetch.sh`.

## UI — React Native Paper, theme tokens only

- Components come from **React Native Paper** (MD3); compose Paper primitives before writing
  custom ones.
- **Theme is data-driven, never hardcoded.** One theme pair (light + dark) defined once and
  provided at the root; components read colors via `useTheme()` tokens — **no literal hex/rgb in
  components**, no theme checks at call sites. Support **both** light and dark.
- **One accent token:** the project's accent is set once in the theme (`colors.primary`);
  changing it is a one-line change, not a find-replace.
- **Web target:** the same components render via React Native Web. Platform forks only where
  behavior must differ — `Platform.select` or a `.web.tsx` sibling, never `if` ladders inline.

## Conventions

| Element      | Pattern                      | Example                            |
| ------------ | ---------------------------- | ---------------------------------- |
| Screen       | PascalCase + `Screen`        | `PoliciesScreen.tsx`               |
| Form / List  | PascalCase + suffix          | `PolicyForm.tsx`, `PolicyList.tsx` |
| Route file   | Expo Router lowercase        | `app/(tabs)/policies.tsx`          |
| Shared hook  | `use` + camelCase            | `usePagination.ts`                 |
| Api module   | camelCase + `.api.ts`        | `policies.api.ts`                  |
| Query hooks  | `<module>.queries.ts`        | `policies.queries.ts`              |
| Client store | `use<X>Store.ts` in `state/` | `useFiltersStore.ts`               |
| Types file   | `<module>.types.ts`          | `policies.types.ts`                |

All identifiers English; user-facing text in Spanish (es-MX).

## Dependencies — framework first

Prefer what Expo ships (`expo-*` modules first). A new dependency must be confirmed with the
user — and must support all three targets (iOS/Android/Web).

- **Approved (stack):** `expo`, `expo-router`, `react-native-paper`, `react-native-web`,
  `react-native-reanimated` (animation — Expo-managed, supports all three targets),
  `@tanstack/react-query`, `zustand`, `react-hook-form`, `zod`, `@hookform/resolvers`,
  `expo-secure-store`, `expo-auth-session`.
- **Other project packages:** `TODO:` none approved yet — confirm with the user before adding.

## Validation gate

A green typecheck does not prove the UI talks to a real API. Per the area contract: verify every
`/api/...` path maps to a real backend route (path, verb, params), and run the **web target**
(`expo start --web`) against the local API with no 404/500 on touched screens — it is the
cheapest of the three targets to exercise headlessly. Native-only changes note what was verified
and how.

## Enforced in CI

`.claude/shared/checks/file-size.sh` (the uniform 150/200/250 line budget) and `.claude/shared/checks/no-raw-fetch.sh`
(all network through the authenticated client — no `fetch`/`axios` outside `src/api/`). A
violation fails the build.
