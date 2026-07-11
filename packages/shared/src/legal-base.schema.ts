import { z } from 'zod';

const SOCIAL_OBJETIVE_DISPLAY_NAME = 'Objeto Social de la Organización o Fines de la Organización';

function optionalDate() {
  return z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? undefined : value),
    z.coerce.date().optional(),
  );
}

export const SaveLegalBaseBodySchema = z.object({
  userProfileId: z.number({ required_error: 'El Id de Usuario no es válido.' }).int().positive(),

  legalBaseId: z.number().int().positive().optional(),

  organizationConstitutionDate: z.coerce.date({
    required_error: 'El campo Constitución de la Organización es requerido.',
    invalid_type_error: 'El campo Constitución de la Organización es requerido.',
  }),

  lastProtocolizationDate: optionalDate(),

  isAuthorized: z.boolean({
    required_error:
      'El campo ¿Está autorizada por la autoridad gubernamental para emitir recibos deducibles? es requerido.',
    invalid_type_error:
      'El campo ¿Está autorizada por la autoridad gubernamental para emitir recibos deducibles? es requerido.',
  }),

  goubernamentalAuthorizationDate: z.coerce.date({
    required_error:
      'El campo Autorización de la autoridad gubernamental vigente para recibir donativos con deducibilidad es requerido.',
    invalid_type_error:
      'El campo Autorización de la autoridad gubernamental vigente para recibir donativos con deducibilidad es requerido.',
  }),

  socialObjetive: z
    .string({
      required_error: `El campo ${SOCIAL_OBJETIVE_DISPLAY_NAME} es requerido.`,
    })
    .min(1, `El campo ${SOCIAL_OBJETIVE_DISPLAY_NAME} es requerido.`)
    .max(1024, `El campo ${SOCIAL_OBJETIVE_DISPLAY_NAME} solo puede tener 1024 caracteres`),
});

export type SaveLegalBaseBody = z.infer<typeof SaveLegalBaseBodySchema>;

export const LegalBaseDataSchema = z.object({
  legalBaseId: z.number().nullable(),
  userProfileId: z.number(),
  oscProfileId: z.number().nullable(),
  organizationConstitutionDate: z.date().nullable(),
  lastProtocolizationDate: z.date().nullable(),
  isAuthorized: z.boolean().nullable(),
  goubernamentalAuthorizationDate: z.date().nullable(),
  socialObjetive: z.string().nullable(),
  isMexico: z.boolean(),
  readOnly: z.boolean(),
});

export type LegalBaseData = z.infer<typeof LegalBaseDataSchema>;

export const SaveLegalBaseResponseSchema = z.object({
  legalBaseId: z.number(),
  needsResubmission: z.boolean(),
});

export type SaveLegalBaseResponse = z.infer<typeof SaveLegalBaseResponseSchema>;
