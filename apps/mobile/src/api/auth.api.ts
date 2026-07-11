import type {
  AuthSessionData,
  AuthUser,
  LoginBody,
  LogoutBody,
  RefreshBody,
} from '@dibujando/shared';
import { apiGet, apiPost } from './client';

interface SuccessEnvelope<T> {
  success: true;
  data: T;
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthSessionData> => {
    const response = await apiPost<SuccessEnvelope<AuthSessionData>>(
      '/api/auth/login',
      { email, password } satisfies LoginBody,
      { skipAuth: true, skipRefresh: true },
    );
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<AuthSessionData> => {
    const response = await apiPost<SuccessEnvelope<AuthSessionData>>(
      '/api/auth/refresh',
      { refreshToken } satisfies RefreshBody,
      { skipAuth: true, skipRefresh: true },
    );
    return response.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await apiPost<SuccessEnvelope<Record<string, never>>>(
      '/api/auth/logout',
      { refreshToken } satisfies LogoutBody,
      { skipAuth: true, skipRefresh: true },
    );
  },

  me: async (): Promise<AuthUser> => {
    const response = await apiGet<SuccessEnvelope<{ user: AuthUser }>>('/api/auth/me');
    return response.data.user;
  },
};
