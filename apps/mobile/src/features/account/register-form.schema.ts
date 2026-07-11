import { z } from 'zod';
import { RegisterBodySchema } from '@dibujando/shared';

export const PASSWORD_POLICY =
  'La contraseña debe tener al menos 6 caracteres; contener una mayúscula, un número y un carácter especial.';

export const RegisterFormSchema = RegisterBodySchema.extend({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido.')
    .email('El Correo electrónico no es una dirección de correo válida.'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida.')
    .min(6, 'La contraseña debe contener al menos 6 caracteres.'),
  confirmPassword: z.string().min(1, 'La confirmación de contraseña es requerida.'),
  institutionName: z.string().min(1, 'El nombre corto de la organización es requerido.'),
  nationalRegistryNumber: z
    .string()
    .min(1, 'El RFC o Número de Registro Nacional es requerido.')
    .max(25, 'El RFC o Número de Registro Nacional solo puede tener 25 caracteres'),
  countryId: z.number({ required_error: 'El campo País es requerido.' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'La contraseña y la confirmación de contraseña no coinciden.',
  path: ['confirmPassword'],
});

export type RegisterFormValues = z.infer<typeof RegisterFormSchema>;
