import { describe, expect, it, vi } from 'vitest';
import { PasswordResetService } from './password-reset.service';
import {
  buildPasswordResetNotifications,
  buildPasswordResetRepository,
} from './password-reset-test.helpers';

process.env.JWT_SECRET = 'test-secret';
process.env.APP_BASE_URL = 'http://localhost:8081';

describe('PasswordResetService.forgotPassword', () => {
  it('sends an email when the user exists', async () => {
    const user = {
      id: 'user-1',
      email: 'test@example.com',
      securitystamp: 'stamp-1',
    };
    const repository = buildPasswordResetRepository({
      findUserByEmail: vi.fn().mockResolvedValue(user),
      findProfileByUserId: vi.fn().mockResolvedValue({ institutionname: 'Org' }),
    });
    const notifications = buildPasswordResetNotifications();
    const service = new PasswordResetService(repository, notifications);

    await service.forgotPassword('test@example.com');

    expect(vi.mocked(notifications.sendPasswordResetEmail)).toHaveBeenCalledWith(
      'test@example.com',
      expect.stringContaining('/reset-password?code='),
      'Org',
    );
  });

  it('returns silently when the user does not exist', async () => {
    const repository = buildPasswordResetRepository();
    const notifications = buildPasswordResetNotifications();
    const service = new PasswordResetService(repository, notifications);

    await service.forgotPassword('missing@example.com');

    expect(vi.mocked(notifications.sendPasswordResetEmail)).not.toHaveBeenCalled();
  });
});
