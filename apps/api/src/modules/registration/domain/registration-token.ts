import { SignJWT, jwtVerify } from 'jose';

export const REGISTRATION_TOKEN_PURPOSE = 'register';
const REGISTRATION_TOKEN_TTL_SECONDS = 5 * 60;

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return new TextEncoder().encode(secret);
}

export async function signRegistrationToken(): Promise<string> {
  return new SignJWT({ purpose: REGISTRATION_TOKEN_PURPOSE })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${REGISTRATION_TOKEN_TTL_SECONDS}s`)
    .sign(getSecret());
}

export interface RegistrationTokenPayload {
  purpose: string;
}

export async function verifyRegistrationToken(token: string): Promise<RegistrationTokenPayload> {
  const result = await jwtVerify(token, getSecret(), {
    algorithms: ['HS256'],
  });
  const payload = result.payload as Record<string, unknown>;

  if (payload.purpose !== REGISTRATION_TOKEN_PURPOSE) {
    throw new Error('Invalid registration token purpose');
  }

  return { purpose: String(payload.purpose) };
}
