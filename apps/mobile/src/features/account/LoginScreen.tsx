import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput, useTheme } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginBodySchema, type LoginBody } from '@dibujando/shared';
import { router } from 'expo-router';
import { useLoginMutation } from '../../api/auth.queries';
import { useSessionStore } from '../../auth/useSessionStore';

export default function LoginScreen() {
  const theme = useTheme();
  const setSession = useSessionStore((state) => state.setSession);
  const loginMutation = useLoginMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginBody>({
    resolver: zodResolver(LoginBodySchema),
    defaultValues: { email: '', password: '' },
  });

  const emailValue = watch('email');

  const bannerMessage = useMemo(() => {
    if (errors.email) {
      return emailValue.trim() === ''
        ? 'El correo electrónico es requerido.'
        : 'El Correo electrónico no es una dirección de correo válida.';
    }
    if (errors.password) {
      return 'La contraseña es requerida.';
    }
    return loginMutation.error?.message ?? null;
  }, [errors, emailValue, loginMutation.error]);

  const onSubmit = handleSubmit((data) => {
    loginMutation.mutate(data, {
      onSuccess: (session) => {
        void setSession(session).then(() => router.replace('/'));
      },
    });
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
          Iniciar Sesión
        </Text>

        {bannerMessage && (
          <HelperText type="error" visible style={styles.banner}>
            {bannerMessage}
          </HelperText>
        )}

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              placeholder="Correo Electrónico"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              error={!!errors.email}
              style={styles.input}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              mode="outlined"
              placeholder="Contraseña"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              error={!!errors.password}
              style={styles.input}
            />
          )}
        />

        <Button
          mode="contained"
          onPress={() => {
            void onSubmit();
          }}
          loading={loginMutation.isPending}
          disabled={loginMutation.isPending}
          style={styles.submitButton}
        >
          Iniciar Sesión
        </Button>

        <Button
          mode="text"
          onPress={() => router.push('/(auth)/forgot-password')}
          style={styles.linkButton}
        >
          Restablecer contraseña
        </Button>

        <View style={[styles.divider, { backgroundColor: theme.colors.outline }]} />

        <Text variant="bodyMedium" style={{ color: theme.colors.onBackground }}>
          ¿No tienes una cuenta?
        </Text>

        <Button
          mode="outlined"
          onPress={() => router.push('/(auth)/register')}
          style={styles.registerButton}
        >
          Regístrate
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
  banner: {
    alignSelf: 'stretch',
    marginBottom: 16,
  },
  input: {
    alignSelf: 'stretch',
    marginBottom: 12,
  },
  submitButton: {
    alignSelf: 'stretch',
    marginBottom: 8,
  },
  linkButton: {
    marginBottom: 16,
  },
  divider: {
    alignSelf: 'stretch',
    height: 1,
    marginBottom: 16,
    marginTop: 8,
  },
  registerButton: {
    alignSelf: 'stretch',
    marginTop: 12,
  },
});
