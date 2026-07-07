# Verifying screens against the legacy app

Verified working 2026-07-07. Goal: let a headless browser (via `legacy-ui-shot.mjs`) — or a
human — inspect real legacy Portal Dibujando screens as the source of truth for rebuild work, not
just the C# controller/view source.

## The reference site

Hosted DEV deployment: `https://wapp-dev-portal-dibujando.azurewebsites.net` — a **test
environment, not production**. Credentials in `CLAUDE.local.md`
(`LEGACY_APP_URL`/`LEGACY_APP_EMAIL`/`LEGACY_APP_PASSWORD`). No local build/run step exists or is
needed for this project — always up, no `dotnet run`/local SQL Server required.

**Read-only reference — never submit a write action through this site** (no create/edit/delete/
upload) — it exists only to compare the rebuild's screens against the real original.

## Logging in

Plain ASP.NET Identity form login, confirmed live against the real page:
`POST /Account/Login` with form fields `Email` / `Password` (ids `#Email`/`#Password`, no other
name), plus the page's antiforgery `__RequestVerificationToken` (GET the login page first with a
cookie jar, extract the token from the hidden input, POST with the same jar). A successful login
sets the `.AspNet.ApplicationCookie` cookie (OWIN's default name, per the auth research in
`.claude/shared/docs/rebuild-task-breakdown.md`'s Task 2) and redirects away from
`/Account/Login` — the test account used here lands on `/OSC/RegisterOSC?UserProfileId=<id>`
(this account has the `OSC`-side role, not `SysAdmin` — if a SysAdmin-only screen needs
verifying, a different test account is needed; ask the user rather than guessing one).

## Screenshotting a legacy screen

```bash
node .claude/shared/scripts/legacy-ui-shot.mjs <path> <module>/<name> [wait-text]
# Example:
node .claude/shared/scripts/legacy-ui-shot.mjs / legacy/home "Bienvenido"
node .claude/shared/scripts/legacy-ui-shot.mjs /OSC/RegisterOSC legacy/osc-profile "Base Institucional"
```

Writes to `.claude/dev/screenshots/<module>/<name>.png` (git-ignored) and refuses to save if the
`wait-text` never renders (no hollow spinner/empty-state evidence) — pass a string you expect to
see for real on that screen (a label, a seeded value) as `wait-text`.

Needs the Playwright Chromium cache present (`npx playwright install chromium` once per host) —
same cache `ui-shot.mjs` uses for the new app's own screenshots.

## Known gaps / not yet verified

- Only the login redirect target (`/OSC/RegisterOSC`) has been confirmed reachable so far — no
  screen-specific route has been screenshotted yet. Whoever verifies a specific screen next should
  read that controller's actual action/route (per the controller inventory in
  `rebuild-task-breakdown.md`) rather than guessing an MVC-convention URL.
- Only one test account/role (`OSCApproved`-ish, landing on the OSC profile wizard) is confirmed
  working. `SysAdmin`/`Admin`-gated screens (`UserController`, `AccountController.Roles`) need a
  different account — ask the user for one when that verification comes up, don't assume.
