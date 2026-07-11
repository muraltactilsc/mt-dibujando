status: done
task_id: task2-password-reset-frontend
pr_url: https://github.com/muraltactilsc/mt-dibujando/pull/14
build: passing
summary: |
  Implemented the forgot/reset-password frontend screens, wired them to the PR #13 backend,
  and added the new public auth routes to the session guard. All 5 screens render, validate,
  and navigate per the legacy copy and acceptance criteria.
blockers: none
next_hint: |
  Added `apps/mobile/src/api/password-reset.{api,queries}.ts`, 5 screens under
  `src/features/account/`, and 5 routes under `app/(auth)/`. `SessionProvider` was updated
  so the confirmation/reset/invalid routes are reachable while unauthenticated.
  Smoke checks (via `dev-up.sh --web` + Playwright) confirmed:
    - fixture and non-existent emails both navigate to the same forgot-password confirmation;
    - the API log prints a real signed reset link;
    - `/reset-password?code=<valid>` renders the form, `/reset-password` alone shows the
      invalid/expired screen;
    - mismatched passwords show the reset-specific message without a network call;
    - a valid reset navigates to confirmation, after which old password login fails and new
      password login succeeds. Screenshots saved under `.claude/dev/screenshots/account/`.
  The fixture password was restored to `Test1234!` after testing.
