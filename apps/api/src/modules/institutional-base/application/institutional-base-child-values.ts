import type { Insertable, Updateable } from 'kysely';
import type {
  InterventionModelProgramItem,
  OperativeTeamItem,
  PopulationServedItem,
  VolunteerActivityItem,
} from '@dibujando/shared';
import type {
  Interventionmodelprograms,
  Operativeteam,
  Populationserved,
  Volunteeractivities,
} from '../../../../db/types';

type InterventionModelProgramItemSave =
  | { id: number; values: Updateable<Interventionmodelprograms> }
  | { id: undefined; values: Insertable<Interventionmodelprograms> };

export function buildInterventionModelProgramItem(
  item: InterventionModelProgramItem,
  institutionalBaseId: number,
  now: Date,
): InterventionModelProgramItemSave {
  const baseValues = {
    institutionalbaseid: institutionalBaseId,
    programname: item.programName!.trim(),
    description: item.description!.trim(),
    mainactivity: item.mainActivity!.trim(),
    verificationmeans: item.verificationMeans!.trim(),
    statusid: 1,
  };

  if (item.interventionModelProgramsId) {
    return {
      id: item.interventionModelProgramsId,
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

type PopulationServedItemSave =
  | { id: number; values: Updateable<Populationserved> }
  | { id: undefined; values: Insertable<Populationserved> };

export function buildPopulationServedItem(
  item: PopulationServedItem,
  institutionalBaseId: number,
  now: Date,
): PopulationServedItemSave {
  const baseValues = {
    institutionalbaseid: institutionalBaseId,
    agegroupid: item.ageGroupId,
    femenine: item.femenine,
    male: item.male,
    notbinary: item.notBinary,
    total: item.total,
    statusid: 1,
  };

  if (item.populationServedId) {
    return {
      id: item.populationServedId,
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

type OperativeTeamItemSave =
  | { id: number; values: Updateable<Operativeteam> }
  | { id: undefined; values: Insertable<Operativeteam> };

export function buildOperativeTeamItem(
  item: OperativeTeamItem,
  institutionalBaseId: number,
  now: Date,
): OperativeTeamItemSave {
  const baseValues = {
    institutionalbaseid: institutionalBaseId,
    personalsituationid: item.personalSituationId,
    innomina: item.inNomina,
    forfees: item.forFees,
    feesforassimilable: item.feesForAssimilable,
    volunteers: item.volunteers,
    practitionersorsocialservice: item.practitionersOrSocialService,
    total: item.total,
    statusid: 1,
  };

  if (item.operativeTeamId) {
    return {
      id: item.operativeTeamId,
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

type VolunteerActivityItemSave =
  | { id: number; values: Updateable<Volunteeractivities> }
  | { id: undefined; values: Insertable<Volunteeractivities> };

export function buildVolunteerActivityItem(
  item: VolunteerActivityItem,
  institutionalBaseId: number,
  now: Date,
): VolunteerActivityItemSave {
  const baseValues = {
    institutionalbaseid: institutionalBaseId,
    activitytype: item.activityType?.trim() ?? '',
    numberofvolunteer: item.numberOfVolunteer ?? null,
    servicehoursrequired: item.serviceHoursRequired ?? null,
    investmentrequired: item.investmentRequired ?? null,
    idealvolunteerprofile: item.idealVolunteerProfile?.trim() ?? '',
    specialprovitions: item.specialProvitions?.trim() ?? '',
    statusid: 1,
  };

  if (item.volunteerActivitiesId) {
    return {
      id: item.volunteerActivitiesId,
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
      usercreatedid: '1',
      datetimecreate: now,
    },
  };
}
