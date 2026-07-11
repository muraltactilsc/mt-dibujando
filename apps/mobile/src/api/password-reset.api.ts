import type {
  ForgotPasswordBody,
  ResetPasswordBody,
  ResetPasswordValidateResponse,
} from '@dibujando/shared';
import { apiGet, apiPost } from './client';

interface SuccessEnvelope<T> {
  success: true;
  data: T;
}

export const passwordResetApi = {
  forgotPassword: async (email: string): Promise<void> => {
    await apiPost<SuccessEnvelope<Record<string, never>>>(
      '/api/auth/forgot-password',
      { email } satisfies ForgotPasswordBody,
      { skipAuth: true, skipRefresh: true },
    );
  },

  validateResetPassword: async (code: string): Promise<{ valid: boolean }> => {
    const response = await apiGet<ResetPasswordValidateResponse>(
      `/api/auth/reset-password/validate?code=${encodeURIComponent(code)}`,
      { skipAuth: true, skipRefresh: true },
    );
    return response.data;
  },

  resetPassword: async (body: ResetPasswordBody): Promise<void> => {
    await apiPost<SuccessEnvelope<Record<string, never>>>('/api/auth/reset-password', body, {
      skipAuth: true,
      skipRefresh: true,
    });
  },
};
