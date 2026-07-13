// Re-export barrel for the generated Kysely DB types. The generated interfaces are split
// by schema cluster under ./types/ so that adding new tables does not keep growing one file
// past the uniform file-size budget. The split was necessary once the single generated file
// (master: 243 lines with the then-current tables) approached the absolute max of 250 lines
// and adding the Institutional Base tables would have pushed it over.
//
// Regeneration workflow when tables/columns change:
//   1. Run kysely-codegen into a temporary file (e.g. /tmp/db-types.ts).
//   2. Keep ./types/common.types.ts in sync with the Generated<T> / Timestamp helpers.
//   3. Move each generated interface into the matching cluster file under ./types/.
//   4. Update the star-exports above and the DB interface below to include any new cluster.
//   5. Delete the temporary generated file.
export * from './types/auth.types';
export * from './types/catalogs.types';
export * from './types/common.types';
export * from './types/government.types';
export * from './types/institutional-base.types';
export * from './types/osc.types';
export * from './types/registration.types';

import type {
  Aspnetroles,
  Aspnetuserroles,
  Aspnetusers,
  AuthSessions,
  Userprofile,
} from './types/auth.types';
import type {
  Actionline,
  Actionlinesecondary,
  Agegroup,
  Country,
  Donationtype,
  Donortype,
  Financedate,
  Financingtype,
  Incomeexpenseconcept,
  Oscstatus,
  Osctype,
  Osctypeconstitution,
  Personalsituation,
  State,
} from './types/catalogs.types';
import type { Government, Governingbody } from './types/government.types';
import type {
  Institutionalbase,
  Interventionmodelprograms,
  Operativeteam,
  Populationserved,
  Volunteeractivities,
} from './types/institutional-base.types';
import type { Legalbase, Oscprofile } from './types/osc.types';
import type { Answer, Logtriedquestions, Question } from './types/registration.types';

export interface DB {
  actionline: Actionline;
  actionlinesecondary: Actionlinesecondary;
  agegroup: Agegroup;
  answer: Answer;
  aspnetroles: Aspnetroles;
  aspnetuserroles: Aspnetuserroles;
  aspnetusers: Aspnetusers;
  auth_sessions: AuthSessions;
  country: Country;
  donationtype: Donationtype;
  donortype: Donortype;
  financedate: Financedate;
  financingtype: Financingtype;
  government: Government;
  governingbody: Governingbody;
  incomeexpenseconcept: Incomeexpenseconcept;
  institutionalbase: Institutionalbase;
  interventionmodelprograms: Interventionmodelprograms;
  legalbase: Legalbase;
  logtriedquestions: Logtriedquestions;
  operativeteam: Operativeteam;
  oscprofile: Oscprofile;
  oscstatus: Oscstatus;
  osctype: Osctype;
  osctypeconstitution: Osctypeconstitution;
  personalsituation: Personalsituation;
  populationserved: Populationserved;
  question: Question;
  state: State;
  userprofile: Userprofile;
  volunteeractivities: Volunteeractivities;
}
