import { z } from 'zod';

export const HealthStatusSchema = z.object({
  status: z.string(),
});

export type HealthStatus = z.infer<typeof HealthStatusSchema>;

export const HealthResponseSchema = z.object({
  success: z.boolean(),
  data: HealthStatusSchema,
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export {
  AuthSessionDataSchema,
  AuthUserSchema,
  LoginBodySchema,
  LogoutBodySchema,
  RefreshBodySchema,
} from './auth.schema';
export type { AuthSessionData, AuthUser, LoginBody, LogoutBody, RefreshBody } from './auth.schema';

export {
  AnswerSchema,
  CountrySchema,
  QuestionSchema,
  RegisterBodySchema,
  ValidateAnswersBodySchema,
  ValidateAnswersFailedSchema,
  ValidateAnswersPassedSchema,
  ValidateAnswersResponseSchema,
} from './registration.schema';
export type {
  Answer,
  Country,
  Question,
  RegisterBody,
  ValidateAnswersBody,
  ValidateAnswersResponse,
} from './registration.schema';

export {
  ForgotPasswordBodySchema,
  ResetPasswordBodySchema,
  ResetPasswordValidateResponseSchema,
} from './password-reset.schema';
export type {
  ForgotPasswordBody,
  ResetPasswordBody,
  ResetPasswordValidateResponse,
} from './password-reset.schema';
