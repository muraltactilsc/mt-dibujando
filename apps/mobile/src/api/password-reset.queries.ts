import { useMutation, useQuery } from '@tanstack/react-query';
import type { ResetPasswordBody } from '@dibujando/shared';
import { ApiError } from './client';
import { passwordResetApi } from './password-reset.api';

interface ForgotPasswordVariables {
  email: string;
}

interface ResetPasswordVariables {
  code: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function useForgotPasswordMutation() {
  return useMutation<void, ApiError, ForgotPasswordVariables>({
    mutationFn: ({ email }) => passwordResetApi.forgotPassword(email),
  });
}

export function useResetPasswordValidateQuery(code: string | undefined) {
  return useQuery<{ valid: boolean }, ApiError>({
    queryKey: ['reset-password-validate', code],
    queryFn: () => passwordResetApi.validateResetPassword(code ?? ''),
    enabled: code !== undefined && code.length > 0,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
  });
}

export function useResetPasswordMutation() {
  return useMutation<void, ApiError, ResetPasswordVariables>({
    mutationFn: ({ code, email, password, confirmPassword }) =>
      passwordResetApi.resetPassword({
        code,
        email,
        password,
        confirmPassword,
      } satisfies ResetPasswordBody),
  });
}
