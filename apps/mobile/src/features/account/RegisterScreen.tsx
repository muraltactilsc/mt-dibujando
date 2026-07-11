import { useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { useRegistrationStore } from '../../state/useRegistrationStore';
import RegisterForm from './RegisterForm';

export default function RegisterScreen() {
  const theme = useTheme();
  const registrationToken = useRegistrationStore((state) => state.registrationToken);
  const expiresAt = useRegistrationStore((state) => state.expiresAt);

  useEffect(() => {
    if (!registrationToken || !expiresAt || Date.now() > expiresAt) {
      useRegistrationStore.getState().clear();
      const handle = requestAnimationFrame(() => {
        router.replace('/(auth)/question');
      });
      return () => cancelAnimationFrame(handle);
    }
    return undefined;
  }, [registrationToken, expiresAt]);

  if (!registrationToken || !expiresAt || Date.now() > expiresAt) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.colors.background }]}
    >
      <RegisterForm registrationToken={registrationToken} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
});
