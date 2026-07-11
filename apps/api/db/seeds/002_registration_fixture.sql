-- Registration fixture data: pre-registration quiz and country catalog.
-- Live legacy eligibility screening questions for children/youth-focused OSC grant program.

INSERT INTO question (questionid, questionstring, "order", statusid, usercreateid, datetimecreate)
VALUES
  (1, '¿Eres una Organización de la Sociedad Civil con más de dos años de haberte constituido?', 1, 1, '1', now()),
  (2, '¿Cuentas con la autorización del Servicio de Administración Tributaria o del Ministerio de Hacienda de tu país para recibir donativos deducibles (Donataria Autorizada)?', 2, 1, '1', now()),
  (3, '¿Dentro de tus programas o actividades brindas atención a Niñas, Niños, Adolescentes y Jóvenes de 0 a 21 años de edad?', 3, 1, '1', now())
ON CONFLICT (questionid) DO UPDATE SET
  questionstring = EXCLUDED.questionstring,
  "order" = EXCLUDED."order",
  statusid = EXCLUDED.statusid,
  usercreateid = EXCLUDED.usercreateid;

INSERT INTO answer (answerid, questionid, answerstring, iscorrect, "order", statusid, usercreateid, datetimecreate)
VALUES
  (1, 1, 'Si', true, 1, 1, '1', now()),
  (2, 1, 'No', false, 2, 1, '1', now()),
  (3, 2, 'Si', true, 1, 1, '1', now()),
  (4, 2, 'No', false, 2, 1, '1', now()),
  (5, 3, 'Si', true, 1, 1, '1', now()),
  (6, 3, 'No', false, 2, 1, '1', now())
ON CONFLICT (answerid) DO UPDATE SET
  questionid = EXCLUDED.questionid,
  answerstring = EXCLUDED.answerstring,
  iscorrect = EXCLUDED.iscorrect,
  "order" = EXCLUDED."order",
  statusid = EXCLUDED.statusid,
  usercreateid = EXCLUDED.usercreateid;

-- Remove stale rows from the old placeholder trivia content on already-seeded dev databases.
DELETE FROM answer WHERE answerid IN (7, 8, 9, 10, 11, 12);
DELETE FROM answer WHERE questionid NOT IN (1, 2, 3);

INSERT INTO country (countryid, dynamicscountryid, name, description, statusid, dynamicsstatusid, usercreateid, datetimecreate)
VALUES
  (1, NULL, 'Argentina', 'Argentina', 1, '1', '1', now()),
  (2, NULL, 'Colombia', 'Colombia', 1, '1', '1', now()),
  (3, NULL, 'España', 'España', 1, '1', '1', now()),
  (4, NULL, 'México', 'México', 1, '1', '1', now()),
  (5, NULL, 'Perú', 'Perú', 1, '1', '1', now())
ON CONFLICT (countryid) DO UPDATE SET
  dynamicscountryid = EXCLUDED.dynamicscountryid,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  statusid = EXCLUDED.statusid,
  dynamicsstatusid = EXCLUDED.dynamicsstatusid,
  usercreateid = EXCLUDED.usercreateid;
