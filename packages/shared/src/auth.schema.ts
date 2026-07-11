import { z } from 'zod';

export const LoginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginBody = z.infer<typeof LoginBodySchema>;

export const RefreshBodySchema = z.object({
  refreshToken: z.string().min(1),
});

export type RefreshBody = z.infer<typeof RefreshBodySchema>;

export const LogoutBodySchema = z.object({
  refreshToken: z.string().min(1),
});

export type LogoutBody = z.infer<typeof LogoutBodySchema>;

export const AuthUserSchema = z.object({
  userProfileId: z.number(),
  oscProfileId: z.number().nullable(),
  internalId: z.string(),
  institutionName: z.string(),
  role: z.string().nullable(),
  countryId: z.number().nullable(),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;

export const AuthSessionDataSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: AuthUserSchema,
});

export type AuthSessionData = z.infer<typeof AuthSessionDataSchema>;
