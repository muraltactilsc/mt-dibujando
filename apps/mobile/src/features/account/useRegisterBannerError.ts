import { useMemo } from 'react';
import type { FieldErrors } from 'react-hook-form';
import { ApiError } from '../../api/client';
import type { RegisterFormValues } from './register-form.schema';

export function useRegisterBannerError(
  errors: FieldErrors<RegisterFormValues>,
  mutationError: ApiError | null,
): string | null {
  return useMemo(() => {
    if (errors.email?.message) return errors.email.message;
    if (errors.password?.message) return errors.password.message;
    if (errors.confirmPassword?.message) return errors.confirmPassword.message;
    if (errors.institutionName?.message) return errors.institutionName.message;
    if (errors.nationalRegistryNumber?.message) return errors.nationalRegistryNumber.message;
    if (errors.countryId?.message) return errors.countryId.message;
    return mutationError?.message ?? null;
  }, [errors, mutationError]);
}
