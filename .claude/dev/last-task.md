---
status: done
task_id: task2-registration-backend
pr_url: https://github.com/muraltactilsc/mt-dibujando/pull/10
build: passing
summary: Implemented the registration backend — pre-registration quiz, answer validation with audit logging, short-lived signed registration tokens, POST /api/auth/register with identity creation and immediate session issuance, and the active countries catalog.
blockers: none
next_hint: none
---

## Verification performed

- `bash .claude/shared/scripts/validate.sh` passed (format, turbo build/lint/typecheck/test, file-size, banned-deps, no-raw-fetch).
- `bash .claude/shared/scripts/dev-up.sh` brought up Postgres + API at http://localhost:3000.
- Smoke-tested against real seeded fixture rows:
  - `GET /api/registration/questions` returns 3 ordered questions with answers and no `iscorrect` field.
  - `POST /api/registration/validate-answers` with `[1, 6, 10]` returns `passed: true` + non-empty JWT.
  - Same endpoint with one wrong answer (`[1, 6, 9]`) returns `200 { passed: false }` and logs `iscorrect = false`.
  - Same endpoint with 2 answers returns `400 { code: incomplete_answers }`.
  - `POST /api/auth/register` with expired/missing token returns `401 { code: registration_token_expired }` with exact legacy message.
  - Valid registration creates `aspnetusers` + `aspnetuserroles` (`OSCNotApproved`) + `userprofile` and returns the same `AuthSessionData` shape as `/login`.
  - Duplicate email returns `409 { code: email_taken }`; duplicate active registry number returns `409 { code: duplicate_registry_number }`.
  - Weak password and password mismatch return `400` with exact legacy messages.
  - `GET /api/catalogs/countries` returns active countries ordered by name including México.

## Notable implementation notes

- Replaced the legacy `TokenFiveMinutes` guessable time-bucket string with a real `jose`-signed JWT (`purpose: register`, 5-minute expiry). Same user-visible behavior (quiz pass grants a short registration window), but a genuine security mechanism. Recorded here as a deliberate improvement, not silently kept.
- Reused PR #8's session-issuance path: successful registration calls the same `issueSessionForUser` helper used by login.
- Added `hashIdentityPassword` alongside the existing `verifyIdentityPassword` using the same ASP.NET Identity 2.x PBKDF2/HMAC-SHA1/1000-iterations/16-byte-salt/32-byte-subkey format.

## Files changed

- `apps/api/db/scripts/002_registration_core.sql` — new `question`, `answer`, `logtriedquestions`, `country` tables.
- `apps/api/db/seeds/002_registration_fixture.sql` — quiz and country fixture data.
- `apps/api/db/schema-initializer.ts` — applies the new schema script + seed.
- `apps/api/db/types.ts` — regenerated via `kysely-codegen`.
- `apps/api/src/modules/registration/` — new module: questions list, validate-answers, signed registration token, attempt logging.
- `apps/api/src/modules/catalogs/` — new lightweight module: active countries catalog.
- `apps/api/src/modules/auth/` — extended with `POST /api/auth/register`, password hashing, user/role/profile creation, and immediate session issuance (`user-registration.service.ts`).
- `packages/shared/src/registration.schema.ts` + `index.ts` — shared zod schemas and types for registration.
- `apps/api/src/app.module.ts` — wired `RegistrationModule` and `CatalogsModule`.
