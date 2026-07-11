---

status: done
task_id: task2-auth-core
pr_url: https://github.com/muraltactilsc/mt-dibujando/pull/8
build: passing
summary: |
Implemented the auth core in apps/api: schema script + seed fixture, ASP.NET Identity 2.x
password verifier, POST /api/auth/login, /refresh, /logout, GET /api/auth/me, JwtAuthGuard,
and reusable @Roles/RolesGuard. Verified against the seeded fixture user with curl for all
acceptance scenarios; unit tests pass for the password verifier and roles guard.
blockers: none
next_hint: none
