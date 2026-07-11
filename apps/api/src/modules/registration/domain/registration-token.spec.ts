import { describe, expect, it } from 'vitest';
import {
  REGISTRATION_TOKEN_PURPOSE,
  signRegistrationToken,
  verifyRegistrationToken,
} from './registration-token';

process.env.JWT_SECRET = 'test-secret-for-registration-token';

describe('registration-token', () => {
  it('signs and verifies a registration token', async () => {
    const token = await signRegistrationToken();
    const payload = await verifyRegistrationToken(token);
    expect(payload.purpose).toBe(REGISTRATION_TOKEN_PURPOSE);
  });

  it('rejects a token with the wrong purpose', async () => {
    const { SignJWT } = await import('jose');
    const token = await new SignJWT({ purpose: 'other' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));

    await expect(verifyRegistrationToken(token)).rejects.toThrow();
  });

  it('rejects an invalid token', async () => {
    await expect(verifyRegistrationToken('not-a-token')).rejects.toThrow();
  });
});
