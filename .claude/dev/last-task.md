status: done
task_id: task2-password-reset-backend
pr_url: https://github.com/muraltactilsc/mt-dibujando/pull/13
build: passing
summary: |
  Implemented the forgot/reset-password backend: new `notifications` module with a stub
  Graph adapter, signed JWT reset tokens embedding the user's current security stamp,
  `POST /api/auth/forgot-password`, `GET /api/auth/reset-password/validate`, and
  `POST /api/auth/reset-password`. Added shared zod schemas and unit tests; validation gate
  passed.
blockers: none
next_hint: |
  Two deliberate security fixes over the legacy code: (1) forgot-password now returns the
  same generic 200 for registered and unregistered emails, removing the user-enumeration
  leak; (2) reset tokens are self-contained signed JWTs with a 24-hour `exp` claim and the
  user's current `securitystamp`, so tampering with the timestamp is impossible and any
  unrelated password change invalidates outstanding reset tokens. Smoke checks against the
  running API confirmed: registered/unregistered emails return identical shapes, the stub
  logs a real signed reset link, validate returns `{valid:true}` for fresh tokens and
  `{valid:false}` after rotating the stamp, reset returns the exact legacy Spanish error
  codes/messages, and a successful reset changes the password hash and security stamp while
  allowing login with the new password.
