import type { Generated, Timestamp } from './common.types';

export interface Aspnetroles {
  id: string;
  name: string;
}

export interface Aspnetuserroles {
  roleid: string;
  userid: string;
}

export interface Aspnetusers {
  accessfailedcount: number;
  email: string | null;
  emailconfirmed: boolean;
  id: string;
  lockoutenabled: boolean;
  lockoutenddateutc: Timestamp | null;
  passwordhash: string | null;
  phonenumber: string | null;
  phonenumberconfirmed: boolean;
  securitystamp: string | null;
  twofactorenabled: boolean;
  username: string;
}

export interface AuthSessions {
  created_at: Generated<Timestamp>;
  expires_at: Timestamp;
  id: string;
  security_stamp_at_issue: string;
  user_id: string;
}

export interface Userprofile {
  countryid: number | null;
  datetimecreate: Timestamp;
  datetimelastupdate: Timestamp | null;
  email: string;
  externalid: string | null;
  fileid: number | null;
  fullinstitutionname: string;
  institutionname: string;
  internalid: string;
  nationalregistrynumber: string | null;
  statusid: number;
  usercreateid: string;
  userprofileid: Generated<number>;
  userupdateid: string | null;
}
