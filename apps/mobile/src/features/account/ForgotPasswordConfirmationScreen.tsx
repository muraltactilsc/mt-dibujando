import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { router } from 'expo-router';

export default function ForgotPasswordConfirmationScreen() {
  const theme = useTheme();

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

        <Text variant="bodyLarge" style={[styles.message, { color: theme.colors.onBackground }]}>
          Por favor revisa tu correo electrónico para restablecer tu contraseña.
        </Text>

        <Button
          mode="contained"
          onPress={() => router.push('/(auth)/login')}
          style={styles.submitButton}
        >
          Iniciar Sesión
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
  message: {
    marginBottom: 24,
    textAlign: 'center',
  },
  submitButton: {
    alignSelf: 'stretch',
  },
});
