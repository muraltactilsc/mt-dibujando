import { z } from 'zod';

const PROGRAM_NAME = 'Nombre del programa';
const DESCRIPTION = 'Descripción';
const MAIN_ACTIVITY = 'Principales actividades';
const VERIFICATION_MEANS = 'Medios de Verificación';

const FEMENINE = '# Femenino';
const MALE = '# Masculino';
const NOT_BINARY = '# No binario';
const TOTAL = 'Total';

const IN_NOMINA = 'En Nómina';
const FOR_FEES = 'Por Honorarios';
const FEES_FOR_ASSIMILABLE = 'Por Honorarios Asimilables';
const VOLUNTEERS = 'Voluntarios';
const PRACTITIONERS_OR_SOCIAL_SERVICE = 'Practicantes / Servicio Social';

const ACTIVITY_TYPE = 'Tipo de actividad que se requiere realizar';
const IDEAL_VOLUNTEER_PROFILE = 'Perfil ideal del voluntario';
const SPECIAL_PROVITIONS = 'Disposiciones especiales que el voluntario deba tomar en cuenta';

function maxLengthMessage(displayName: string, max: number): string {
  return `El campo ${displayName} solo puede tener ${max} caracteres`;
}

function requiredFieldMessage(displayName: string): string {
  return `El campo ${displayName} es requerido.`;
}

export const InterventionModelProgramItemSchema = z.object({
  interventionModelProgramsId: z.number().int().positive().optional(),
  programName: z
    .string()
    .max(128, maxLengthMessage(PROGRAM_NAME, 128))
    .transform((value) => value.trim())
    .optional(),
  description: z
    .string()
    .max(256, maxLengthMessage(DESCRIPTION, 256))
    .transform((value) => value.trim())
    .optional(),
  mainActivity: z
    .string()
    .max(256, maxLengthMessage(MAIN_ACTIVITY, 256))
    .transform((value) => value.trim())
    .optional(),
  verificationMeans: z
    .string()
    .max(256, maxLengthMessage(VERIFICATION_MEANS, 256))
    .transform((value) => value.trim())
    .optional(),
});

export type InterventionModelProgramItem = z.infer<typeof InterventionModelProgramItemSchema>;

export const PopulationServedItemSchema = z.object({
  populationServedId: z.number().int().positive().optional(),
  ageGroupId: z
    .number({ required_error: requiredFieldMessage('AgeGroupId') })
    .int()
    .positive(),
  femenine: z.number({ required_error: requiredFieldMessage(FEMENINE) }).int(),
  male: z.number({ required_error: requiredFieldMessage(MALE) }).int(),
  notBinary: z.number({ required_error: requiredFieldMessage(NOT_BINARY) }).int(),
  total: z.number({ required_error: requiredFieldMessage(TOTAL) }).int(),
});

export type PopulationServedItem = z.infer<typeof PopulationServedItemSchema>;

export const OperativeTeamItemSchema = z.object({
  operativeTeamId: z.number().int().positive().optional(),
  personalSituationId: z
    .number({ required_error: requiredFieldMessage('PersonalSituationId') })
    .int()
    .positive(),
  inNomina: z.number({ required_error: requiredFieldMessage(IN_NOMINA) }).int(),
  forFees: z.number({ required_error: requiredFieldMessage(FOR_FEES) }).int(),
  feesForAssimilable: z
    .number({ required_error: requiredFieldMessage(FEES_FOR_ASSIMILABLE) })
    .int(),
  volunteers: z.number({ required_error: requiredFieldMessage(VOLUNTEERS) }).int(),
  practitionersOrSocialService: z
    .number({
      required_error: requiredFieldMessage(PRACTITIONERS_OR_SOCIAL_SERVICE),
    })
    .int(),
  total: z.number({ required_error: requiredFieldMessage(TOTAL) }).int(),
});

export type OperativeTeamItem = z.infer<typeof OperativeTeamItemSchema>;

export const VolunteerActivityItemSchema = z.object({
  volunteerActivitiesId: z.number().int().positive().optional(),
  activityType: z
    .string()
    .max(128, maxLengthMessage(ACTIVITY_TYPE, 128))
    .transform((value) => value.trim())
    .optional(),
  numberOfVolunteer: z.number().int().optional(),
  serviceHoursRequired: z.number().int().optional(),
  investmentRequired: z.number().optional(),
  idealVolunteerProfile: z
    .string()
    .max(128, maxLengthMessage(IDEAL_VOLUNTEER_PROFILE, 128))
    .transform((value) => value.trim())
    .optional(),
  specialProvitions: z
    .string()
    .max(256, maxLengthMessage(SPECIAL_PROVITIONS, 256))
    .transform((value) => value.trim())
    .optional(),
});

export type VolunteerActivityItem = z.infer<typeof VolunteerActivityItemSchema>;
