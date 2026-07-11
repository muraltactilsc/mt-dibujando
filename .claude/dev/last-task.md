status: done
task_id: task2-registration-quiz-content-fix
pr_url: https://github.com/muraltactilsc/mt-dibujando/pull/12
build: passing
summary: |
Replaced the placeholder trivia questions in `apps/api/db/seeds/002_registration_fixture.sql`
with the 3 real OSC eligibility screening questions and "Si"/"No" answers, plus cleanup deletes
for stale placeholder rows. Validation gate passed and smoke tests against a fresh dev DB
confirm the API returns the correct questions/answers and validation behaves as expected.
blockers: none
next_hint: |
Verified on a fresh database: `GET /api/registration/questions` returns the 3 verbatim
questions with "Si"/"No" answers in order; `POST /api/registration/validate-answers` with
`[1, 3, 5]` returns `passed: true` + a registration token, and any "No" combination returns
`passed: false`. Mobile web screenshot saved at
`.claude/dev/screenshots/mobile/task2-question.png` showing the real content. No `.ts`/`.tsx`
files hardcode answer ids.
