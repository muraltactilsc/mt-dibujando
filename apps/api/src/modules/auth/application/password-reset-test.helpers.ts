import { vi } from 'vitest';
import type { AuthRepository } from '../infrastructure/auth.repository';
import type { NotificationsService } from '../../notifications/application/notifications.service';

export function buildPasswordResetRepository(
  overrides: Partial<AuthRepository> = {},
): AuthRepository {
  return {
    findUserByEmail: vi.fn().mockResolvedValue(undefined),
    findUserById: vi.fn().mockResolvedValue(undefined),
    findProfileByUserId: vi.fn().mockResolvedValue(undefined),
    updatePasswordAndSecurityStamp: vi.fn().mockResolvedValue(undefined),
    findActiveProfileByRegistryNumber: vi.fn(),
    findRoleIdByName: vi.fn(),
    createUser: vi.fn(),
    assignRole: vi.fn(),
    createProfile: vi.fn(),
    findUserWithRoleAndProfileByEmail: vi.fn(),
    findUserWithRoleAndProfileById: vi.fn(),
    findSessionById: vi.fn(),
    createSession: vi.fn(),
    deleteSessionById: vi.fn(),
    ...overrides,
  };
}

export function buildPasswordResetNotifications(): NotificationsService {
  return {
    sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
  } as unknown as NotificationsService;
}
