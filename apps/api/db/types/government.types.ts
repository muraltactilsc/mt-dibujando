import type { Generated, Timestamp } from './common.types';

export interface Government {
  datetimecreate: Timestamp;
  datetimelastupdate: Timestamp | null;
  executivegeneralmanagementemail: string;
  executivegeneralmanagementname: string;
  governmentid: Generated<number>;
  institutionaldevelopmentemail: string | null;
  institutionaldevelopmentname: string | null;
  legalrepresentativeemail: string;
  legalrepresentativename: string;
  numberofmembers: number;
  oscprofileid: number | null;
  presidencyemail: string;
  presidencyname: string;
  programandprojectoperationemail: string;
  programandprojectoperationname: string;
  statusid: number;
  usercreateid: string;
  userprofileid: number;
  userupdateid: string | null;
}

export interface Governingbody {
  datetimecreate: Timestamp;
  datetimelastupdate: Timestamp | null;
  governmentid: number;
  governingbodyid: Generated<number>;
  ismemberofotherbody: boolean;
  memberofotherbody: string | null;
  membersince: number;
  name: string;
  position: string;
  rfc: string | null;
  statusid: number;
  usercreateid: string;
  userupdateid: string | null;
}
