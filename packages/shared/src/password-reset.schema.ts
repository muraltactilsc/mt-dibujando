import { z } from 'zod';

export const ForgotPasswordBodySchema = z.object({
  email: z.string().email(),
});

export type ForgotPasswordBody = z.infer<typeof ForgotPasswordBodySchema>;

export const ResetPasswordBodySchema = z.object({
  code: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
  confirmPassword: z.string().min(1),
});

export type ResetPasswordBody = z.infer<typeof ResetPasswordBodySchema>;

export const ResetPasswordValidateResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    valid: z.boolean(),
  }),
});

export type ResetPasswordValidateResponse = z.infer<typeof ResetPasswordValidateResponseSchema>;
