import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { useSessionStore } from '../../auth/useSessionStore';

export default function HomeScreen() {
  const theme = useTheme();
  const user = useSessionStore((state) => state.user);
  const logout = useSessionStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
        Portal Dibujando
      </Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.onBackground }}>
        Bienvenido
      </Text>

      {user && (
        <View style={styles.userInfo}>
          <Text variant="bodyLarge" style={{ color: theme.colors.onBackground }}>
            Institución: {user.institutionName}
          </Text>
          <Text variant="bodyLarge" style={{ color: theme.colors.onBackground }}>
            Rol: {user.role ?? '—'}
          </Text>
        </View>
      )}

      <Button
        mode="contained"
        onPress={() => {
          void handleLogout();
        }}
        style={styles.logoutButton}
      >
        Cerrar sesión
      </Button>
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
  userInfo: {
    alignItems: 'center',
    marginTop: 24,
  },
  logoutButton: {
    marginTop: 32,
  },
});
