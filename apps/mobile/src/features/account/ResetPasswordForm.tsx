import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, useTheme } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useResetPasswordMutation } from '../../api/password-reset.queries';
import { FormErrorBanner } from '../../components/FormErrorBanner';
import { FormTextField } from '../../components/FormTextField';
import { ResetPasswordFormSchema, type ResetPasswordFormValues } from './reset-password.schema';
import { PASSWORD_POLICY } from './password-policy';

interface ResetPasswordFormProps {
  resetCode: string;
}

export default function ResetPasswordForm({ resetCode }: ResetPasswordFormProps) {
  const theme = useTheme();
  const resetPasswordMutation = useResetPasswordMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(ResetPasswordFormSchema),
    defaultValues: {
      code: resetCode,
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const bannerMessage = useMemo(() => {
    if (errors.email?.message) return errors.email.message;
    if (errors.password?.message) return errors.password.message;
    if (errors.confirmPassword?.message) return errors.confirmPassword.message;
    return resetPasswordMutation.error?.message ?? null;
  }, [errors, resetPasswordMutation.error]);

  const onSubmit = handleSubmit((formData) => {
    resetPasswordMutation.mutate(
      {
        code: resetCode,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      },
      {
        onSuccess: () => {
          router.push('/(auth)/reset-password-confirmation');
        },
        onError: (error) => {
          if (error.status === 401 && error.code === 'reset_token_expired') {
            router.push('/(auth)/invalid-reset-password');
          }
        },
      },
    );
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.formWrapper}>
        <View style={styles.logo}>
          <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
            Dibujando
          </Text>
        </View>

        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
          Restablecer contraseña
        </Text>

        <FormErrorBanner message={bannerMessage} />

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
          label="Confirmación de Contraseña"
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
          loading={resetPasswordMutation.isPending}
          disabled={resetPasswordMutation.isPending}
          style={styles.submitButton}
        >
          Restablecer Contraseña
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  formWrapper: {
    alignItems: 'center',
    maxWidth: 360,
    width: '100%',
  },
  logo: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    marginBottom: 24,
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
    marginBottom: 8,
  },
});
