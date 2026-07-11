import { create } from 'zustand';

interface RegistrationState {
  registrationToken: string | null;
  expiresAt: number | null;
  setToken: (token: string, expiresAt: number) => void;
  clear: () => void;
}

export const useRegistrationStore = create<RegistrationState>((set) => ({
  registrationToken: null,
  expiresAt: null,
  setToken: (token, expiresAt) => set({ registrationToken: token, expiresAt }),
  clear: () => set({ registrationToken: null, expiresAt: null }),
}));
