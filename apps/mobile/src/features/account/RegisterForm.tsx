import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, useTheme } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { RegisterBody } from '@dibujando/shared';
import { router } from 'expo-router';
import { useCountriesQuery } from '../../api/catalogs.queries';
import { useRegisterMutation } from '../../api/registration.queries';
import { useSessionStore } from '../../auth/useSessionStore';
import { useRegistrationStore } from '../../state/useRegistrationStore';
import { FormErrorBanner } from '../../components/FormErrorBanner';
import { FormTextField } from '../../components/FormTextField';
import CountryDropdown from './CountryDropdown';
import {
  PASSWORD_POLICY,
  RegisterFormSchema,
  type RegisterFormValues,
} from './register-form.schema';
import { useRegisterBannerError } from './useRegisterBannerError';

interface RegisterFormProps {
  registrationToken: string;
}

export default function RegisterForm({ registrationToken }: RegisterFormProps) {
  const theme = useTheme();
  const setSession = useSessionStore((state) => state.setSession);
  const clearRegistration = useRegistrationStore((state) => state.clear);
  const registerMutation = useRegisterMutation();
  const { data: countries, isLoading: isLoadingCountries } = useCountriesQuery();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      institutionName: '',
      nationalRegistryNumber: '',
      countryId: undefined,
      email: '',
      password: '',
      confirmPassword: '',
      registrationToken,
    },
  });

  useEffect(() => {
    setValue('registrationToken', registrationToken);
  }, [registrationToken, setValue]);

  const bannerMessage = useRegisterBannerError(errors, registerMutation.error);

  const onSubmit = handleSubmit((data) => {
    const payload: RegisterBody = {
      ...data,
      registrationToken,
    };
    registerMutation.mutate(payload, {
      onSuccess: (session) => {
        clearRegistration();
        void setSession(session).then(() => router.replace('/'));
      },
      onError: (error) => {
        if (error.code === 'registration_token_expired') {
          clearRegistration();
          router.replace('/(auth)/question');
        }
      },
    });
  });

  return (
    <View style={styles.formWrapper}>
      <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
        Creación de cuenta
      </Text>

      <Text style={[styles.expiryWarning, { color: theme.colors.error }]}>
        La creación de cuenta caducará en 5 minutos.
      </Text>

      <FormErrorBanner message={bannerMessage} />

      <FormTextField
        control={control}
        name="institutionName"
        label="Nombre corto de la organización"
        error={!!errors.institutionName}
        style={styles.input}
      />

      <FormTextField
        control={control}
        name="nationalRegistryNumber"
        label="RFC o Número de Registro Nacional"
        autoCapitalize="characters"
        error={!!errors.nationalRegistryNumber}
        style={styles.input}
      />

      <Controller
        control={control}
        name="countryId"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <View style={styles.input}>
            <CountryDropdown
              countries={countries}
              isLoading={isLoadingCountries}
              value={value}
              onChange={onChange}
              error={error}
            />
          </View>
        )}
      />

      <FormTextField
        control={control}
        name="email"
        label="Correo electrónico"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        error={!!errors.email}
        style={styles.input}
      />

      <FormTextField
        control={control}
        name="password"
        label="Contraseña"
        secureTextEntry
        autoComplete="password"
        textContentType="password"
        error={!!errors.password}
        style={styles.input}
      />
      <HelperText type="info" visible style={styles.policyHelper}>
        {PASSWORD_POLICY}
      </HelperText>

      <FormTextField
        control={control}
        name="confirmPassword"
        label="Confirmar contraseña"
        secureTextEntry
        autoComplete="password"
        textContentType="password"
        error={!!errors.confirmPassword}
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={() => {
          void onSubmit();
        }}
        loading={registerMutation.isPending || isLoadingCountries}
        disabled={registerMutation.isPending || isLoadingCountries}
        style={styles.submitButton}
      >
        Crear Cuenta
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  formWrapper: {
    alignSelf: 'center',
    maxWidth: 480,
    width: '100%',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  expiryWarning: {
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    alignSelf: 'stretch',
    marginBottom: 12,
  },
  policyHelper: {
    alignSelf: 'stretch',
    marginBottom: 12,
    marginTop: -8,
  },
  submitButton: {
    alignSelf: 'stretch',
    marginTop: 8,
  },
});
