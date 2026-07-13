import type { Insertable, Updateable } from 'kysely';
import type { GoverningBodyItem, SaveGovernmentBody } from '@dibujando/shared';
import type { Government, Governingbody } from '../../../../db/types';

type GovernmentValues = {
  userprofileid: number;
  presidencyname: string;
  presidencyemail: string;
  legalrepresentativename: string;
  legalrepresentativeemail: string;
  executivegeneralmanagementname: string;
  executivegeneralmanagementemail: string;
  programandprojectoperationname: string;
  programandprojectoperationemail: string;
  institutionaldevelopmentname: string | null;
  institutionaldevelopmentemail: string | null;
  numberofmembers: number;
  statusid: number;
};

export function buildGovernmentValues(body: SaveGovernmentBody): GovernmentValues {
  return {
    userprofileid: body.userProfileId,
    presidencyname: body.presidencyName.trim(),
    presidencyemail: body.presidencyEmail.trim(),
    legalrepresentativename: body.legalRepresentativeName.trim(),
    legalrepresentativeemail: body.legalRepresentativeEmail.trim(),
    executivegeneralmanagementname: body.executiveGeneralManagementName.trim(),
    executivegeneralmanagementemail: body.executiveGeneralManagementEmail.trim(),
    programandprojectoperationname: body.programAndProjectOperationName.trim(),
    programandprojectoperationemail: body.programAndProjectOperationEmail.trim(),
    institutionaldevelopmentname: body.institutionalDevelopmentName?.trim() ?? null,
    institutionaldevelopmentemail: body.institutionalDevelopmentEmail?.trim() ?? null,
    numberofmembers: body.numberOfMembers,
    statusid: 1,
  };
}

export function buildGovernmentInsertValues(
  body: SaveGovernmentBody,
  now: Date,
): Insertable<Government> {
  return {
    ...buildGovernmentValues(body),
    usercreateid: '1',
    datetimecreate: now,
  };
}

export function buildGovernmentUpdateValues(
  body: SaveGovernmentBody,
  now: Date,
): Updateable<Government> {
  return {
    ...buildGovernmentValues(body),
    userupdateid: '1',
    datetimelastupdate: now,
  };
}

type GoverningBodyItemSave =
  | { id: number; values: Updateable<Governingbody> }
  | { id: undefined; values: Insertable<Governingbody> };

export function buildGoverningBodyItem(
  item: GoverningBodyItem,
  governmentId: number,
  now: Date,
): GoverningBodyItemSave {
  const isMemberOfOtherBody = item.isMemberOfOtherBody === true;

  const baseValues = {
    governmentid: governmentId,
    name: item.name!.trim(),
    position: item.position!.trim(),
    membersince: item.memberSince!,
    ismemberofotherbody: isMemberOfOtherBody,
    memberofotherbody: isMemberOfOtherBody ? (item.memberOfOtherBody?.trim() ?? null) : null,
    rfc: item.rfc?.trim() ?? null,
    statusid: 1,
  };

  if (item.governingBodyId) {
    return {
      id: item.governingBodyId,
      values: {
        ...baseValues,
        userupdateid: '1',
        datetimelastupdate: now,
      },
    };
  }

  return {
    id: undefined,
    values: {
      ...baseValues,
      usercreateid: '1',
      datetimecreate: now,
    },
  };
}
