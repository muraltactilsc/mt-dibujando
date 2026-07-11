-- Auth fixture user for integration / smoke tests.
-- This is kept out of the numbered schema scripts on purpose.

INSERT INTO aspnetusers (
  id,
  username,
  email,
  passwordhash,
  securitystamp,
  emailconfirmed,
  lockoutenabled,
  accessfailedcount,
  phonenumberconfirmed,
  twofactorenabled,
  lockoutenddateutc
)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'qa.auth@dibujando.test',
  'qa.auth@dibujando.test',
  'AJ8rvRwshbQ1BGuK952T3xjJKXq57CjhInbHs2LbgJSu/7VSm4DOjzIKi+MDXKuH0Q==',
  '22222222-2222-2222-2222-222222222222',
  true,
  true,
  0,
  false,
  false,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  email = EXCLUDED.email,
  passwordhash = EXCLUDED.passwordhash,
  securitystamp = EXCLUDED.securitystamp,
  emailconfirmed = EXCLUDED.emailconfirmed,
  lockoutenabled = EXCLUDED.lockoutenabled,
  accessfailedcount = EXCLUDED.accessfailedcount,
  phonenumberconfirmed = EXCLUDED.phonenumberconfirmed,
  twofactorenabled = EXCLUDED.twofactorenabled,
  lockoutenddateutc = EXCLUDED.lockoutenddateutc;

INSERT INTO aspnetroles (id, name)
VALUES
  ('c2e45f98-8961-4530-b976-d1cdc4e7e8fb', 'SysAdmin'),
  ('a78a41bb-960e-44f0-994e-f10f8b54e9bc', 'OSCApproved'),
  ('5cbb1883-96c9-402f-8af3-778ccbf64977', 'OSCNotApproved')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO aspnetuserroles (userid, roleid)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'c2e45f98-8961-4530-b976-d1cdc4e7e8fb'
)
ON CONFLICT (userid, roleid) DO NOTHING;

INSERT INTO userprofile (
  email,
  institutionname,
  fullinstitutionname,
  internalid,
  countryid,
  nationalregistrynumber,
  externalid,
  fileid,
  statusid,
  usercreateid,
  datetimecreate
)
VALUES (
  'qa.auth@dibujando.test',
  'QA Test Institution',
  'QA Test Institution',
  '11111111-1111-1111-1111-111111111111'::uuid,
  NULL,
  NULL,
  NULL,
  NULL,
  1,
  '1',
  now()
)
ON CONFLICT (userprofileid) DO UPDATE SET
  email = EXCLUDED.email,
  institutionname = EXCLUDED.institutionname,
  fullinstitutionname = EXCLUDED.fullinstitutionname,
  internalid = EXCLUDED.internalid,
  countryid = EXCLUDED.countryid,
  nationalregistrynumber = EXCLUDED.nationalregistrynumber,
  externalid = EXCLUDED.externalid,
  fileid = EXCLUDED.fileid,
  statusid = EXCLUDED.statusid,
  usercreateid = EXCLUDED.usercreateid,
  datetimecreate = EXCLUDED.datetimecreate;
