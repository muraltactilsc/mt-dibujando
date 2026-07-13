import { z } from 'zod';
import {
  InterventionModelProgramDataSchema,
  OperativeTeamDataSchema,
  PopulationServedDataSchema,
  VolunteerActivityDataSchema,
} from './institutional-base-data.schema';
import {
  InterventionModelProgramItemSchema,
  OperativeTeamItemSchema,
  PopulationServedItemSchema,
  VolunteerActivityItemSchema,
} from './institutional-base-items.schema';

function requiredFieldMessage(displayName: string): string {
  return `El campo ${displayName} es requerido.`;
}

function maxLengthMessage(displayName: string, max: number): string {
  return `El campo ${displayName} solo puede tener ${max} caracteres`;
}

const ORGANIZATION_HISTORY = 'Breve historia de la organización';
const ORGANIZATION_MISSION = 'Misión de la Organización';
const ORGANIZATION_VISION = 'Visión de la Organización';
const ORGANIZATION_VALUES = 'Valores de la Organización';
const DESCRIBE_PROBLEMATIC = '¿Describe la problemática que busca resolver la organización?';
const DESCRIBE_MODEL = 'Describe el Modelo de intervención de la Organización';
const TOTAL_POPULATION_SERVED = 'Total de población atendida';
const ATENTION_MIN_AGE = 'Edad Mínima de Atención';
const ATENTION_MAX_AGE = 'Edad Máxima de Atención';
const POBLATION_PROFILE = 'Describa el perfil de la población atendida por su organización';
const POBLATION_PERCENTAGE =
  '¿Cuál es el porcentaje de la población objetivo que concluye el flujo completo de atención de la organización?';
const STRENGTHENING_TYPE = 'Describe el tipo de fortalecimiento';
const STRENGTHENING_ORGANIZATION_NAME =
  '¿Qué organización ha brindado el curso de fortalecimiento?';
const STRENGTHENING_COURSE_YEAR = '¿En qué año(s)?';

const optionalTrimmedString = (max: number, displayName: string) =>
  z
    .string()
    .max(max, maxLengthMessage(displayName, max))
    .transform((value) => value.trim())
    .optional();

export const SaveInstitutionalBaseBodySchema = z
  .object({
    userProfileId: z.number({ required_error: 'El Id de Usuario no es válido.' }).int().positive(),

    institutionalBaseId: z.number().int().positive().optional(),

    organizationHistory: z
      .string({ required_error: requiredFieldMessage(ORGANIZATION_HISTORY) })
      .min(1, requiredFieldMessage(ORGANIZATION_HISTORY))
      .max(2500, maxLengthMessage(ORGANIZATION_HISTORY, 2500))
      .transform((value) => value.trim()),

    organizationMission: optionalTrimmedString(450, ORGANIZATION_MISSION),
    organizationVision: optionalTrimmedString(450, ORGANIZATION_VISION),
    organizationValues: optionalTrimmedString(300, ORGANIZATION_VALUES),
    describeProblematic: optionalTrimmedString(2500, DESCRIBE_PROBLEMATIC),
    describeModel: optionalTrimmedString(3200, DESCRIBE_MODEL),

    totalPopulationServed: z.number({
      required_error: requiredFieldMessage(TOTAL_POPULATION_SERVED),
    }),

    atentionMinAge: z.number({ required_error: requiredFieldMessage(ATENTION_MIN_AGE) }).int(),
    atentionMaxAge: z.number({ required_error: requiredFieldMessage(ATENTION_MAX_AGE) }).int(),

    poblationProfile: z
      .string({ required_error: requiredFieldMessage(POBLATION_PROFILE) })
      .min(1, requiredFieldMessage(POBLATION_PROFILE))
      .max(90, maxLengthMessage(POBLATION_PROFILE, 90))
      .transform((value) => value.trim()),

    poblationPercentage: z.number({
      required_error: requiredFieldMessage(POBLATION_PERCENTAGE),
    }),

    hasVolunterProgram: z.boolean().optional(),
    wantVolunterProgram: z.boolean().optional(),

    hasStrengtheningProgram: z.boolean().optional(),
    strengtheningType: optionalTrimmedString(1024, STRENGTHENING_TYPE),
    strengtheningOrganizationName: optionalTrimmedString(200, STRENGTHENING_ORGANIZATION_NAME),
    strengtheningCourseYear: optionalTrimmedString(200, STRENGTHENING_COURSE_YEAR),
    hasSocialInvestmentAdvisor: z.boolean().optional(),
    hasHumanRightsApproach: z.boolean().optional(),

    interventionModelPrograms: z.array(InterventionModelProgramItemSchema),
    populationServed: z.array(PopulationServedItemSchema),
    operativeTeam: z.array(OperativeTeamItemSchema),
    volunteerActivities: z.array(VolunteerActivityItemSchema),
  })
  .superRefine((data, ctx) => {
    if (!data.hasStrengtheningProgram) {
      return;
    }

    if (!data.strengtheningType || data.strengtheningType.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: requiredFieldMessage(STRENGTHENING_TYPE),
        path: ['strengtheningType'],
      });
    }

    if (
      !data.strengtheningOrganizationName ||
      data.strengtheningOrganizationName.trim().length === 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: requiredFieldMessage(STRENGTHENING_ORGANIZATION_NAME),
        path: ['strengtheningOrganizationName'],
      });
    }

    if (!data.strengtheningCourseYear || data.strengtheningCourseYear.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: requiredFieldMessage(STRENGTHENING_COURSE_YEAR),
        path: ['strengtheningCourseYear'],
      });
    }
  });

export type SaveInstitutionalBaseBody = z.infer<typeof SaveInstitutionalBaseBodySchema>;

export const InstitutionalBaseDataSchema = z.object({
  institutionalBaseId: z.number().nullable(),
  userProfileId: z.number(),
  oscProfileId: z.number().nullable(),
  organizationHistory: z.string().nullable(),
  organizationMission: z.string().nullable(),
  organizationVision: z.string().nullable(),
  organizationValues: z.string().nullable(),
  describeProblematic: z.string().nullable(),
  describeModel: z.string().nullable(),
  totalPopulationServed: z.number().nullable(),
  atentionMinAge: z.number().nullable(),
  atentionMaxAge: z.number().nullable(),
  poblationProfile: z.string().nullable(),
  poblationPercentage: z.number().nullable(),
  hasVolunterProgram: z.boolean().nullable(),
  wantVolunterProgram: z.boolean().nullable(),
  hasStrengtheningProgram: z.boolean().nullable(),
  strengtheningType: z.string().nullable(),
  strengtheningOrganizationName: z.string().nullable(),
  strengtheningCourseYear: z.string().nullable(),
  hasSocialInvestmentAdvisor: z.boolean().nullable(),
  hasHumanRightsApproach: z.boolean().nullable(),
  interventionModelPrograms: z.array(InterventionModelProgramDataSchema),
  populationServed: z.array(PopulationServedDataSchema),
  operativeTeam: z.array(OperativeTeamDataSchema),
  volunteerActivities: z.array(VolunteerActivityDataSchema),
  readOnly: z.boolean(),
});

export type InstitutionalBaseData = z.infer<typeof InstitutionalBaseDataSchema>;

export const SaveInstitutionalBaseResponseSchema = z.object({
  institutionalBaseId: z.number(),
  needsResubmission: z.boolean(),
});

export type SaveInstitutionalBaseResponse = z.infer<typeof SaveInstitutionalBaseResponseSchema>;
