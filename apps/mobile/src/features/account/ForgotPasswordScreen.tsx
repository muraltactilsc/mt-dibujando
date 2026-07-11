import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ForgotPasswordBodySchema } from '@dibujando/shared';
import { z } from 'zod';
import { router } from 'expo-router';
import { useForgotPasswordMutation } from '../../api/password-reset.queries';
import { FormErrorBanner } from '../../components/FormErrorBanner';
import { FormTextField } from '../../components/FormTextField';

const ForgotPasswordFormSchema = ForgotPasswordBodySchema.extend({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido.')
    .email('El Correo electrónico no es una dirección de correo válida.'),
});

type ForgotPasswordFormValues = z.infer<typeof ForgotPasswordFormSchema>;

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const forgotPasswordMutation = useForgotPasswordMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(ForgotPasswordFormSchema),
    defaultValues: { email: '' },
  });

  const bannerMessage = useMemo(() => {
    if (errors.email) {
      return errors.email.message;
    }
    return forgotPasswordMutation.error?.message ?? null;
  }, [errors.email, forgotPasswordMutation.error]);

  const onSubmit = handleSubmit((data) => {
    forgotPasswordMutation.mutate(
      { email: data.email },
      {
        onSuccess: () => {
          router.push('/(auth)/forgot-password-confirmation');
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

        <Button
          mode="contained"
          onPress={() => {
            void onSubmit();
          }}
          loading={forgotPasswordMutation.isPending}
          disabled={forgotPasswordMutation.isPending}
          style={styles.submitButton}
        >
          Enviar
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
  submitButton: {
    alignSelf: 'stretch',
    marginBottom: 8,
  },
});
