import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { router } from 'expo-router';

export default function InvalidResetPasswordScreen() {
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
          OOOPS!
        </Text>

        <Text variant="bodyLarge" style={[styles.message, { color: theme.colors.onBackground }]}>
          El link para restablecer contraseña ha expirado. Da clic en el enlace aquí abajo para
          recibir un nuevo link.
        </Text>

        <Button
          mode="contained"
          onPress={() => router.push('/(auth)/forgot-password')}
          style={styles.submitButton}
        >
          Restablecer contraseña
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
