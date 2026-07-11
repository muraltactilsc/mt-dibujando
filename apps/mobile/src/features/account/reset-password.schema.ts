import { ResetPasswordBodySchema } from '@dibujando/shared';
import { z } from 'zod';
import { isPasswordPolicyCompliant, PASSWORD_POLICY } from './password-policy';

export const ResetPasswordFormSchema = ResetPasswordBodySchema.extend({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido.')
    .email('El Correo electrónico no es una dirección de correo válida.'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida.')
    .refine(isPasswordPolicyCompliant, PASSWORD_POLICY),
  confirmPassword: z.string().min(1, 'La confirmación de contraseña es requerida.'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'La contraseña y la confirmación no coinciden.',
  path: ['confirmPassword'],
});

export type ResetPasswordFormValues = z.infer<typeof ResetPasswordFormSchema>;
