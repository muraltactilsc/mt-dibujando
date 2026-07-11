import { create } from 'zustand';
import type { AuthSessionData, AuthUser } from '@dibujando/shared';
import { authApi } from '../api/auth.api';
import { tokenStorage } from './tokenStorage';

export type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface SessionState {
  status: SessionStatus;
  accessToken: string | null;
  user: AuthUser | null;
  setSession: (session: AuthSessionData) => Promise<void>;
  clearSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  bootstrap: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set) => ({
  status: 'loading',
  accessToken: null,
  user: null,

  setSession: async (session) => {
    await tokenStorage.setRefreshToken(session.refreshToken);
    set({
      status: 'authenticated',
      accessToken: session.accessToken,
      user: session.user,
    });
  },

  clearSession: async () => {
    await tokenStorage.deleteRefreshToken();
    set({
      status: 'unauthenticated',
      accessToken: null,
      user: null,
    });
  },

  login: async (email, password) => {
    const session = await authApi.login(email, password);
    await useSessionStore.getState().setSession(session);
  },

  logout: async () => {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // ignore network errors: local session must still be cleared
      }
    }
    await useSessionStore.getState().clearSession();
  },

  refresh: async () => {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const session = await authApi.refresh(refreshToken);
    await useSessionStore.getState().setSession(session);
  },

  bootstrap: async () => {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (!refreshToken) {
      set({ status: 'unauthenticated' });
      return;
    }
    try {
      await useSessionStore.getState().refresh();
    } catch {
      await useSessionStore.getState().clearSession();
    }
  },
}));
