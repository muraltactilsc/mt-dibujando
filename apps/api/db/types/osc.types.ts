import type { Generated, Timestamp } from './common.types';

export interface Legalbase {
  datetimecreate: Timestamp;
  datetimelastupdate: Timestamp | null;
  goubernamentalauthorizationdate: Timestamp;
  isauthorized: boolean;
  lastprotocolizationdate: Timestamp | null;
  legalbaseid: Generated<number>;
  organizationconstitutiondate: Timestamp;
  oscprofileid: number | null;
  socialobjetive: string;
  statusid: number;
  usercreated: string;
  userprofileid: number;
  userupdatedid: string | null;
}

export interface Oscprofile {
  actionlineid: number | null;
  actionlinesecondaryid: number | null;
  address: string | null;
  city: string;
  contactemail: string;
  contactmobilephone: string | null;
  contactname: string;
  contactposition: string;
  contacttelephone: string | null;
  contacttelephoneext: string | null;
  countryid: number;
  datetimecreate: Timestamp;
  datetimelastupdate: Timestamp | null;
  dynamicsoscprofileid: string | null;
  dynamicsoscstatusid: string | null;
  dynamicsstatusid: string | null;
  email: string;
  financeemailsent: boolean | null;
  financeministrynumber: string | null;
  name: string;
  nationalregistrynumber: string;
  oscprofileid: Generated<number>;
  oscstatusid: number | null;
  osctypeconstitutionid: number;
  osctypeid: number;
  postalcode: string;
  reference: string | null;
  socialreason: string;
  stateid: number;
  statusid: number;
  updatedfinance: boolean | null;
  usercreateid: string;
  userprofileid: number;
  userupdateid: string | null;
}
