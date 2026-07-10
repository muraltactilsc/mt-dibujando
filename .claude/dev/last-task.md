---
status: done
task_id: db-conversion-phase4-migrate
pr_url: none
build: passing
summary: >
  Phase 4 migration completed successfully: "4 migrate (full): 63 tables, 422523 rows loaded,
  58 identities reseeded". Every table's `rows_loaded` equals its `rows_source` in
  `phase4/migrate_report.json`. `readonly-guard.sh` and `artifact-schema.sh` both pass.
blockers: none
next_hint: >
  Phase 5 (verify parity) is the next conversion step. The 55 flagged aspnet_* procedures
  and 1 view in `phase2/ported_code/` remain out of scope, pending separate review.
---
