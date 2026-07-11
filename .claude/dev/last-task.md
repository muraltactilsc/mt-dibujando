status: done
task_id: osc-catalogs-incomeexpense-id-fix
pr_url: https://github.com/muraltactilsc/mt-dibujando/pull/16
build: passing
summary: Corrected the single wrong `incomeexpenseconceptid` in `apps/api/db/seeds/000_catalogs.sql` from 18 to 10 for 'Captación de recursos económicos por otras actividades', verified a fresh database seeds the full 1–17 sequence, and ran the validation gate.
blockers: none
next_hint: The incomeexpenseconcept row was never NULL in the source data; the real production id is 10, giving a clean 1–17 sequence. Fresh-DB verification used a temporary Postgres container on port 5434 because the host already has Postgres listening on 5433. The shared dev DB also had a stale id-18 row from the previous seed, which I deleted so it now matches the corrected 1–17 sequence.
