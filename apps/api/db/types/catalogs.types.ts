import type { Generated, Timestamp } from './common.types';

export interface Actionline {
  actionlineid: Generated<number>;
  datetimecreate: Timestamp;
  datetimelastupdate: Timestamp | null;
  description: string;
  dynamicsactionlineid: string | null;
  dynamicsstatusid: string;
  name: string;
  statusid: number;
  usercreateid: string;
  userupdateid: string | null;
}

export interface Actionlinesecondary {
  actionlinesecondaryid: Generated<number>;
  datetimecreate: Timestamp;
  datetimelastupdate: Timestamp | null;
  description: string;
  dynamicsactionlinesecondaryid: string | null;
  dynamicsstatusid: string;
  name: string;
  statusid: number;
  usercreateid: string;
  userupdateid: string | null;
}

export interface Agegroup {
  agegroupid: Generated<number>;
  agegroupname: string;
  datetimecreate: Timestamp;
  datetimelastupdate: Timestamp | null;
  foraplication: Generated<boolean>;
  order: number;
  statusid: number;
  usercreateid: string;
  userupdateid: string | null;
}

export interface Country {
  countryid: Generated<number>;
  datetimecreate: Timestamp;
  datetimelastupdate: Timestamp | null;
  description: string;
  dynamicscountryid: string | null;
  dynamicsstatusid: string;
  name: string;
  statusid: number;
  usercreateid: string;
  userupdateid: string | null;
}

export interface Donationtype {
  datetimecreate: Timestamp;
  datetimelastupdate: Timestamp | null;
  donationtypeid: Generated<number>;
  name: string;
  order: number;
  statusid: number;
  usercreateid: string;
  userupdateid: string | null;
}

export interface Donortype {
  datetimecreate: Timestamp;
  datetimelastupdate: Timestamp | null;
  donortypeid: Generated<number>;
  name: string;
  order: number;
  statusid: number;
  usercreateid: string;
  userupdateid: string | null;
}

export interface Financedate {
  activity: string;
  datetimecreate: Timestamp;
  datetimelastupdate: Timestamp | null;
  description: string;
  endday: number | null;
  endmonth: number | null;
  financedateid: Generated<number>;
  startday: number;
  startmonth: number;
  statusid: number;
  usercreateid: string;
  userupdateid: string | null;
}

export interface Financingtype {
  datetimecreate: Timestamp;
  datetimelastupdate: Timestamp | null;
  description: string;
  dynamicsfinancingtypeid: string;
  dynamicsstatusid: string;
  financingtypeid: Generated<number>;
  name: string;
  statusid: number;
  usercreateid: string;
  userupdateid: string | null;
}

export interface Incomeexpenseconcept {
  concepttypeid: number;
  datetimecreate: Timestamp;
  datetimelastupdate: Timestamp | null;
  incomeexpenseconceptid: Generated<number>;
  name: string;
  order: number;
  statusid: number;
  usercreateid: string;
  userupdateid: string | null;
}

export interface Oscstatus {
  datetimecreate: Timestamp;
  datetimelastupdate: Timestamp | null;
  description: string;
  dynamicsoscstatusid: string;
  dynamicsstatusid: string;
  name: string;
  oscstatusid: Generated<number>;
  statusid: number;
  usercreateid: string;
  userupdateid: string | null;
}

export interface Osctype {
  datetimecreate: Timestamp;
  datetimelastupdate: Timestamp | null;
  description: string;
  dynamicsosctypeid: string;
  dynamicsstatusid: string;
  name: string;
  osctypeid: Generated<number>;
  statusid: number;
  usercreateid: string;
  userupdateid: string | null;
}

export interface Osctypeconstitution {
  datetimecreate: Timestamp;
  datetimelastupdate: Timestamp | null;
  description: string;
  dynamicsosctypeconstitutionid: string | null;
  dynamicsstatusid: string;
  name: string;
  osctypeconstitutionid: Generated<number>;
  statusid: number;
  usercreateid: string;
  userupdateid: string | null;
}

export interface Personalsituation {
  datetimecreate: Timestamp;
  datetimelastupdate: Timestamp | null;
  order: number;
  personalsituationid: Generated<number>;
  personalsituationname: string;
  statusid: number;
  usercreateid: string;
  userupdateid: string | null;
}

export interface State {
  countryid: number;
  datetimecreate: Timestamp;
  datetimelastupdate: Timestamp | null;
  description: string;
  dynamicscountryid: string | null;
  dynamicsstateid: string | null;
  dynamicsstatusid: string;
  name: string;
  stateid: Generated<number>;
  statusid: number;
  usercreateid: string;
  userupdateid: string | null;
}
