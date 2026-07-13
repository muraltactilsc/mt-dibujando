import { z } from 'zod';

function maxLengthMessage(displayName: string, max: number): string {
  return `El campo ${displayName} solo puede tener ${max} caracteres`;
}

function optionalStringField(max: number, displayName: string) {
  return z
    .string()
    .max(max, maxLengthMessage(displayName, max))
    .transform((value) => value.trim())
    .optional();
}

export const GoverningBodyItemSchema = z.object({
  governingBodyId: z.number().int().positive().optional(),
  name: optionalStringField(120, 'Nombre del miembro'),
  position: optionalStringField(128, 'Cargo del miembro'),
  memberSince: z.number().int().optional(),
  isMemberOfOtherBody: z.boolean().optional(),
  memberOfOtherBody: optionalStringField(
    128,
    'En caso de participar en otro órgano de gobierno de otra organización, escriba el nombre de la OSC y el cargo que desempeña en dicha institución',
  ),
  rfc: optionalStringField(25, 'RFC'),
});

export type GoverningBodyItem = z.infer<typeof GoverningBodyItemSchema>;

export const GoverningBodyDataSchema = z.object({
  governingBodyId: z.number(),
  name: z.string(),
  position: z.string(),
  memberSince: z.number(),
  isMemberOfOtherBody: z.boolean(),
  memberOfOtherBody: z.string().nullable(),
  rfc: z.string().nullable(),
});

export type GoverningBodyData = z.infer<typeof GoverningBodyDataSchema>;
