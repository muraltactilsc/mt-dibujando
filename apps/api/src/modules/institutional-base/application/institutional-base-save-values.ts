import type { Insertable, Updateable } from 'kysely';
import type { SaveInstitutionalBaseBody } from '@dibujando/shared';
import type { Institutionalbase } from '../../../../db/types';

type InstitutionalBaseValues = {
  userprofileid: number;
  organizationhistory: string;
  organizationmission: string;
  organizationvision: string;
  organizationvalues: string;
  describeproblematic: string;
  describemodel: string;
  totalpopulationserved: number;
  atentionminage: number;
  atentionmaxage: number;
  poblationprofile: string;
  poblationpercentage: number;
  hasvolunterprogram: boolean;
  wantvolunterprogram: boolean;
  hasstrengtheningprogram: boolean | null;
  strengtheningtype: string;
  strengtheningorganizationname: string;
  strengtheningcourseyear: string;
  hassocialinvestmentadvisor: boolean | null;
  hashumanrightsapproach: boolean | null;
  statusid: number;
};

export function buildInstitutionalBaseValues(
  body: SaveInstitutionalBaseBody,
): InstitutionalBaseValues {
  return {
    userprofileid: body.userProfileId,
    organizationhistory: body.organizationHistory.trim(),
    organizationmission: body.organizationMission?.trim() ?? '',
    organizationvision: body.organizationVision?.trim() ?? '',
    organizationvalues: body.organizationValues?.trim() ?? '',
    describeproblematic: body.describeProblematic?.trim() ?? '',
    describemodel: body.describeModel?.trim() ?? '',
    totalpopulationserved: body.totalPopulationServed,
    atentionminage: body.atentionMinAge,
    atentionmaxage: body.atentionMaxAge,
    poblationprofile: body.poblationProfile.trim(),
    poblationpercentage: body.poblationPercentage,
    hasvolunterprogram: body.hasVolunterProgram ?? false,
    wantvolunterprogram: body.wantVolunterProgram ?? false,
    hasstrengtheningprogram: body.hasStrengtheningProgram ?? null,
    strengtheningtype: body.hasStrengtheningProgram ? (body.strengtheningType?.trim() ?? '') : '',
    strengtheningorganizationname: body.hasStrengtheningProgram
      ? (body.strengtheningOrganizationName?.trim() ?? '')
      : '',
    strengtheningcourseyear: body.hasStrengtheningProgram
      ? (body.strengtheningCourseYear?.trim() ?? '')
      : '',
    hassocialinvestmentadvisor: body.hasStrengtheningProgram
      ? (body.hasSocialInvestmentAdvisor ?? null)
      : null,
    hashumanrightsapproach: body.hasStrengtheningProgram
      ? (body.hasHumanRightsApproach ?? null)
      : null,
    statusid: 1,
  };
}

export function buildInstitutionalBaseInsertValues(
  body: SaveInstitutionalBaseBody,
  now: Date,
): Insertable<Institutionalbase> {
  return {
    ...buildInstitutionalBaseValues(body),
    usercreateid: '1',
    datetimecreate: now,
  };
}

export function buildInstitutionalBaseUpdateValues(
  body: SaveInstitutionalBaseBody,
  now: Date,
): Updateable<Institutionalbase> {
  return {
    ...buildInstitutionalBaseValues(body),
    userupdateid: '1',
    datetimelastupdate: now,
  };
}
