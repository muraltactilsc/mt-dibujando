---

status: done
task_id: task2-auth-core-ci-fix
pr_url: https://github.com/muraltactilsc/mt-dibujando/pull/8
build: passing
summary: |
Fixed the turbo.json pipeline root cause for PR #8's flaky `ts-quality` failures: added
`"dependsOn": ["^build"]` to the global `"lint"` task so typed ESLint in apps/api and
apps/mobile waits for `@dibujando/shared#build`. Verified dry-run dependencies and a
`--force` run of `lint typecheck` completed all 7 tasks with zero errors. No auth code
was changed.
blockers: none
next_hint: none
