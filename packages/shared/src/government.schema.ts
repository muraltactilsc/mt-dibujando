import { z } from 'zod';
import { GoverningBodyDataSchema, GoverningBodyItemSchema } from './government-items.schema';

const PRESIDENCY_NAME = 'Nombre del Presidente de la organización';
const PRESIDENCY_EMAIL = 'Correo Electrónico del Presidente de la organización';
const LEGAL_REPRESENTATIVE_NAME = 'Representante Legal';
const LEGAL_REPRESENTATIVE_EMAIL = 'Correo Electrónico de Representante Legal';
const EXECUTIVE_GENERAL_MANAGEMENT_NAME = 'Dirección General/Ejecutiva';
const EXECUTIVE_GENERAL_MANAGEMENT_EMAIL = 'Correo Electrónico de la Dirección General/Ejecutiva';
const PROGRAM_AND_PROJECT_OPERATION_NAME = 'Responsable de operación de programas y proyectos';
const PROGRAM_AND_PROJECT_OPERATION_EMAIL =
  'Correo Electrónico del Responsable de operación de programas y proyectos';
const INSTITUTIONAL_DEVELOPMENT_NAME = 'Responsable de Desarrollo Institucional';
const INSTITUTIONAL_DEVELOPMENT_EMAIL =
  'Correo Electrónico del Responsable de Desarrollo Institucional';
const NUMBER_OF_MEMBERS = '¿Cuántos miembros tiene su Patronato o Consejo?';

function requiredFieldMessage(displayName: string): string {
  return `El campo ${displayName} es requerido.`;
}

function maxLengthMessage(displayName: string, max: number): string {
  return `El campo ${displayName} solo puede tener ${max} caracteres`;
}

function requiredEmailField(displayName: string, max: number) {
  const message = requiredFieldMessage(displayName);

  return z
    .string({ required_error: message })
    .min(1, message)
    .email(message)
    .max(max, maxLengthMessage(displayName, max))
    .transform((value) => value.trim());
}

function requiredStringField(displayName: string, max: number) {
  const message = requiredFieldMessage(displayName);

  return z
    .string({ required_error: message })
    .min(1, message)
    .max(max, maxLengthMessage(displayName, max))
    .transform((value) => value.trim());
}

function optionalStringField(max: number, displayName: string) {
  return z
    .string()
    .max(max, maxLengthMessage(displayName, max))
    .transform((value) => value.trim())
    .optional();
}

function optionalEmailField(max: number, displayName: string) {
  const message = requiredFieldMessage(displayName);

  return z
    .string()
    .email(message)
    .max(max, maxLengthMessage(displayName, max))
    .transform((value) => value.trim())
    .optional();
}

export const SaveGovernmentBodySchema = z.object({
  userProfileId: z.number({ required_error: 'El Id de Usuario no es válido.' }).int().positive(),

  governmentId: z.number().int().positive().optional(),

  presidencyName: requiredStringField(PRESIDENCY_NAME, 128),
  presidencyEmail: requiredEmailField(PRESIDENCY_EMAIL, 128),

  legalRepresentativeName: requiredStringField(LEGAL_REPRESENTATIVE_NAME, 128),
  legalRepresentativeEmail: requiredEmailField(LEGAL_REPRESENTATIVE_EMAIL, 128),

  executiveGeneralManagementName: requiredStringField(EXECUTIVE_GENERAL_MANAGEMENT_NAME, 128),
  executiveGeneralManagementEmail: requiredEmailField(EXECUTIVE_GENERAL_MANAGEMENT_EMAIL, 128),

  programAndProjectOperationName: requiredStringField(PROGRAM_AND_PROJECT_OPERATION_NAME, 128),
  programAndProjectOperationEmail: requiredEmailField(PROGRAM_AND_PROJECT_OPERATION_EMAIL, 128),

  institutionalDevelopmentName: optionalStringField(128, INSTITUTIONAL_DEVELOPMENT_NAME),
  institutionalDevelopmentEmail: optionalEmailField(128, INSTITUTIONAL_DEVELOPMENT_EMAIL),

  numberOfMembers: z
    .number({
      required_error: requiredFieldMessage(NUMBER_OF_MEMBERS),
      invalid_type_error: requiredFieldMessage(NUMBER_OF_MEMBERS),
    })
    .int()
    .max(9_999_999, `El campo ${NUMBER_OF_MEMBERS} debe tener como máximo 7 dígitos`),

  governingBody: z.array(GoverningBodyItemSchema),
});

export type SaveGovernmentBody = z.infer<typeof SaveGovernmentBodySchema>;

export const GovernmentDataSchema = z.object({
  governmentId: z.number().nullable(),
  userProfileId: z.number(),
  oscProfileId: z.number().nullable(),
  presidencyName: z.string().nullable(),
  presidencyEmail: z.string().nullable(),
  legalRepresentativeName: z.string().nullable(),
  legalRepresentativeEmail: z.string().nullable(),
  executiveGeneralManagementName: z.string().nullable(),
  executiveGeneralManagementEmail: z.string().nullable(),
  programAndProjectOperationName: z.string().nullable(),
  programAndProjectOperationEmail: z.string().nullable(),
  institutionalDevelopmentName: z.string().nullable(),
  institutionalDevelopmentEmail: z.string().nullable(),
  numberOfMembers: z.number().nullable(),
  governingBody: z.array(GoverningBodyDataSchema),
  isMexico: z.boolean(),
  readOnly: z.boolean(),
});

export type GovernmentData = z.infer<typeof GovernmentDataSchema>;

export const SaveGovernmentResponseSchema = z.object({
  governmentId: z.number(),
  needsResubmission: z.boolean(),
});

export type SaveGovernmentResponse = z.infer<typeof SaveGovernmentResponseSchema>;
