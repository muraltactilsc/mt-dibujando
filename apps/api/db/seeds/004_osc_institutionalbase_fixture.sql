-- Institutional Base fixture data for the auth fixture user
-- (qa.auth@dibujando.test, userprofileid 1) so the Institutional Base section
-- has real data to exercise. Runs after the auth fixture creates the user profile.

INSERT INTO institutionalbase (
  institutionalbaseid,
  userprofileid,
  oscprofileid,
  organizationhistory,
  organizationmission,
  organizationvision,
  organizationvalues,
  describeproblematic,
  describemodel,
  totalpopulationserved,
  atentionminage,
  atentionmaxage,
  poblationprofile,
  poblationpercentage,
  hasvolunterprogram,
  wantvolunterprogram,
  statusid,
  usercreateid,
  datetimecreate,
  hasstrengtheningprogram,
  strengtheningtype,
  strengtheningorganizationname,
  strengtheningcourseyear,
  hassocialinvestmentadvisor,
  hashumanrightsapproach
)
VALUES (
  1,
  1,
  NULL,
  'Fundada en 2010, la organización trabaja por el bienestar integral de niñas, niños y adolescentes en situación de vulnerabilidad.',
  'Contribuir al desarrollo pleno de la niñez y juventud a través de programas educativos, de salud y nutrición.',
  'Ser una organización referente en la atención integral a la niñez en México y América Latina.',
  'Compromiso, solidaridad, transparencia, responsabilidad y respeto a los derechos humanos.',
  'La pobreza, la violencia familiar y la deserción escolar afectan a miles de niñas, niños y adolescentes en las comunidades donde operamos.',
  'Acompañamiento integral que articula educación, salud, nutrición y fortalecimiento familiar para romper ciclos de vulnerabilidad.',
  350,
  0,
  21,
  'Niñas, niños, adolescentes y jóvenes de 0 a 21 años en situación de vulnerabilidad.',
  78.5,
  true,
  true,
  1,
  '1',
  now(),
  true,
  'Gestión de proyectos, medición de impacto y comunicación institucional.',
  'Cemefi',
  '2023, 2024',
  true,
  true
)
ON CONFLICT (institutionalbaseid) DO UPDATE SET
  userprofileid = EXCLUDED.userprofileid,
  oscprofileid = EXCLUDED.oscprofileid,
  organizationhistory = EXCLUDED.organizationhistory,
  organizationmission = EXCLUDED.organizationmission,
  organizationvision = EXCLUDED.organizationvision,
  organizationvalues = EXCLUDED.organizationvalues,
  describeproblematic = EXCLUDED.describeproblematic,
  describemodel = EXCLUDED.describemodel,
  totalpopulationserved = EXCLUDED.totalpopulationserved,
  atentionminage = EXCLUDED.atentionminage,
  atentionmaxage = EXCLUDED.atentionmaxage,
  poblationprofile = EXCLUDED.poblationprofile,
  poblationpercentage = EXCLUDED.poblationpercentage,
  hasvolunterprogram = EXCLUDED.hasvolunterprogram,
  wantvolunterprogram = EXCLUDED.wantvolunterprogram,
  statusid = EXCLUDED.statusid,
  usercreateid = EXCLUDED.usercreateid,
  hasstrengtheningprogram = EXCLUDED.hasstrengtheningprogram,
  strengtheningtype = EXCLUDED.strengtheningtype,
  strengtheningorganizationname = EXCLUDED.strengtheningorganizationname,
  strengtheningcourseyear = EXCLUDED.strengtheningcourseyear,
  hassocialinvestmentadvisor = EXCLUDED.hassocialinvestmentadvisor,
  hashumanrightsapproach = EXCLUDED.hashumanrightsapproach;

INSERT INTO interventionmodelprograms (
  interventionmodelprogramsid,
  institutionalbaseid,
  programname,
  description,
  mainactivity,
  verificationmeans,
  statusid,
  usercreateid,
  datetimecreate
)
VALUES
  (1, 1, 'Educación para la vida', 'Fortalecimiento de habilidades académicas y socioemocionales.', 'Tutorías, talleres y seguimiento escolar.', 'Listas de asistencia, boletas y reportes de avance.', 1, '1', now()),
  (2, 1, 'Salud y nutrición', 'Atención médica básica, dentistas y alimentación nutritiva.', 'Consultas médicas, despensas y talleres de higiene.', 'Expedientes clínicos, recetas y fotografías.', 1, '1', now())
ON CONFLICT (interventionmodelprogramsid) DO UPDATE SET
  institutionalbaseid = EXCLUDED.institutionalbaseid,
  programname = EXCLUDED.programname,
  description = EXCLUDED.description,
  mainactivity = EXCLUDED.mainactivity,
  verificationmeans = EXCLUDED.verificationmeans,
  statusid = EXCLUDED.statusid,
  usercreateid = EXCLUDED.usercreateid;

INSERT INTO populationserved (
  populationservedid,
  institutionalbaseid,
  agegroupid,
  femenine,
  male,
  notbinary,
  total,
  statusid,
  usercreateid,
  datetimecreate
)
VALUES
  (1, 1, 1, 25, 22, 1, 48, 1, '1', now()),
  (2, 1, 2, 40, 38, 2, 80, 1, '1', now()),
  (3, 1, 3, 35, 30, 1, 66, 1, '1', now()),
  (4, 1, 4, 20, 18, 0, 38, 1, '1', now()),
  (5, 1, 5, 15, 12, 1, 28, 1, '1', now()),
  (6, 1, 6, 8, 6, 0, 14, 1, '1', now()),
  (7, 1, 7, 143, 126, 5, 274, 1, '1', now())
ON CONFLICT (populationservedid) DO UPDATE SET
  institutionalbaseid = EXCLUDED.institutionalbaseid,
  agegroupid = EXCLUDED.agegroupid,
  femenine = EXCLUDED.femenine,
  male = EXCLUDED.male,
  notbinary = EXCLUDED.notbinary,
  total = EXCLUDED.total,
  statusid = EXCLUDED.statusid,
  usercreateid = EXCLUDED.usercreateid;

INSERT INTO operativeteam (
  operativeteamid,
  institutionalbaseid,
  personalsituationid,
  innomina,
  forfees,
  feesforassimilable,
  volunteers,
  practitionersorsocialservice,
  total,
  statusid,
  usercreateid,
  datetimecreate
)
VALUES
  (1, 1, 1, 12, 4, 2, 6, 3, 27, 1, '1', now()),
  (2, 1, 2, 1, 0, 0, 0, 1, 2, 1, '1', now()),
  (3, 1, 3, 0, 0, 0, 0, 0, 0, 1, '1', now())
ON CONFLICT (operativeteamid) DO UPDATE SET
  institutionalbaseid = EXCLUDED.institutionalbaseid,
  personalsituationid = EXCLUDED.personalsituationid,
  innomina = EXCLUDED.innomina,
  forfees = EXCLUDED.forfees,
  feesforassimilable = EXCLUDED.feesforassimilable,
  volunteers = EXCLUDED.volunteers,
  practitionersorsocialservice = EXCLUDED.practitionersorsocialservice,
  total = EXCLUDED.total,
  statusid = EXCLUDED.statusid,
  usercreateid = EXCLUDED.usercreateid;

INSERT INTO volunteeractivities (
  volunteeractivitiesid,
  institutionalbaseid,
  activitytype,
  numberofvolunteer,
  servicehoursrequired,
  investmentrequired,
  idealvolunteerprofile,
  specialprovitions,
  statusid,
  usercreatedid,
  datetimecreate
)
VALUES (
  1,
  1,
  'Apoyo en tutorías escolares',
  5,
  4,
  1500.00,
  'Estudiantes o profesionales de educación con disponibilidad fines de semana.',
  'Traer identificación oficial; no se requiere experiencia previa.',
  1,
  '1',
  now()
)
ON CONFLICT (volunteeractivitiesid) DO UPDATE SET
  institutionalbaseid = EXCLUDED.institutionalbaseid,
  activitytype = EXCLUDED.activitytype,
  numberofvolunteer = EXCLUDED.numberofvolunteer,
  servicehoursrequired = EXCLUDED.servicehoursrequired,
  investmentrequired = EXCLUDED.investmentrequired,
  idealvolunteerprofile = EXCLUDED.idealvolunteerprofile,
  specialprovitions = EXCLUDED.specialprovitions,
  statusid = EXCLUDED.statusid,
  usercreatedid = EXCLUDED.usercreatedid;

-- Keep identity sequences ahead of the seeded fixtures so API inserts do not collide.
SELECT setval('institutionalbase_institutionalbaseid_seq', (SELECT MAX(institutionalbaseid) FROM institutionalbase));
SELECT setval('interventionmodelprograms_interventionmodelprogramsid_seq', (SELECT MAX(interventionmodelprogramsid) FROM interventionmodelprograms));
SELECT setval('populationserved_populationservedid_seq', (SELECT MAX(populationservedid) FROM populationserved));
SELECT setval('operativeteam_operativeteamid_seq', (SELECT MAX(operativeteamid) FROM operativeteam));
SELECT setval('volunteeractivities_volunteeractivitiesid_seq', (SELECT MAX(volunteeractivitiesid) FROM volunteeractivities));
