import { describe, expect, it } from 'vitest';
import { signPasswordResetToken, verifyPasswordResetToken } from './password-reset-token';

process.env.JWT_SECRET = 'test-secret';

describe('password-reset-token', () => {
  it('round-trips a valid token', async () => {
    const token = await signPasswordResetToken({
      sub: 'user-id',
      securityStampAtIssue: 'stamp-123',
    });

    const payload = await verifyPasswordResetToken(token);

    expect(payload.sub).toBe('user-id');
    expect(payload.securityStampAtIssue).toBe('stamp-123');
  });

  it('rejects a token with the wrong purpose', async () => {
    const { SignJWT } = await import('jose');
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ purpose: 'other', sub: 'x', securityStampAtIssue: 'y' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(secret);

    await expect(verifyPasswordResetToken(token)).rejects.toThrow();
  });

  it('rejects a tampered token', async () => {
    const token = await signPasswordResetToken({
      sub: 'user-id',
      securityStampAtIssue: 'stamp-123',
    });

    await expect(verifyPasswordResetToken(`${token}x`)).rejects.toThrow();
  });
});
