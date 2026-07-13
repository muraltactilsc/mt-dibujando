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

export {
  GeneralDataSchema,
  SaveGeneralDataBodySchema,
  SaveGeneralDataResponseSchema,
} from './osc.schema';
export type { GeneralData, SaveGeneralDataBody, SaveGeneralDataResponse } from './osc.schema';

export {
  LegalBaseDataSchema,
  SaveLegalBaseBodySchema,
  SaveLegalBaseResponseSchema,
} from './legal-base.schema';
export type { LegalBaseData, SaveLegalBaseBody, SaveLegalBaseResponse } from './legal-base.schema';

export {
  InterventionModelProgramItemSchema,
  OperativeTeamItemSchema,
  PopulationServedItemSchema,
  VolunteerActivityItemSchema,
} from './institutional-base-items.schema';
export type {
  InterventionModelProgramItem,
  OperativeTeamItem,
  PopulationServedItem,
  VolunteerActivityItem,
} from './institutional-base-items.schema';

export {
  InterventionModelProgramDataSchema,
  OperativeTeamDataSchema,
  PopulationServedDataSchema,
  VolunteerActivityDataSchema,
} from './institutional-base-data.schema';
export type {
  InterventionModelProgramData,
  OperativeTeamData,
  PopulationServedData,
  VolunteerActivityData,
} from './institutional-base-data.schema';

export {
  InstitutionalBaseDataSchema,
  SaveInstitutionalBaseBodySchema,
  SaveInstitutionalBaseResponseSchema,
} from './institutional-base.schema';
export type {
  InstitutionalBaseData,
  SaveInstitutionalBaseBody,
  SaveInstitutionalBaseResponse,
} from './institutional-base.schema';
