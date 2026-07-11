status: done
task_id: osc-legalbase-backend
pr_url: https://github.com/muraltactilsc/mt-dibujando/pull/16
build: passing
summary: Implemented the OSC Legal Base backend section with GET/POST endpoints, shared zod schemas, legalbase table + fixture, relocated osc-profile-lock to shared/, and covered acceptance scenarios with unit + smoke tests.
blockers: none
next_hint: The `apps/api/db/types.ts` generated file is now 243 lines (under the 250 max) after stripping blank lines; future codegen runs may need the same compacting step or a scripted post-process to stay under the file-size cap as more tables are added.
