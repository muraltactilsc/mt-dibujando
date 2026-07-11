import { useMutation } from '@tanstack/react-query';
import type { AuthSessionData } from '@dibujando/shared';
import { ApiError } from './client';
import { authApi } from './auth.api';

interface LoginVariables {
  email: string;
  password: string;
}

export function useLoginMutation() {
  return useMutation<AuthSessionData, ApiError, LoginVariables>({
    mutationFn: ({ email, password }) => authApi.login(email, password),
  });
}
