import type { Selectable } from 'kysely';
import type { GovernmentData } from '@dibujando/shared';
import type { Government, Governingbody } from '../../../../db/types';

function nullableString(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return value.trim().length === 0 ? null : value;
}

function nullableNumber(value: number | null | undefined): number | null {
  return value === null || value === undefined ? null : value;
}

export function mapToGovernmentData(
  row: Selectable<Government> | null | undefined,
  userProfileId: number,
  oscProfileId: number | null | undefined,
  governingBodies: Selectable<Governingbody>[],
  isMexico: boolean,
  readOnly: boolean,
): GovernmentData {
  if (!row) {
    return {
      governmentId: null,
      userProfileId,
      oscProfileId: oscProfileId ?? null,
      presidencyName: null,
      presidencyEmail: null,
      legalRepresentativeName: null,
      legalRepresentativeEmail: null,
      executiveGeneralManagementName: null,
      executiveGeneralManagementEmail: null,
      programAndProjectOperationName: null,
      programAndProjectOperationEmail: null,
      institutionalDevelopmentName: null,
      institutionalDevelopmentEmail: null,
      numberOfMembers: null,
      governingBody: [],
      isMexico,
      readOnly,
    };
  }

  return {
    governmentId: row.governmentid,
    userProfileId: row.userprofileid,
    oscProfileId: row.oscprofileid ?? oscProfileId ?? null,
    presidencyName: nullableString(row.presidencyname),
    presidencyEmail: nullableString(row.presidencyemail),
    legalRepresentativeName: nullableString(row.legalrepresentativename),
    legalRepresentativeEmail: nullableString(row.legalrepresentativeemail),
    executiveGeneralManagementName: nullableString(row.executivegeneralmanagementname),
    executiveGeneralManagementEmail: nullableString(row.executivegeneralmanagementemail),
    programAndProjectOperationName: nullableString(row.programandprojectoperationname),
    programAndProjectOperationEmail: nullableString(row.programandprojectoperationemail),
    institutionalDevelopmentName: nullableString(row.institutionaldevelopmentname),
    institutionalDevelopmentEmail: nullableString(row.institutionaldevelopmentemail),
    numberOfMembers: nullableNumber(row.numberofmembers),
    governingBody: governingBodies.map((body) => ({
      governingBodyId: body.governingbodyid,
      name: body.name,
      position: body.position,
      memberSince: body.membersince,
      isMemberOfOtherBody: body.ismemberofotherbody,
      memberOfOtherBody: nullableString(body.memberofotherbody),
      rfc: nullableString(body.rfc),
    })),
    isMexico,
    readOnly,
  };
}
