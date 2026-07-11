-- Real production catalog seed data.
--
-- These rows were extracted directly from the original .bacpac backup of the
-- production SQL Server database (via a temporary SQL Server container + bcp
-- import) and contain real Dynamics CRM GUIDs, real local ids, and real
-- statusid values as they exist in production.
--
-- They are NOT synthetic placeholders. Eventually they will be superseded and
-- reconciled by a real CRM sync job (a later task). Until then, their local ids
-- are authoritative for this seed only.
--
-- Note: two rows in production had NULL local ids (osctype 'Prevención/Protección
-- contra la trata' and incomeexpenseconcept 'Captación de recursos económicos por
-- otras actividades'). Because these columns are NOT NULL primary keys, those NULLs
-- are substituted with explicit ids (17 and 18 respectively) that do not collide
-- with the other seeded rows.

-- country: 2 real rows from production (Dynamics-synced catalog)
INSERT INTO country (countryid, dynamicscountryid, name, description, statusid, dynamicsstatusid, usercreateid, datetimecreate, userupdateid, datetimelastupdate)
VALUES
  (1, '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'México', '', 1, '1', '1', '2020-06-24 12:19:52.520', '1', '2026-07-10 05:35:04'),
  (2, 'ed54f5e3-cb6a-ea11-a812-000d3a1ab3c7', 'Costa Rica', '', 1, '1', '1', '2020-06-24 12:19:52.537', '1', '2026-07-10 05:35:04')
ON CONFLICT (countryid) DO UPDATE SET dynamicscountryid = EXCLUDED.dynamicscountryid, name = EXCLUDED.name, description = EXCLUDED.description, statusid = EXCLUDED.statusid, dynamicsstatusid = EXCLUDED.dynamicsstatusid, usercreateid = EXCLUDED.usercreateid, datetimecreate = EXCLUDED.datetimecreate, userupdateid = EXCLUDED.userupdateid, datetimelastupdate = EXCLUDED.datetimelastupdate;
SELECT setval('country_countryid_seq', (SELECT MAX(countryid) FROM country));

-- state: 45 real rows from production (Dynamics-synced catalog)
INSERT INTO state (stateid, dynamicsstateid, dynamicscountryid, name, description, statusid, dynamicsstatusid, usercreateid, datetimecreate, userupdateid, datetimelastupdate, countryid)
VALUES
  (1, '3640dcd7-cb6a-ea11-a812-000d3a1ab3c7', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Hidalgo', '', 1, '1', '1', '2020-06-24 12:19:53.357', '1', '2026-07-10 05:35:05', 1),
  (2, '44acfadd-cb6a-ea11-a812-000d3a1ab3c7', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Durango', '', 1, '1', '1', '2020-06-24 12:19:53.363', '1', '2026-07-10 05:35:05', 1),
  (3, '0f774e53-486d-ea11-a811-000d3a1abbdd', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Aguascalientes', '', 1, '1', '1', '2020-06-24 12:19:53.367', '1', '2026-07-10 05:35:05', 1),
  (4, '03394959-486d-ea11-a811-000d3a1abbdd', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Baja California', '', 2, '2', '1', '2020-06-24 12:19:53.370', '1', '2020-07-21 16:38:50', 1),
  (5, 'b75c3c65-486d-ea11-a811-000d3a1abbdd', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Baja California Sur', '', 2, '2', '1', '2020-06-24 12:19:53.377', '1', '2020-07-21 16:38:50', 1),
  (6, '8820376b-486d-ea11-a811-000d3a1abbdd', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Campeche', '', 2, '2', '1', '2020-06-24 12:19:53.383', '1', '2020-07-21 16:38:50', 1),
  (7, '65944271-486d-ea11-a811-000d3a1abbdd', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Coahuila', '', 1, '1', '1', '2020-06-24 12:19:53.383', '1', '2026-07-10 05:35:05', 1),
  (8, 'eb7f4477-486d-ea11-a811-000d3a1abbdd', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Colima', '', 1, '1', '1', '2020-06-24 12:19:53.387', '1', '2026-07-10 05:35:05', 1),
  (9, 'bba0b5c5-486d-ea11-a811-000d3a1abbdd', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Guanajuato', '', 1, '1', '1', '2020-06-24 12:19:53.477', '1', '2026-07-10 05:35:06', 1),
  (10, 'afebb9cb-486d-ea11-a811-000d3a1abbdd', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Guerrero', '', 1, '1', '1', '2020-06-24 12:19:53.483', '1', '2026-07-10 05:35:06', 1),
  (11, 'f8acb4d1-486d-ea11-a811-000d3a1abbdd', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Jalisco', '', 2, '2', '1', '2020-06-24 12:19:53.483', '1', '2021-02-04 22:19:03', 1),
  (12, 'a333b4d7-486d-ea11-a811-000d3a1abbdd', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Estado de México', '', 1, '1', '1', '2020-06-24 12:19:53.487', '1', '2026-07-10 05:35:06', 1),
  (13, '10f5aedd-486d-ea11-a811-000d3a1abbdd', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Michoacán', '', 1, '1', '1', '2020-06-24 12:19:53.493', '1', '2026-07-10 05:35:06', 1),
  (14, 'd4f2c3e3-486d-ea11-a811-000d3a1abbdd', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Morelos', '', 1, '1', '1', '2020-06-24 12:19:53.500', '1', '2026-07-10 05:35:06', 1),
  (15, '16dbc5e9-486d-ea11-a811-000d3a1abbdd', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Nayarit', '', 1, '1', '1', '2020-06-24 12:19:53.500', '1', '2026-07-10 05:35:06', 1),
  (16, '3d54e501-496d-ea11-a811-000d3a1abbdd', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Oaxaca', '', 2, '2', '1', '2020-06-24 12:19:53.520', '1', '2021-02-04 22:19:03', 1),
  (17, '6dda0308-496d-ea11-a811-000d3a1abbdd', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Puebla', '', 1, '1', '1', '2020-06-24 12:19:53.527', '1', '2026-07-10 05:35:06', 1),
  (18, 'a5fe000e-496d-ea11-a811-000d3a1abbdd', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Querétaro', '', 1, '1', '1', '2020-06-24 12:19:53.530', '1', '2026-07-10 05:35:06', 1),
  (19, 'aa5df913-496d-ea11-a811-000d3a1abbdd', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Quintana Roo', '', 1, '1', '1', '2020-06-24 12:19:53.530', '1', '2026-07-10 05:35:06', 1),
  (20, 'cae3f819-496d-ea11-a811-000d3a1abbdd', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'San Luis Potosí', '', 1, '1', '1', '2020-06-24 12:19:53.540', '1', '2026-07-10 05:35:07', 1),
  (21, 'eb2efd1f-496d-ea11-a811-000d3a1abbdd', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Sinaloa', '', 1, '1', '1', '2020-06-24 12:19:53.543', '1', '2026-07-10 05:35:07', 1),
  (22, '58b4fc25-496d-ea11-a811-000d3a1abbdd', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Sonora', '', 1, '1', '1', '2020-06-24 12:19:53.550', '1', '2026-07-10 05:35:07', 1),
  (23, 'f4b4fc25-496d-ea11-a811-000d3a1abbdd', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Tabasco', '', 1, '1', '1', '2020-06-24 12:19:53.557', '1', '2026-07-10 05:35:07', 1),
  (24, 'd53afc2b-496d-ea11-a811-000d3a1abbdd', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Tamaulipas', '', 1, '1', '1', '2020-06-24 12:19:53.560', '1', NULL, 1),
  (25, '8a5ef931-496d-ea11-a811-000d3a1abbdd', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Tlaxcala', '', 1, '1', '1', '2020-06-24 12:19:53.563', '1', '2026-07-10 05:35:07', 1),
  (26, 'de6e0238-496d-ea11-a811-000d3a1abbdd', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Veracruz', '', 1, '1', '1', '2020-06-24 12:19:53.563', '1', '2026-07-10 05:35:07', 1),
  (27, '55cdfa3d-496d-ea11-a811-000d3a1abbdd', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Yucatán', '', 1, '1', '1', '2020-06-24 12:19:53.567', '1', '2026-07-10 05:35:07', 1),
  (28, '3c8ef543-496d-ea11-a811-000d3a1abbdd', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Zacatecas', '', 1, '1', '1', '2020-06-24 12:19:53.567', '1', '2026-07-10 05:35:07', 1),
  (29, '4d850b5c-496d-ea11-a811-000d3a1abbdd', 'ed54f5e3-cb6a-ea11-a812-000d3a1ab3c7', 'San José', '', 1, '1', '1', '2020-06-24 12:19:53.567', '1', '2026-07-10 05:35:07', 2),
  (30, '28490662-496d-ea11-a811-000d3a1abbdd', 'ed54f5e3-cb6a-ea11-a812-000d3a1ab3c7', 'Alajuela', '', 2, '2', '1', '2020-06-24 12:19:53.570', '1', '2020-07-21 16:38:50', 2),
  (31, 'c7950a68-496d-ea11-a811-000d3a1abbdd', 'ed54f5e3-cb6a-ea11-a812-000d3a1ab3c7', 'Cartago', '', 1, '1', '1', '2020-06-24 12:19:53.570', '1', '2026-07-10 05:35:08', 2),
  (32, '3920356e-496d-ea11-a811-000d3a1abbdd', 'ed54f5e3-cb6a-ea11-a812-000d3a1ab3c7', 'Heredia', '', 1, '1', '1', '2020-06-24 12:19:53.570', '1', '2026-07-10 05:35:08', 2),
  (33, 'ac424574-496d-ea11-a811-000d3a1abbdd', 'ed54f5e3-cb6a-ea11-a812-000d3a1ab3c7', 'Guanacaste', '', 1, '1', '1', '2020-06-24 12:19:53.570', '1', '2026-07-10 05:35:08', 2),
  (34, '882c477a-496d-ea11-a811-000d3a1abbdd', 'ed54f5e3-cb6a-ea11-a812-000d3a1ab3c7', 'Puntarenas', '', 1, '1', '1', '2020-06-24 12:19:53.570', '1', '2026-07-10 05:35:08', 2),
  (35, 'c6176880-496d-ea11-a811-000d3a1abbdd', 'ed54f5e3-cb6a-ea11-a812-000d3a1ab3c7', 'Limón', '', 1, '1', '1', '2020-06-24 12:19:53.573', '1', '2026-07-10 05:35:08', 2),
  (36, 'fb914d7d-486d-ea11-a811-000d3a1abbdd', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Chiapas', '', 1, '1', '1', '2020-06-24 12:20:01.370', NULL, '2026-07-10 05:35:08', 1),
  (37, '373276b9-486d-ea11-a811-000d3a1abbdd', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Chihuahua', '', 1, '1', '1', '2020-06-24 12:20:01.373', '1', '2026-07-10 05:35:08', 1),
  (38, 'fd55b1bf-486d-ea11-a811-000d3a1abbdd', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Ciudad de México', '', 1, '1', '1', '2020-06-24 12:20:01.373', '1', '2026-07-10 05:35:08', 1),
  (39, '2271cef5-486d-ea11-a811-000d3a1abbdd', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Nuevo León', '', 1, '1', '1', '2020-06-24 12:20:01.373', '1', '2026-07-10 05:35:09', 1),
  (40, '4722d99f-d2b7-ea11-a812-000d3a1ab3c7', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Baja California', '', 1, '1', '1', '2020-07-21 16:38:50.760', '1', '2026-07-10 05:35:09', 1),
  (41, '490af7ab-d2b7-ea11-a812-000d3a1ab3c7', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Baja California Sur', '', 1, '1', '1', '2020-07-21 16:38:50.797', '1', '2026-07-10 05:35:09', 1),
  (42, '75e673d6-d2b7-ea11-a812-000d3a1ab3c7', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Campeche', '', 1, '1', '1', '2020-07-21 16:38:50.807', '1', '2026-07-10 05:35:09', 1),
  (43, '0bb9b0e2-d2b7-ea11-a812-000d3a1ab3c7', 'ed54f5e3-cb6a-ea11-a812-000d3a1ab3c7', 'Alajuela', '', 1, '1', '1', '2020-07-21 16:38:50.820', '1', '2026-07-10 05:35:09', 2),
  (44, 'f8acb4d1-486d-ea11-a811-000d3a1abbdd', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Jalisco', '', 1, '1', '1', '2021-02-08 18:41:08.640', '1', '2026-07-10 05:35:09', 1),
  (45, '3d54e501-496d-ea11-a811-000d3a1abbdd', '9a86ced1-cb6a-ea11-a812-000d3a1ab3c7', 'Oaxaca', '', 1, '1', '1', '2021-02-08 18:41:08.640', '1', '2026-07-10 05:35:09', 1)
ON CONFLICT (stateid) DO UPDATE SET dynamicsstateid = EXCLUDED.dynamicsstateid, dynamicscountryid = EXCLUDED.dynamicscountryid, name = EXCLUDED.name, description = EXCLUDED.description, statusid = EXCLUDED.statusid, dynamicsstatusid = EXCLUDED.dynamicsstatusid, usercreateid = EXCLUDED.usercreateid, datetimecreate = EXCLUDED.datetimecreate, userupdateid = EXCLUDED.userupdateid, datetimelastupdate = EXCLUDED.datetimelastupdate, countryid = EXCLUDED.countryid;
SELECT setval('state_stateid_seq', (SELECT MAX(stateid) FROM state));

-- osctype: 17 real rows from production (Dynamics-synced catalog)
INSERT INTO osctype (osctypeid, dynamicsosctypeid, name, description, statusid, dynamicsstatusid, usercreateid, datetimecreate, userupdateid, datetimelastupdate)
VALUES
  (1, '206430000', 'Casa Hogar', '', 1, '1', '1', '2020-07-21 16:40:00.053', '1', '2021-06-09 05:41:59'),
  (2, '206430001', 'Escuela', '', 1, '1', '1', '2020-07-21 16:40:00.067', '1', '2021-06-09 05:41:59'),
  (3, '206430002', 'Centro de Día / Centro Comunitario', '', 1, '1', '1', '2020-07-21 16:40:00.073', '1', '2021-06-09 05:41:59'),
  (4, '206430003', 'Centro de Día', '', 1, '1', '1', '2020-07-21 16:40:00.080', '1', '2021-06-09 05:41:59'),
  (5, '206430004', 'Centro Comunitario', '', 1, '1', '1', '2020-07-21 16:40:00.090', '1', '2021-06-09 05:41:59'),
  (6, '206430005', 'Centro Deportivo', '', 1, '1', '1', '2020-07-21 16:40:00.093', '1', '2021-06-09 05:41:59'),
  (7, '206430006', 'Centro Terapéutico', '', 1, '1', '1', '2020-07-21 16:40:00.097', '1', '2021-06-09 05:41:59'),
  (8, '206430007', 'Comedor / Nutrición / Banco de Alimentos', '', 1, '1', '1', '2020-07-21 16:40:00.097', '1', '2021-06-09 05:41:59'),
  (9, '206430008', 'Casa Hogar / Escuela', '', 1, '1', '1', '2020-07-21 16:40:00.100', '1', '2021-06-09 05:41:59'),
  (10, '206430010', 'Desarrollo Comunitario', '', 1, '1', '1', '2020-07-21 16:40:00.103', '1', '2021-06-09 05:41:59'),
  (11, '206430011', 'Discapacidad', '', 1, '1', '1', '2020-07-21 16:40:00.107', '1', '2021-06-09 05:41:59'),
  (12, '206430012', 'Educación Especial', '', 1, '1', '1', '2020-07-21 16:40:00.113', '1', '2021-06-09 05:41:59'),
  (13, '206430014', 'Fundación de Segundo Piso', '', 1, '1', '1', '2020-07-21 16:40:00.113', '1', '2021-06-09 05:41:59'),
  (14, '206430015', 'Hospital', '', 1, '1', '1', '2020-07-21 16:40:00.113', '1', '2021-06-09 05:41:59'),
  (15, '206430016', 'Proyectos Productivos', '', 1, '1', '1', '2020-07-21 16:40:00.120', '1', '2021-06-09 05:41:59'),
  (16, '206430009', 'Salud', '', 1, '1', '1', '2020-07-21 16:40:00.123', '1', '2021-06-09 05:41:59'),
  (17, '206430013', 'Prevención/Protección contra la trata', '', 1, '1', '1', '2023-10-18 00:00:00', '1', '2023-10-18 00:00:00')
ON CONFLICT (osctypeid) DO UPDATE SET dynamicsosctypeid = EXCLUDED.dynamicsosctypeid, name = EXCLUDED.name, description = EXCLUDED.description, statusid = EXCLUDED.statusid, dynamicsstatusid = EXCLUDED.dynamicsstatusid, usercreateid = EXCLUDED.usercreateid, datetimecreate = EXCLUDED.datetimecreate, userupdateid = EXCLUDED.userupdateid, datetimelastupdate = EXCLUDED.datetimelastupdate;
SELECT setval('osctype_osctypeid_seq', (SELECT MAX(osctypeid) FROM osctype));

-- actionline: 7 real rows from production (Dynamics-synced catalog)
INSERT INTO actionline (actionlineid, dynamicsactionlineid, name, description, statusid, dynamicsstatusid, usercreateid, datetimecreate, userupdateid, datetimelastupdate)
VALUES
  (1, '206430000', 'Salud', '', 1, '1', '1', '2020-07-21 16:40:12.100', '1', '2021-06-09 05:42:00'),
  (2, '206430001', 'Educación', '', 1, '1', '1', '2020-07-21 16:40:12.110', '1', '2021-06-09 05:42:00'),
  (3, '206430002', 'Discapacidad', '', 1, '1', '1', '2020-07-21 16:40:12.117', '1', '2021-06-09 05:42:00'),
  (4, '206430003', 'Nutrición', '', 1, '1', '1', '2020-07-21 16:40:12.120', '1', '2021-06-09 05:42:00'),
  (5, '206430004', 'Alimentación', '', 1, '1', '1', '2020-07-21 16:40:12.120', '1', '2021-06-09 05:42:00'),
  (6, '206430005', 'Prevención', '', 1, '1', '1', '2020-07-21 16:40:12.120', '1', '2021-06-09 05:42:00'),
  (7, '206430006', 'Género', '', 1, '1', '1', '2020-07-21 16:40:12.123', '1', '2021-06-09 05:42:00')
ON CONFLICT (actionlineid) DO UPDATE SET dynamicsactionlineid = EXCLUDED.dynamicsactionlineid, name = EXCLUDED.name, description = EXCLUDED.description, statusid = EXCLUDED.statusid, dynamicsstatusid = EXCLUDED.dynamicsstatusid, usercreateid = EXCLUDED.usercreateid, datetimecreate = EXCLUDED.datetimecreate, userupdateid = EXCLUDED.userupdateid, datetimelastupdate = EXCLUDED.datetimelastupdate;
SELECT setval('actionline_actionlineid_seq', (SELECT MAX(actionlineid) FROM actionline));

-- actionlinesecondary: 7 real rows from production (Dynamics-synced catalog)
INSERT INTO actionlinesecondary (actionlinesecondaryid, dynamicsactionlinesecondaryid, name, description, statusid, dynamicsstatusid, usercreateid, datetimecreate, userupdateid, datetimelastupdate)
VALUES
  (1, '206430000', 'Salud', '', 1, '1', '1', '2020-07-21 16:40:13.037', '1', '2021-06-09 05:42:01'),
  (2, '206430001', 'Educación', '', 1, '1', '1', '2020-07-21 16:40:13.040', '1', '2021-06-09 05:42:01'),
  (3, '206430002', 'Discapacidad', '', 1, '1', '1', '2020-07-21 16:40:13.043', '1', '2021-06-09 05:42:01'),
  (4, '206430003', 'Nutrición', '', 1, '1', '1', '2020-07-21 16:40:13.043', '1', '2021-06-09 05:42:01'),
  (5, '206430004', 'Alimentación', '', 1, '1', '1', '2020-07-21 16:40:13.047', '1', '2021-06-09 05:42:01'),
  (6, '206430005', 'Prevención', '', 1, '1', '1', '2020-07-21 16:40:13.047', '1', '2021-06-09 05:42:01'),
  (7, '206430006', 'Género', '', 1, '1', '1', '2020-07-21 16:40:13.050', '1', '2021-06-09 05:42:01')
ON CONFLICT (actionlinesecondaryid) DO UPDATE SET dynamicsactionlinesecondaryid = EXCLUDED.dynamicsactionlinesecondaryid, name = EXCLUDED.name, description = EXCLUDED.description, statusid = EXCLUDED.statusid, dynamicsstatusid = EXCLUDED.dynamicsstatusid, usercreateid = EXCLUDED.usercreateid, datetimecreate = EXCLUDED.datetimecreate, userupdateid = EXCLUDED.userupdateid, datetimelastupdate = EXCLUDED.datetimelastupdate;
SELECT setval('actionlinesecondary_actionlinesecondaryid_seq', (SELECT MAX(actionlinesecondaryid) FROM actionlinesecondary));

-- osctypeconstitution: 5 real rows from production (Dynamics-synced catalog)
INSERT INTO osctypeconstitution (osctypeconstitutionid, dynamicsosctypeconstitutionid, name, description, statusid, dynamicsstatusid, usercreateid, datetimecreate, userupdateid, datetimelastupdate)
VALUES
  (1, '206430000', 'A.C.', '', 1, '1', '1', '2020-09-10 09:45:43.513', '1', '2021-06-09 05:42:05'),
  (2, '206430001', 'I.A.P.', '', 1, '1', '1', '2020-09-10 09:45:43.517', '1', '2021-06-09 05:42:05'),
  (3, '206430002', 'I.B.P', '', 1, '1', '1', '2020-09-10 09:45:43.520', '1', '2021-06-09 05:42:05'),
  (4, '206430003', 'A.B.P', '', 1, '1', '1', '2020-09-10 09:45:43.520', '1', '2021-06-09 05:42:05'),
  (5, '206430004', 'No aplica', '', 1, '1', '1', '2020-09-24 03:18:28.523', '1', '2021-06-09 05:42:05')
ON CONFLICT (osctypeconstitutionid) DO UPDATE SET dynamicsosctypeconstitutionid = EXCLUDED.dynamicsosctypeconstitutionid, name = EXCLUDED.name, description = EXCLUDED.description, statusid = EXCLUDED.statusid, dynamicsstatusid = EXCLUDED.dynamicsstatusid, usercreateid = EXCLUDED.usercreateid, datetimecreate = EXCLUDED.datetimecreate, userupdateid = EXCLUDED.userupdateid, datetimelastupdate = EXCLUDED.datetimelastupdate;
SELECT setval('osctypeconstitution_osctypeconstitutionid_seq', (SELECT MAX(osctypeconstitutionid) FROM osctypeconstitution));

-- oscstatus: 5 real rows from production (Dynamics-synced catalog)
INSERT INTO oscstatus (oscstatusid, dynamicsoscstatusid, name, description, statusid, dynamicsstatusid, usercreateid, datetimecreate, userupdateid, datetimelastupdate)
VALUES
  (1, '206430000', 'Enviado', '', 1, '1', '1', '2020-07-21 16:39:59.110', '1', '2021-06-09 05:41:59'),
  (2, '206430001', 'En revisión', '', 1, '1', '1', '2020-07-21 16:39:59.120', '1', '2021-06-09 05:41:59'),
  (3, '206430002', 'Aprobado', '', 1, '1', '1', '2020-07-21 16:39:59.127', '1', '2021-06-09 05:41:59'),
  (4, '206430003', 'Rechazado', '', 1, '1', '1', '2020-07-21 16:39:59.130', '1', '2021-06-09 05:41:59'),
  (5, '206430004', 'Expirado', '', 1, '1', '1', '2020-07-21 16:39:59.133', '1', '2021-06-09 05:41:59')
ON CONFLICT (oscstatusid) DO UPDATE SET dynamicsoscstatusid = EXCLUDED.dynamicsoscstatusid, name = EXCLUDED.name, description = EXCLUDED.description, statusid = EXCLUDED.statusid, dynamicsstatusid = EXCLUDED.dynamicsstatusid, usercreateid = EXCLUDED.usercreateid, datetimecreate = EXCLUDED.datetimecreate, userupdateid = EXCLUDED.userupdateid, datetimelastupdate = EXCLUDED.datetimelastupdate;
SELECT setval('oscstatus_oscstatusid_seq', (SELECT MAX(oscstatusid) FROM oscstatus));

-- agegroup: 7 real rows from production (Dynamics-synced catalog)
INSERT INTO agegroup (agegroupid, agegroupname, "order", foraplication, statusid, usercreateid, datetimecreate, userupdateid, datetimelastupdate)
VALUES
  (1, 'Primera infancia 0 a  3 años', 1, true, 1, '1', '2020-03-24 19:00:33.567', '1', '2020-05-12 12:40:43.087'),
  (2, 'Segunda infancia 4 a 12 años', 2, true, 1, '1', '2020-03-24 19:00:33.567', NULL, NULL),
  (3, 'Adolescencia 13 a 17 años', 3, true, 1, '1', '2020-03-24 19:00:33.567', '1', '2020-05-12 12:40:43.093'),
  (4, 'Juventud 18 a 21 años', 4, true, 1, '1', '2020-03-24 19:00:33.567', '1', '2020-05-12 12:40:43.093'),
  (5, 'Adultos 21 años en adelante', 5, false, 1, '1', '2020-03-24 19:00:33.567', NULL, NULL),
  (6, 'Adultos mayores 65 años o más', 6, false, 1, '1', '2020-03-24 19:00:33.567', NULL, NULL),
  (7, 'Subtotales', 7, false, 1, '1', '2020-03-24 19:00:33.567', NULL, NULL)
ON CONFLICT (agegroupid) DO UPDATE SET agegroupname = EXCLUDED.agegroupname, "order" = EXCLUDED."order", foraplication = EXCLUDED.foraplication, statusid = EXCLUDED.statusid, usercreateid = EXCLUDED.usercreateid, datetimecreate = EXCLUDED.datetimecreate, userupdateid = EXCLUDED.userupdateid, datetimelastupdate = EXCLUDED.datetimelastupdate;
SELECT setval('agegroup_agegroupid_seq', (SELECT MAX(agegroupid) FROM agegroup));

-- personalsituation: 3 real rows from production (Dynamics-synced catalog)
INSERT INTO personalsituation (personalsituationid, personalsituationname, "order", statusid, usercreateid, datetimecreate, userupdateid, datetimelastupdate)
VALUES
  (1, 'Número actual de personal en la organización', 1, 1, '1', '2020-03-24 19:03:41.720', NULL, NULL),
  (2, 'Número de empleados que han dejado de laborar en la institución en los últimos 12 meses por renuncia', 2, 1, '1', '2020-03-24 19:03:41.720', NULL, NULL),
  (3, 'Número de empleados que han dejado de laborar en la institución en los últimos 12 meses por despido', 3, 1, '1', '2020-03-24 19:03:41.720', NULL, NULL)
ON CONFLICT (personalsituationid) DO UPDATE SET personalsituationname = EXCLUDED.personalsituationname, "order" = EXCLUDED."order", statusid = EXCLUDED.statusid, usercreateid = EXCLUDED.usercreateid, datetimecreate = EXCLUDED.datetimecreate, userupdateid = EXCLUDED.userupdateid, datetimelastupdate = EXCLUDED.datetimelastupdate;
SELECT setval('personalsituation_personalsituationid_seq', (SELECT MAX(personalsituationid) FROM personalsituation));

-- financingtype: 3 real rows from production (Dynamics-synced catalog)
INSERT INTO financingtype (financingtypeid, dynamicsfinancingtypeid, name, description, statusid, dynamicsstatusid, usercreateid, datetimecreate, userupdateid, datetimelastupdate)
VALUES
  (1, '206430000', 'Fortalecimiento operativo', '', 1, '1', '1', '2020-07-21 16:40:11.073', '1', '2021-06-09 05:41:59'),
  (2, '206430001', 'Infraestructura y equipamiento', '', 1, '1', '1', '2020-07-21 16:40:11.087', '1', '2021-06-09 05:41:59'),
  (3, '206430002', 'Desarrollo integral', '', 1, '1', '1', '2020-07-21 16:40:11.093', '1', '2021-06-09 05:41:59')
ON CONFLICT (financingtypeid) DO UPDATE SET dynamicsfinancingtypeid = EXCLUDED.dynamicsfinancingtypeid, name = EXCLUDED.name, description = EXCLUDED.description, statusid = EXCLUDED.statusid, dynamicsstatusid = EXCLUDED.dynamicsstatusid, usercreateid = EXCLUDED.usercreateid, datetimecreate = EXCLUDED.datetimecreate, userupdateid = EXCLUDED.userupdateid, datetimelastupdate = EXCLUDED.datetimelastupdate;
SELECT setval('financingtype_financingtypeid_seq', (SELECT MAX(financingtypeid) FROM financingtype));

-- donortype: 5 real rows from production (Dynamics-synced catalog)
INSERT INTO donortype (donortypeid, name, "order", statusid, usercreateid, datetimecreate, userupdateid, datetimelastupdate)
VALUES
  (1, 'Persona Física', 1, 1, '1', '2020-04-01 18:24:51.837', NULL, NULL),
  (2, 'Empresarial', 2, 1, '1', '2020-04-01 18:24:51.837', NULL, NULL),
  (3, 'Internacional', 3, 1, '1', '2020-04-01 18:24:51.837', NULL, NULL),
  (4, 'Gubernamental', 4, 1, '1', '2020-04-01 18:24:51.837', NULL, NULL),
  (5, 'Generación de recursos propios', 5, 1, '1', '2020-04-01 18:24:51.837', NULL, NULL)
ON CONFLICT (donortypeid) DO UPDATE SET name = EXCLUDED.name, "order" = EXCLUDED."order", statusid = EXCLUDED.statusid, usercreateid = EXCLUDED.usercreateid, datetimecreate = EXCLUDED.datetimecreate, userupdateid = EXCLUDED.userupdateid, datetimelastupdate = EXCLUDED.datetimelastupdate;
SELECT setval('donortype_donortypeid_seq', (SELECT MAX(donortypeid) FROM donortype));

-- donationtype: 2 real rows from production (Dynamics-synced catalog)
INSERT INTO donationtype (donationtypeid, name, "order", statusid, usercreateid, datetimecreate, userupdateid, datetimelastupdate)
VALUES
  (1, 'Efectivo', 1, 1, '1', '2020-04-01 18:19:35.480', NULL, NULL),
  (2, 'Especie', 2, 1, '1', '2020-04-01 18:19:35.480', NULL, NULL)
ON CONFLICT (donationtypeid) DO UPDATE SET name = EXCLUDED.name, "order" = EXCLUDED."order", statusid = EXCLUDED.statusid, usercreateid = EXCLUDED.usercreateid, datetimecreate = EXCLUDED.datetimecreate, userupdateid = EXCLUDED.userupdateid, datetimelastupdate = EXCLUDED.datetimelastupdate;
SELECT setval('donationtype_donationtypeid_seq', (SELECT MAX(donationtypeid) FROM donationtype));

-- incomeexpenseconcept: 17 real rows from production (Dynamics-synced catalog)
INSERT INTO incomeexpenseconcept (incomeexpenseconceptid, concepttypeid, name, "order", statusid, usercreateid, datetimecreate, userupdateid, datetimelastupdate)
VALUES
  (1, 1, 'Aportaciones de patronos', 1, 1, '1', '2020-03-24 17:10:06.403', NULL, NULL),
  (2, 1, 'Cuotas de asociados', 2, 1, '1', '2020-03-24 17:10:06.403', NULL, NULL),
  (3, 1, 'Donativos de personas físicas', 3, 1, '1', '2020-03-24 17:10:06.403', NULL, NULL),
  (4, 1, 'Donativos de personas morales', 4, 1, '1', '2020-03-24 17:10:06.403', NULL, NULL),
  (5, 1, 'Donativos de organizaciones nacionales de la sociedad civil', 5, 1, '1', '2020-03-24 17:10:06.403', NULL, NULL),
  (6, 1, 'Donativos de organizaciones internacionales de la sociedad civil', 6, 1, '1', '2020-03-24 17:10:06.403', NULL, NULL),
  (7, 1, 'Donativos de organismos gubernamentales', 7, 1, '1', '2020-03-24 17:10:06.403', NULL, NULL),
  (8, 1, 'Donativos para fondos patrimoniales', 8, 1, '1', '2020-03-24 17:10:06.403', NULL, NULL),
  (9, 1, 'Recuperación por servicio asistencial', 9, 1, '1', '2020-03-24 17:10:06.403', NULL, NULL),
  (18, 1, 'Captación de recursos económicos por otras actividades', 10, 1, '1', '2020-03-24 17:10:06.403', NULL, NULL),
  (11, 1, 'Ingresos patrimoniales', 11, 1, '1', '2020-03-24 17:10:06.403', NULL, NULL),
  (12, 1, 'Total', 12, 1, '1', '2020-03-24 17:10:06.403', NULL, NULL),
  (13, 2, 'Gastos administrativos', 1, 1, '1', '2020-03-24 17:10:06.403', NULL, NULL),
  (14, 2, 'Gastos operativos', 2, 1, '1', '2020-03-24 17:10:06.403', NULL, NULL),
  (15, 2, 'Otros gastos', 3, 1, '1', '2020-03-24 17:10:06.403', NULL, NULL),
  (16, 2, 'Total', 4, 1, '1', '2020-03-24 17:10:06.403', NULL, NULL),
  (17, 3, 'Remanente o déficit del ejercicio', 1, 1, '1', '2020-03-24 17:10:06.403', NULL, NULL)
ON CONFLICT (incomeexpenseconceptid) DO UPDATE SET concepttypeid = EXCLUDED.concepttypeid, name = EXCLUDED.name, "order" = EXCLUDED."order", statusid = EXCLUDED.statusid, usercreateid = EXCLUDED.usercreateid, datetimecreate = EXCLUDED.datetimecreate, userupdateid = EXCLUDED.userupdateid, datetimelastupdate = EXCLUDED.datetimelastupdate;
SELECT setval('incomeexpenseconcept_incomeexpenseconceptid_seq', (SELECT MAX(incomeexpenseconceptid) FROM incomeexpenseconcept));

-- financedate: 4 real rows from production (Dynamics-synced catalog)
INSERT INTO financedate (financedateid, activity, description, startday, startmonth, endday, endmonth, statusid, usercreateid, datetimecreate, userupdateid, datetimelastupdate)
VALUES
  (1, 'SendMailUpdateFinances', 'Fecha en la que se enviara Email para notificar que deben actualizar finanzas y se pasaran los registros de finanzas del año anterior a vencidos', 1, 1, NULL, NULL, 1, '1', '2020-05-21 18:32:19.180', NULL, NULL),
  (2, 'ChangeOSCProfileToExpired', 'Fecha en la que se pasaran los perfiles que no actualizaron sus finanzas a expirado tanto en Portal como en Dynamics', 1, 4, NULL, NULL, 1, '1', '2020-05-21 18:32:19.180', NULL, NULL),
  (3, 'ShowErrorMessage', 'Se mostrara este mensaje cuando la informacion del año anterior este vencida, pase el periodo de actualizacion y no se cuente con la informacion del año', 1, 4, NULL, NULL, 1, '1', '2020-05-21 18:32:19.180', NULL, NULL),
  (4, 'ShowWarningMessage', 'Se mostrara este mensaje durante el periodo de actualizacion y si no se actualiza la informacion del año', 1, 1, 31, 3, 1, '1', '2020-05-21 18:32:19.180', NULL, NULL)
ON CONFLICT (financedateid) DO UPDATE SET activity = EXCLUDED.activity, description = EXCLUDED.description, startday = EXCLUDED.startday, startmonth = EXCLUDED.startmonth, endday = EXCLUDED.endday, endmonth = EXCLUDED.endmonth, statusid = EXCLUDED.statusid, usercreateid = EXCLUDED.usercreateid, datetimecreate = EXCLUDED.datetimecreate, userupdateid = EXCLUDED.userupdateid, datetimelastupdate = EXCLUDED.datetimelastupdate;
SELECT setval('financedate_financedateid_seq', (SELECT MAX(financedateid) FROM financedate));