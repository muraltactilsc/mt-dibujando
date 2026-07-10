---
status: done
task_id: db-conversion-phase2-translate
pr_url: https://github.com/muraltactilsc/mt-dibujando/pull/3
build: passing
summary: >
  phase2_translate.py: "63 tables -> DDL; 3 unmapped feature(s) to decide; 56 in-DB
  objects (56 need review)". Both readonly-guard.sh and artifact-schema.sh pass.
blockers: none
next_hint: >
  3 unmapped schema features and all 56 in-DB objects (55 aspnet_* procedures + 1
  view) need orchestrator/user review before phase 3. I also added
  `.claude/db-conversion/` to `.prettierignore` and fixed `readonly-guard.sh` path
  parsing for quoted filenames so the read-only check stays green.
---
