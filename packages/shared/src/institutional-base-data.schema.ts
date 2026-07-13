import { z } from 'zod';

export const InterventionModelProgramDataSchema = z.object({
  interventionModelProgramsId: z.number(),
  programName: z.string(),
  description: z.string(),
  mainActivity: z.string(),
  verificationMeans: z.string(),
});

export type InterventionModelProgramData = z.infer<typeof InterventionModelProgramDataSchema>;

export const PopulationServedDataSchema = z.object({
  populationServedId: z.number().nullable(),
  ageGroupId: z.number(),
  ageGroupName: z.string(),
  order: z.number(),
  femenine: z.number().nullable(),
  male: z.number().nullable(),
  notBinary: z.number().nullable(),
  total: z.number().nullable(),
});

export type PopulationServedData = z.infer<typeof PopulationServedDataSchema>;

export const OperativeTeamDataSchema = z.object({
  operativeTeamId: z.number().nullable(),
  personalSituationId: z.number(),
  personalSituationName: z.string(),
  order: z.number(),
  inNomina: z.number().nullable(),
  forFees: z.number().nullable(),
  feesForAssimilable: z.number().nullable(),
  volunteers: z.number().nullable(),
  practitionersOrSocialService: z.number().nullable(),
  total: z.number().nullable(),
});

export type OperativeTeamData = z.infer<typeof OperativeTeamDataSchema>;

export const VolunteerActivityDataSchema = z.object({
  volunteerActivitiesId: z.number(),
  activityType: z.string(),
  numberOfVolunteer: z.number().nullable(),
  serviceHoursRequired: z.number().nullable(),
  investmentRequired: z.number().nullable(),
  idealVolunteerProfile: z.string(),
  specialProvitions: z.string(),
});

export type VolunteerActivityData = z.infer<typeof VolunteerActivityDataSchema>;
