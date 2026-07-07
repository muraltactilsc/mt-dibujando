import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { Slot } from 'expo-router';
import { useColorScheme } from 'react-native';

const accent = '#E4312A';

const lightTheme = {
  ...MD3LightTheme,
  colors: { ...MD3LightTheme.colors, primary: accent },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: { ...MD3DarkTheme.colors, primary: accent },
};

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <Slot />
      </QueryClientProvider>
    </PaperProvider>
  );
}
