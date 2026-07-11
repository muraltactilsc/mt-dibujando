import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { registerAuthHandlers } from '../api/client';
import { useSessionStore } from './useSessionStore';

registerAuthHandlers({
  getAccessToken: () => useSessionStore.getState().accessToken,
  refreshSession: () => useSessionStore.getState().refresh(),
  clearSession: () => useSessionStore.getState().logout(),
});

interface SessionProviderProps {
  children: React.ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const status = useSessionStore((state) => state.status);
  const bootstrap = useSessionStore((state) => state.bootstrap);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    const publicAuthRoutes = [
      '/login',
      '/question',
      '/question-fail',
      '/register',
      '/forgot-password',
    ];
    const isPublicAuthRoute = publicAuthRoutes.includes(pathname);

    if (status === 'unauthenticated' && !isPublicAuthRoute) {
      router.replace('/login');
      return;
    }

    if (status === 'authenticated' && pathname === '/login') {
      router.replace('/');
    }
  }, [status, pathname, router]);

  if (status === 'loading') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
