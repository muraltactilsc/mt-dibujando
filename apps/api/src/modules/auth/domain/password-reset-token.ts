import { SignJWT, jwtVerify } from 'jose';

export const PASSWORD_RESET_TOKEN_PURPOSE = 'password_reset';
const PASSWORD_RESET_TOKEN_TTL_SECONDS = 24 * 60 * 60;

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return new TextEncoder().encode(secret);
}

export interface PasswordResetTokenClaims {
  sub: string;
  securityStampAtIssue: string;
}

export async function signPasswordResetToken(claims: PasswordResetTokenClaims): Promise<string> {
  return new SignJWT({
    sub: claims.sub,
    securityStampAtIssue: claims.securityStampAtIssue,
    purpose: PASSWORD_RESET_TOKEN_PURPOSE,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${PASSWORD_RESET_TOKEN_TTL_SECONDS}s`)
    .sign(getSecret());
}

export interface PasswordResetTokenPayload {
  sub: string;
  securityStampAtIssue: string;
}

export async function verifyPasswordResetToken(token: string): Promise<PasswordResetTokenPayload> {
  const result = await jwtVerify(token, getSecret(), {
    algorithms: ['HS256'],
  });
  const payload = result.payload as Record<string, unknown>;

  if (payload.purpose !== PASSWORD_RESET_TOKEN_PURPOSE) {
    throw new Error('Invalid password reset token purpose');
  }
  if (typeof payload.sub !== 'string' || typeof payload.securityStampAtIssue !== 'string') {
    throw new Error('Invalid password reset token payload');
  }

  return {
    sub: payload.sub,
    securityStampAtIssue: payload.securityStampAtIssue,
  };
}
