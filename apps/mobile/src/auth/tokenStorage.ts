import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const REFRESH_TOKEN_KEY = 'refreshToken';

function isWeb(): boolean {
  return Platform.OS === 'web';
}

export const tokenStorage = {
  getRefreshToken: async (): Promise<string | null> => {
    if (isWeb()) {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  setRefreshToken: async (token: string): Promise<void> => {
    if (isWeb()) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
      return;
    }
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  },

  deleteRefreshToken: async (): Promise<void> => {
    if (isWeb()) {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};
