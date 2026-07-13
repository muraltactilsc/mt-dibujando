import type { Selectable } from 'kysely';
import type { InstitutionalBaseData } from '@dibujando/shared';
import type {
  Agegroup,
  Institutionalbase,
  Interventionmodelprograms,
  Operativeteam,
  Personalsituation,
  Populationserved,
  Volunteeractivities,
} from '../../../../db/types';

function nullableString(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return value.trim().length === 0 ? null : value;
}

function nullableNumber(value: number | null | undefined): number | null {
  return value === null || value === undefined ? null : value;
}

function nullableBoolean(value: boolean | null | undefined): boolean | null {
  return value === null || value === undefined ? null : value;
}

export function mapToInstitutionalBaseData(
  row: Selectable<Institutionalbase> | null | undefined,
  userProfileId: number,
  oscProfileId: number | null | undefined,
  ageGroups: Selectable<Agegroup>[],
  personalSituations: Selectable<Personalsituation>[],
  interventionModelPrograms: Selectable<Interventionmodelprograms>[],
  populationServedRows: Selectable<Populationserved>[],
  operativeTeamRows: Selectable<Operativeteam>[],
  volunteerActivities: Selectable<Volunteeractivities>[],
  readOnly: boolean,
): InstitutionalBaseData {
  const populationServedByAgeGroupId = new Map(
    populationServedRows.map((row) => [row.agegroupid, row]),
  );

  const operativeTeamByPersonalSituationId = new Map(
    operativeTeamRows.map((row) => [row.personalsituationid, row]),
  );

  const populationServed = ageGroups.map((ageGroup) => {
    const saved = populationServedByAgeGroupId.get(ageGroup.agegroupid);

    return {
      populationServedId: nullableNumber(saved?.populationservedid) ?? null,
      ageGroupId: ageGroup.agegroupid,
      ageGroupName: ageGroup.agegroupname,
      order: ageGroup.order,
      femenine: nullableNumber(saved?.femenine) ?? null,
      male: nullableNumber(saved?.male) ?? null,
      notBinary: nullableNumber(saved?.notbinary) ?? null,
      total: nullableNumber(saved?.total) ?? null,
    };
  });

  const operativeTeam = personalSituations.map((situation) => {
    const saved = operativeTeamByPersonalSituationId.get(situation.personalsituationid);

    return {
      operativeTeamId: nullableNumber(saved?.operativeteamid) ?? null,
      personalSituationId: situation.personalsituationid,
      personalSituationName: situation.personalsituationname,
      order: situation.order,
      inNomina: nullableNumber(saved?.innomina) ?? null,
      forFees: nullableNumber(saved?.forfees) ?? null,
      feesForAssimilable: nullableNumber(saved?.feesforassimilable) ?? null,
      volunteers: nullableNumber(saved?.volunteers) ?? null,
      practitionersOrSocialService: nullableNumber(saved?.practitionersorsocialservice) ?? null,
      total: nullableNumber(saved?.total) ?? null,
    };
  });

  if (!row) {
    return {
      institutionalBaseId: null,
      userProfileId,
      oscProfileId: oscProfileId ?? null,
      organizationHistory: null,
      organizationMission: null,
      organizationVision: null,
      organizationValues: null,
      describeProblematic: null,
      describeModel: null,
      totalPopulationServed: null,
      atentionMinAge: null,
      atentionMaxAge: null,
      poblationProfile: null,
      poblationPercentage: null,
      hasVolunterProgram: null,
      wantVolunterProgram: null,
      hasStrengtheningProgram: null,
      strengtheningType: null,
      strengtheningOrganizationName: null,
      strengtheningCourseYear: null,
      hasSocialInvestmentAdvisor: null,
      hasHumanRightsApproach: null,
      interventionModelPrograms: [],
      populationServed,
      operativeTeam,
      volunteerActivities: [],
      readOnly,
    };
  }

  const hasStrengtheningProgram = nullableBoolean(row.hasstrengtheningprogram);

  return {
    institutionalBaseId: row.institutionalbaseid,
    userProfileId: row.userprofileid,
    oscProfileId: row.oscprofileid ?? oscProfileId ?? null,
    organizationHistory: nullableString(row.organizationhistory),
    organizationMission: nullableString(row.organizationmission),
    organizationVision: nullableString(row.organizationvision),
    organizationValues: nullableString(row.organizationvalues),
    describeProblematic: nullableString(row.describeproblematic),
    describeModel: nullableString(row.describemodel),
    totalPopulationServed: nullableNumber(row.totalpopulationserved),
    atentionMinAge: nullableNumber(row.atentionminage),
    atentionMaxAge: nullableNumber(row.atentionmaxage),
    poblationProfile: nullableString(row.poblationprofile),
    poblationPercentage: nullableNumber(row.poblationpercentage),
    hasVolunterProgram: row.hasvolunterprogram,
    wantVolunterProgram: row.wantvolunterprogram,
    hasStrengtheningProgram,
    strengtheningType: hasStrengtheningProgram ? nullableString(row.strengtheningtype) : null,
    strengtheningOrganizationName: hasStrengtheningProgram
      ? nullableString(row.strengtheningorganizationname)
      : null,
    strengtheningCourseYear: hasStrengtheningProgram
      ? nullableString(row.strengtheningcourseyear)
      : null,
    hasSocialInvestmentAdvisor: hasStrengtheningProgram
      ? nullableBoolean(row.hassocialinvestmentadvisor)
      : null,
    hasHumanRightsApproach: hasStrengtheningProgram
      ? nullableBoolean(row.hashumanrightsapproach)
      : null,
    interventionModelPrograms: interventionModelPrograms.map((program) => ({
      interventionModelProgramsId: program.interventionmodelprogramsid,
      programName: program.programname,
      description: program.description,
      mainActivity: program.mainactivity,
      verificationMeans: program.verificationmeans,
    })),
    populationServed,
    operativeTeam,
    volunteerActivities: volunteerActivities.map((activity) => ({
      volunteerActivitiesId: activity.volunteeractivitiesid,
      activityType: activity.activitytype,
      numberOfVolunteer: nullableNumber(activity.numberofvolunteer),
      serviceHoursRequired: nullableNumber(activity.servicehoursrequired),
      investmentRequired: nullableNumber(activity.investmentrequired),
      idealVolunteerProfile: activity.idealvolunteerprofile,
      specialProvitions: activity.specialprovitions,
    })),
    readOnly,
  };
}
