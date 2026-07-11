status: done
task_id: osc-catalogs-real-data-fix
pr_url: https://github.com/muraltactilsc/mt-dibujando/pull/16
build: passing
summary: Moved all catalog data INSERTs out of schema scripts into ordered seeds, added real production catalog rows (real Dynamics GUIDs, México=countryid 1) from the .bacpac extract, and fixed the userprofile sequence collision and LegalBase Mexico assumptions.
blockers: none
next_hint: The staging file `.claude/dev/tmp/real-catalogs-seed.sql` was deleted after copying. Two production rows had NULL local ids (osctype and incomeexpenseconcept); they were assigned explicit ids 17 and 18 because the PK columns are NOT NULL. The existing PR #16 was updated rather than creating a new PR.
