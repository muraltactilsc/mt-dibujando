status: done
task_id: osc-institutionalbase-backend
pr_url: https://github.com/muraltactilsc/mt-dibujando/pull/17
build: passing
summary: |
Resumed the interrupted run, reviewed the uncommitted Institutional Base backend work,
fixed the volunteer-activities validation shape, tightened intervention-program error handling,
documented the db/types.ts split regeneration story, and added validator unit tests.
The full validation gate passes and the module was smoke-tested end-to-end against a fresh
Postgres database (GET/POST /api/osc/institutional-base, read-only gate, and partial-row
validation all behaved as expected).
blockers: none
next_hint: |
This was a resume of a prior interrupted run. Already-correct items included: the SQL DDL/seed
files, schema-initializer ordering, app.module wiring, shared schema exports, the service/
repository/controller split, and the use of shared osc-profile-lock functions for read-only and
resubmission logic. I changed: - apps/api/src/modules/institutional-base/application/institutional-base.validator.ts
(volunteer activities now error on partially filled rows; intervention errors are no longer
masked by the generic "required" fallback). - apps/api/src/modules/institutional-base/application/institutional-base-write.service.ts
(consumes the new combined validation result and passes validItems to child replacement). - apps/api/src/modules/institutional-base/application/institutional-base.validator.spec.ts
(new unit tests covering both validation shapes). - apps/api/db/types.ts (replaced the stale @budget-exception with a regeneration workflow
comment). - .claude/shared/docs/budget-exceptions.md (removed the now-resolved registry entry). - AGENTS.md (Prettier reformat of the orchestrator-updated Current Task section).
Fresh-DB smoke test used a temporary Postgres container on port 5434 because port 5433 has a
stale docker-proxy forwarding to the existing dev DB container.
