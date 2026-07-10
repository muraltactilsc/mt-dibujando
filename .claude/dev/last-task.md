---
status: done
task_id: db-conversion-phase2-translate
pr_url: https://github.com/muraltactilsc/mt-dibujando/pull/3
build: passing
summary: >
  phase2_translate.py: "63 tables -> DDL; 3 unmapped feature(s) to decide; 56 in-DB
  objects (55 need review)". Both readonly-guard.sh and artifact-schema.sh pass;
  full validate.sh gate also passes.
blockers: none
next_hint: >
  3 unmapped schema features (all index-name collisions on reused IX_UserId) and
  55 of 56 in-DB objects (all aspnet_* procedures; the 1 view was auto-translated
  and needs no review) await orchestrator/user review before phase 3. Branch also
  carries prior housekeeping changes: `.claude/db-conversion/` added to
  `.prettierignore`, and `readonly-guard.sh` path parsing fixed for quoted filenames.
---
