-- Government fixture data for the auth fixture user (qa.auth@dibujando.test,
-- userprofileid 1) so the Government section has real data to exercise.
-- Runs after the auth fixture creates the referenced user profile.

INSERT INTO government (
  governmentid,
  userprofileid,
  oscprofileid,
  presidencyname,
  presidencyemail,
  legalrepresentativename,
  legalrepresentativeemail,
  executivegeneralmanagementname,
  executivegeneralmanagementemail,
  programandprojectoperationname,
  programandprojectoperationemail,
  institutionaldevelopmentname,
  institutionaldevelopmentemail,
  numberofmembers,
  statusid,
  usercreateid,
  datetimecreate
)
VALUES (
  1,
  1,
  NULL,
  'María Elena Ríos',
  'presidencia@qa.dibujando.test',
  'Carlos Mendoza Hernández',
  'legal@qa.dibujando.test',
  'Ana Lucía Torres',
  'direccion@qa.dibujando.test',
  'Luis Fernando Castillo',
  'programas@qa.dibujando.test',
  'Diana Patricia Vargas',
  'desarrollo@qa.dibujando.test',
  5,
  1,
  '1',
  now()
)
ON CONFLICT (governmentid) DO UPDATE SET
  userprofileid = EXCLUDED.userprofileid,
  oscprofileid = EXCLUDED.oscprofileid,
  presidencyname = EXCLUDED.presidencyname,
  presidencyemail = EXCLUDED.presidencyemail,
  legalrepresentativename = EXCLUDED.legalrepresentativename,
  legalrepresentativeemail = EXCLUDED.legalrepresentativeemail,
  executivegeneralmanagementname = EXCLUDED.executivegeneralmanagementname,
  executivegeneralmanagementemail = EXCLUDED.executivegeneralmanagementemail,
  programandprojectoperationname = EXCLUDED.programandprojectoperationname,
  programandprojectoperationemail = EXCLUDED.programandprojectoperationemail,
  institutionaldevelopmentname = EXCLUDED.institutionaldevelopmentname,
  institutionaldevelopmentemail = EXCLUDED.institutionaldevelopmentemail,
  numberofmembers = EXCLUDED.numberofmembers,
  statusid = EXCLUDED.statusid,
  usercreateid = EXCLUDED.usercreateid;

INSERT INTO governingbody (
  governingbodyid,
  governmentid,
  name,
  position,
  membersince,
  ismemberofotherbody,
  memberofotherbody,
  rfc,
  statusid,
  usercreateid,
  datetimecreate
)
VALUES
  (1, 1, 'Roberto Alejandro Soto', 'Tesorero', 2019, false, NULL, 'SOTO801129ABC', 1, '1', now()),
  (2, 1, 'Patricia Elena Morales', 'Secretaria', 2021, true, 'Consejera en Fundación Educa (Secretaria).', 'MORP750612DEF', 1, '1', now())
ON CONFLICT (governingbodyid) DO UPDATE SET
  governmentid = EXCLUDED.governmentid,
  name = EXCLUDED.name,
  position = EXCLUDED.position,
  membersince = EXCLUDED.membersince,
  ismemberofotherbody = EXCLUDED.ismemberofotherbody,
  memberofotherbody = EXCLUDED.memberofotherbody,
  rfc = EXCLUDED.rfc,
  statusid = EXCLUDED.statusid,
  usercreateid = EXCLUDED.usercreateid;

-- Keep identity sequences ahead of the seeded fixtures so API inserts do not collide.
SELECT setval('government_governmentid_seq', (SELECT MAX(governmentid) FROM government));
SELECT setval('governingbody_governingbodyid_seq', (SELECT MAX(governingbodyid) FROM governingbody));
