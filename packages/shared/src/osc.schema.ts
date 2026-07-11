import { z } from 'zod';

const POSTAL_CODE_REGEX = /^(?:0[0-9]\d{3}|[0-9]\d{4}|5[0-9]\d{3})$/;

export const SaveGeneralDataBodySchema = z.object({
  userProfileId: z.number({ required_error: 'El Id de Usuario no es válido.' }).int().positive(),
  oscProfileId: z.number().int().positive().optional(),

  name: z
    .string({ required_error: 'El campo Nombre corto de la organización es requerido.' })
    .min(1, 'El campo Nombre corto de la organización es requerido.')
    .max(150, 'El campo Nombre corto de la organización solo puede tener 150 caracteres'),

  socialReason: z
    .string({
      required_error: 'El campo Razón Social o Nombre Legal de la Organización es requerido.',
    })
    .min(1, 'El campo Razón Social o Nombre Legal de la Organización es requerido.')
    .max(
      150,
      'El campo Razón Social o Nombre Legal de la Organización solo puede tener 150 caracteres',
    ),

  oscTypeId: z
    .number({ required_error: 'El campo Tipo de Institución es requerido.' })
    .int()
    .positive(),

  nationalRegistryNumber: z
    .string({ required_error: 'El campo RFC o Número de Registro Nacional es requerido.' })
    .min(1, 'El campo RFC o Número de Registro Nacional es requerido.')
    .max(25, 'El campo RFC o Número de Registro Nacional solo puede tener 25 caracteres'),

  financeMinistryNumber: z
    .string()
    .max(
      30,
      'El campo Número de autorización del ministerio de hacienda solo puede tener 30 caracteres',
    )
    .optional(),

  contactName: z
    .string({ required_error: 'El campo Nombre de Datos de Contacto es requerido.' })
    .min(1, 'El campo Nombre de Datos de Contacto es requerido.')
    .max(128, 'El campo Nombre de Datos de Contacto solo puede tener 128 caracteres'),

  contactPosition: z
    .string({ required_error: 'El campo Cargo de Datos de Contacto es requerido.' })
    .min(1, 'El campo Cargo de Datos de Contacto es requerido.')
    .max(60, 'El campo Cargo de Datos de Contacto solo puede tener 60 caracteres'),

  contactTelephone: z
    .string()
    .min(10, 'El campo Teléfono Fijo debe tener como mínimo 10 caracteres.')
    .max(12, 'El campo Teléfono Fijo solo puede tener 12 caracteres')
    .optional(),

  contactTelephoneExt: z
    .string()
    .max(10, 'El campo Extensión del teléfono Fijo solo puede tener 10 caracteres')
    .optional(),

  contactMobilePhone: z
    .string()
    .min(10, 'El campo Teléfono Móvil debe tener como mínimo 10 caracteres.')
    .max(12, 'El campo Teléfono Móvil solo puede tener 12 caracteres')
    .optional(),

  contactEmail: z
    .string({ required_error: 'El campo Correo Electrónico de Datos de Contacto es requerido.' })
    .min(1, 'El campo Correo Electrónico de Datos de Contacto es requerido.')
    .max(128, 'El campo Correo Electrónico de Datos de Contacto solo puede tener 128 caracteres')
    .email('El Correo electrónico no es una dirección de correo válida.'),

  countryId: z.number({ required_error: 'El campo País es requerido.' }).int().positive(),

  stateId: z
    .number({ required_error: 'El campo Estado/Provincia/Departamento es requerido.' })
    .int()
    .positive(),

  city: z
    .string({ required_error: 'El campo Ciudad es requerido.' })
    .min(1, 'El campo Ciudad es requerido.')
    .max(60, 'El campo Ciudad solo puede tener 60 caracteres'),

  postalCode: z
    .string({ required_error: 'El campo Código/Apartado Postal es requerido.' })
    .min(1, 'El campo Código/Apartado Postal es requerido.')
    .regex(POSTAL_CODE_REGEX, 'El formato del campo Código/Apartado Postal no es válido.'),

  address: z.string().max(128, 'El campo Dirección solo puede tener 128 caracteres').optional(),

  reference: z.string().max(128, 'El campo Referencia solo puede tener 128 caracteres').optional(),

  actionLineId: z.number().int().positive().optional(),

  actionLineSecondaryId: z.number().int().positive().optional(),

  oscTypeConstitutionId: z
    .number({ required_error: 'El campo Figura legal es requerido.' })
    .int()
    .positive(),
});

export type SaveGeneralDataBody = z.infer<typeof SaveGeneralDataBodySchema>;

export const GeneralDataSchema = z.object({
  oscProfileId: z.number().nullable(),
  userProfileId: z.number(),
  email: z.string().nullable(),
  name: z.string().nullable(),
  socialReason: z.string().nullable(),
  oscTypeId: z.number().nullable(),
  actionLineId: z.number().nullable(),
  actionLineSecondaryId: z.number().nullable(),
  nationalRegistryNumber: z.string().nullable(),
  financeMinistryNumber: z.string().nullable(),
  contactName: z.string().nullable(),
  contactPosition: z.string().nullable(),
  contactTelephone: z.string().nullable(),
  contactTelephoneExt: z.string().nullable(),
  contactMobilePhone: z.string().nullable(),
  contactEmail: z.string().nullable(),
  countryId: z.number().nullable(),
  stateId: z.number().nullable(),
  city: z.string().nullable(),
  postalCode: z.string().nullable(),
  address: z.string().nullable(),
  reference: z.string().nullable(),
  oscTypeConstitutionId: z.number().nullable(),
  readOnly: z.boolean(),
});

export type GeneralData = z.infer<typeof GeneralDataSchema>;

export const SaveGeneralDataResponseSchema = z.object({
  oscProfileId: z.number(),
  needsResubmission: z.boolean(),
});

export type SaveGeneralDataResponse = z.infer<typeof SaveGeneralDataResponseSchema>;
