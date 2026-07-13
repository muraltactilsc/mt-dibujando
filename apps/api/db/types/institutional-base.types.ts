import type { Generated, Timestamp } from './common.types';

export interface Institutionalbase {
  atentionmaxage: number;
  atentionminage: number;
  datetimecreate: Timestamp;
  datetimelastupdate: Timestamp | null;
  describemodel: string;
  describeproblematic: string;
  hashumanrightsapproach: boolean | null;
  hassocialinvestmentadvisor: boolean | null;
  hasstrengtheningprogram: boolean | null;
  hasvolunterprogram: boolean;
  institutionalbaseid: Generated<number>;
  organizationhistory: string;
  organizationmission: string;
  organizationvalues: string;
  organizationvision: string;
  oscprofileid: number | null;
  poblationpercentage: number;
  poblationprofile: string;
  statusid: number;
  strengtheningcourseyear: string | null;
  strengtheningorganizationname: string | null;
  strengtheningtype: string | null;
  totalpopulationserved: number;
  usercreateid: string;
  userprofileid: number;
  userupdateid: string | null;
  wantvolunterprogram: boolean;
}

export interface Interventionmodelprograms {
  datetimecreate: Timestamp;
  datetimelastupdate: Timestamp | null;
  description: string;
  institutionalbaseid: number;
  interventionmodelprogramsid: Generated<number>;
  mainactivity: string;
  programname: string;
  statusid: number;
  usercreateid: string;
  userupdateid: string | null;
  verificationmeans: string;
}

export interface Operativeteam {
  datetimecreate: Timestamp;
  datetimelastupdate: Timestamp | null;
  feesforassimilable: number;
  forfees: number;
  innomina: number;
  institutionalbaseid: number;
  operativeteamid: Generated<number>;
  personalsituationid: number;
  practitionersorsocialservice: number;
  statusid: number;
  total: number;
  usercreateid: string;
  userupdateid: string | null;
  volunteers: number;
}

export interface Populationserved {
  agegroupid: number;
  datetimecreate: Timestamp;
  datetimelastupdate: Timestamp | null;
  femenine: number | null;
  institutionalbaseid: number;
  male: number | null;
  notbinary: number | null;
  populationservedid: Generated<number>;
  statusid: number;
  total: number | null;
  usercreateid: string;
  userupdateid: string | null;
}

export interface Volunteeractivities {
  activitytype: string;
  datetimecreate: Timestamp;
  datetimelastupdate: Timestamp | null;
  idealvolunteerprofile: string;
  institutionalbaseid: number;
  investmentrequired: number | null;
  numberofvolunteer: number | null;
  servicehoursrequired: number | null;
  specialprovitions: string;
  statusid: number;
  usercreatedid: string;
  userupdateid: string | null;
  volunteeractivitiesid: Generated<number>;
}
