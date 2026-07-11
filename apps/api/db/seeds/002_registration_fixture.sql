-- Registration fixture data: pre-registration quiz and country catalog.
-- Production content will be migrated separately; this is representative placeholder data
-- sufficient for development and automated smoke tests.

INSERT INTO question (questionid, questionstring, "order", statusid, usercreateid, datetimecreate)
VALUES
  (1, '¿Cuál es la capital de México?', 1, 1, '1', now()),
  (2, '¿Cuántos días tiene un año bisiesto?', 2, 1, '1', now()),
  (3, '¿Qué color resulta de mezclar azul y amarillo?', 3, 1, '1', now())
ON CONFLICT (questionid) DO UPDATE SET
  questionstring = EXCLUDED.questionstring,
  "order" = EXCLUDED."order",
  statusid = EXCLUDED.statusid,
  usercreateid = EXCLUDED.usercreateid;

INSERT INTO answer (answerid, questionid, answerstring, iscorrect, "order", statusid, usercreateid, datetimecreate)
VALUES
  (1, 1, 'Ciudad de México', true, 1, 1, '1', now()),
  (2, 1, 'Guadalajara', false, 2, 1, '1', now()),
  (3, 1, 'Monterrey', false, 3, 1, '1', now()),
  (4, 1, 'Puebla', false, 4, 1, '1', now()),
  (5, 2, '365', false, 1, 1, '1', now()),
  (6, 2, '366', true, 2, 1, '1', now()),
  (7, 2, '364', false, 3, 1, '1', now()),
  (8, 2, '367', false, 4, 1, '1', now()),
  (9, 3, 'Rojo', false, 1, 1, '1', now()),
  (10, 3, 'Verde', true, 2, 1, '1', now()),
  (11, 3, 'Naranja', false, 3, 1, '1', now()),
  (12, 3, 'Morado', false, 4, 1, '1', now())
ON CONFLICT (answerid) DO UPDATE SET
  questionid = EXCLUDED.questionid,
  answerstring = EXCLUDED.answerstring,
  iscorrect = EXCLUDED.iscorrect,
  "order" = EXCLUDED."order",
  statusid = EXCLUDED.statusid,
  usercreateid = EXCLUDED.usercreateid;

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
