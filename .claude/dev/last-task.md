---
status: done
task_id: task2-login-screen
pr_url: TODO
build: passing
summary: Implemented the mobile login screen, session module, authenticated API client, and auth routing gate; verified the full login→session→logout loop against the seeded backend on the web target.
blockers: none
next_hint: The legacy-ui-shot.mjs helper fails to log in to the hosted legacy DEV site because it does not submit the ASP.NET anti-forgery token; I captured the legacy login screenshot with a one-off unauthenticated script instead. Consider updating the shared helper to extract and post __RequestVerificationToken when it needs an authenticated legacy shot.
---

## Verification performed

- `bash .claude/shared/scripts/validate.sh` passed (format, build, lint, typecheck, tests, file-size, banned-deps, no-raw-fetch).
- `bash .claude/shared/scripts/dev-up.sh --web` brought up the web target at http://localhost:8081.
- Playwright smoke checks (10/10 passed):
  - `/` redirects to `/login` with no stored session.
  - Empty email and/or password shows `El correo electrónico es requerido.` without a network call.
  - Malformed email shows `El Correo electrónico no es una dirección de correo válida.`.
  - Wrong password shows `El correo electrónico y la contraseña no coinciden.`.
  - Valid fixture credentials (`qa.auth@dibujando.test` / `Test1234!`) navigate to `/` and Home shows `QA Test Institution` and `SysAdmin`.
  - Logout returns to `/login` and clears `localStorage` refresh token; reload does not re-authenticate.
- Screenshots saved:
  - New app: `.claude/dev/screenshots/account/login.png` (verified "Iniciar Sesión" rendered).
  - Legacy: `.claude/dev/screenshots/legacy/login.png` (captured unauthenticated /Account/Login page).

## Files changed

- `apps/mobile/app/_layout.tsx` — brand accent teal `#46c6b4`, wrapped tree in `SessionProvider`.
- `apps/mobile/app/(auth)/_layout.tsx` — public route group.
- `apps/mobile/app/(auth)/login.tsx` — thin route for `LoginScreen`.
- `apps/mobile/src/auth/tokenStorage.ts` — `expo-secure-store` wrapper with web `localStorage` fallback.
- `apps/mobile/src/auth/useSessionStore.ts` — Zustand session store with `login`, `logout`, `bootstrap`, `refresh`.
- `apps/mobile/src/auth/SessionProvider.tsx` — boot-time bootstrap + auth gate redirects.
- `apps/mobile/src/api/client.ts` — authenticated client with bearer token, 401 refresh, and `apiPost`.
- `apps/mobile/src/api/auth.api.ts` — typed auth calls using `@dibujando/shared` schemas.
- `apps/mobile/src/api/auth.queries.ts` — `useLoginMutation` TanStack Query hook.
- `apps/mobile/src/features/account/LoginScreen.tsx` — form + validation + error banner.
- `apps/mobile/src/features/home/HomeScreen.tsx` — show user info and logout.
- `apps/mobile/package.json` + `pnpm-lock.yaml` — added `expo-secure-store`.
