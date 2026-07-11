-- Legal Base fixture row for the auth fixture user (qa.auth@dibujando.test,
-- userprofileid 1) so the Legal Base section has real data to exercise.
-- Runs after the auth fixture creates the referenced user profile.

INSERT INTO legalbase (
  legalbaseid,
  userprofileid,
  oscprofileid,
  organizationconstitutiondate,
  lastprotocolizationdate,
  isauthorized,
  goubernamentalauthorizationdate,
  socialobjetive,
  statusid,
  usercreated,
  datetimecreate
)
VALUES (
  1,
  1,
  NULL,
  '2020-01-15',
  '2022-06-30',
  true,
  '2023-01-01',
  'Promover el desarrollo integral de niñas, niños, adolescentes y jóvenes a través de programas educativos, culturales y de salud.',
  1,
  '1',
  now()
)
ON CONFLICT (legalbaseid) DO UPDATE SET
  userprofileid = EXCLUDED.userprofileid,
  oscprofileid = EXCLUDED.oscprofileid,
  organizationconstitutiondate = EXCLUDED.organizationconstitutiondate,
  lastprotocolizationdate = EXCLUDED.lastprotocolizationdate,
  isauthorized = EXCLUDED.isauthorized,
  goubernamentalauthorizationdate = EXCLUDED.goubernamentalauthorizationdate,
  socialobjetive = EXCLUDED.socialobjetive,
  statusid = EXCLUDED.statusid,
  usercreated = EXCLUDED.usercreated;

-- Keep the identity sequence ahead of the seeded fixture so API inserts do not collide.
SELECT setval('legalbase_legalbaseid_seq', (SELECT MAX(legalbaseid) FROM legalbase));
