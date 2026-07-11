import { describe, expect, it, vi } from 'vitest';
import { PasswordResetService } from './password-reset.service';
import { signPasswordResetToken } from '../domain/password-reset-token';
import { verifyIdentityPassword } from '../domain/identity-password-verifier';
import {
  resetMismatch,
  resetPasswordMismatch,
  resetTokenExpired,
  resetUserNotFound,
  weakPassword,
} from '../presentation/auth-error.exception';
import {
  buildPasswordResetNotifications,
  buildPasswordResetRepository,
} from './password-reset-test.helpers';

process.env.JWT_SECRET = 'test-secret';

describe('PasswordResetService.resetPassword', () => {
  it('updates password and rotates security stamp on success', async () => {
    const user = {
      id: 'user-1',
      email: 'test@example.com',
      securitystamp: 'stamp-1',
      passwordhash: 'old-hash',
    };
    const token = await signPasswordResetToken({
      sub: user.id,
      securityStampAtIssue: user.securitystamp,
    });
    const repository = buildPasswordResetRepository({
      findUserByEmail: vi.fn().mockResolvedValue(user),
      updatePasswordAndSecurityStamp: vi.fn().mockImplementation((_id: string, hash: string) => {
        user.passwordhash = hash;
      }),
    });
    const service = new PasswordResetService(repository, buildPasswordResetNotifications());

    await service.resetPassword(token, 'test@example.com', 'NewPass1!', 'NewPass1!');

    expect(vi.mocked(repository.updatePasswordAndSecurityStamp)).toHaveBeenCalledWith(
      'user-1',
      expect.any(String),
      expect.any(String),
    );
    expect(verifyIdentityPassword('NewPass1!', user.passwordhash)).toBe(true);
  });

  it('throws reset_token_expired for an invalid token', async () => {
    const service = new PasswordResetService(
      buildPasswordResetRepository(),
      buildPasswordResetNotifications(),
    );

    await expect(
      service.resetPassword('bad-token', 'test@example.com', 'NewPass1!', 'NewPass1!'),
    ).rejects.toEqual(resetTokenExpired());
  });

  it('throws user_not_found when the email has no account', async () => {
    const token = await signPasswordResetToken({
      sub: 'user-1',
      securityStampAtIssue: 'stamp-1',
    });
    const service = new PasswordResetService(
      buildPasswordResetRepository(),
      buildPasswordResetNotifications(),
    );

    await expect(
      service.resetPassword(token, 'missing@example.com', 'NewPass1!', 'NewPass1!'),
    ).rejects.toEqual(resetUserNotFound());
  });

  it('throws reset_mismatch when the email does not match the token subject', async () => {
    const token = await signPasswordResetToken({
      sub: 'user-1',
      securityStampAtIssue: 'stamp-1',
    });
    const repository = buildPasswordResetRepository({
      findUserByEmail: vi.fn().mockResolvedValue({ id: 'user-2', email: 'other@example.com' }),
    });
    const service = new PasswordResetService(repository, buildPasswordResetNotifications());

    await expect(
      service.resetPassword(token, 'other@example.com', 'NewPass1!', 'NewPass1!'),
    ).rejects.toEqual(resetMismatch());
  });

  it('throws weak_password when the policy is not met', async () => {
    const token = await signPasswordResetToken({
      sub: 'user-1',
      securityStampAtIssue: 'stamp-1',
    });
    const repository = buildPasswordResetRepository({
      findUserByEmail: vi.fn().mockResolvedValue({ id: 'user-1', email: 'test@example.com' }),
    });
    const service = new PasswordResetService(repository, buildPasswordResetNotifications());

    await expect(
      service.resetPassword(token, 'test@example.com', 'short', 'short'),
    ).rejects.toEqual(weakPassword());
  });

  it('throws password_mismatch when confirmation differs', async () => {
    const token = await signPasswordResetToken({
      sub: 'user-1',
      securityStampAtIssue: 'stamp-1',
    });
    const repository = buildPasswordResetRepository({
      findUserByEmail: vi.fn().mockResolvedValue({ id: 'user-1', email: 'test@example.com' }),
    });
    const service = new PasswordResetService(repository, buildPasswordResetNotifications());

    await expect(
      service.resetPassword(token, 'test@example.com', 'NewPass1!', 'Different1!'),
    ).rejects.toEqual(resetPasswordMismatch());
  });
});
