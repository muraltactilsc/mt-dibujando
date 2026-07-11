import { describe, expect, it, vi } from 'vitest';
import { PasswordResetService } from './password-reset.service';
import { signPasswordResetToken } from '../domain/password-reset-token';
import {
  buildPasswordResetNotifications,
  buildPasswordResetRepository,
} from './password-reset-test.helpers';

process.env.JWT_SECRET = 'test-secret';

describe('PasswordResetService.validateResetToken', () => {
  it('returns valid true for a fresh token', async () => {
    const user = {
      id: 'user-1',
      securitystamp: 'stamp-1',
    };
    const token = await signPasswordResetToken({
      sub: user.id,
      securityStampAtIssue: user.securitystamp,
    });
    const repository = buildPasswordResetRepository({
      findUserById: vi.fn().mockResolvedValue(user),
    });
    const service = new PasswordResetService(repository, buildPasswordResetNotifications());

    const result = await service.validateResetToken(token);

    expect(result.valid).toBe(true);
  });

  it('returns valid false when the security stamp changed', async () => {
    const token = await signPasswordResetToken({
      sub: 'user-1',
      securityStampAtIssue: 'old-stamp',
    });
    const repository = buildPasswordResetRepository({
      findUserById: vi.fn().mockResolvedValue({ id: 'user-1', securitystamp: 'new-stamp' }),
    });
    const service = new PasswordResetService(repository, buildPasswordResetNotifications());

    const result = await service.validateResetToken(token);

    expect(result.valid).toBe(false);
  });

  it('returns valid false for an invalid token', async () => {
    const repository = buildPasswordResetRepository();
    const service = new PasswordResetService(repository, buildPasswordResetNotifications());

    const result = await service.validateResetToken('not-a-token');

    expect(result.valid).toBe(false);
  });
});
