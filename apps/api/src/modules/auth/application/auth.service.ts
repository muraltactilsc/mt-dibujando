import { randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { AuthUser, RegisterBody } from '@dibujando/shared';
import type { Selectable } from 'kysely';
import { SignJWT } from 'jose';
import type { Aspnetusers, Userprofile } from '../../../../db/types';
import { verifyIdentityPassword } from '../domain/identity-password-verifier';
import {
  invalidCredentials,
  sessionInvalidated,
  unauthenticated,
  userNotFound,
} from '../presentation/auth-error.exception';
import { AuthRepository } from '../infrastructure/auth.repository';
import { UserRegistrationService } from './user-registration.service';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSessionData extends TokenPair {
  user: AuthUser;
}

export interface JwtClaims {
  sub: string;
  email: string;
  role: string | null;
  securityStampAtIssue: string;
}

const ACCESS_TOKEN_TTL_SECONDS = 30 * 60;
const REFRESH_TOKEN_TTL_DAYS = 14;

function newRefreshToken(): string {
  return randomBytes(32).toString('base64url');
}

@Injectable()
export class AuthService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly userRegistrationService: UserRegistrationService,
  ) {}

  private getSecret(): Uint8Array {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }
    return new TextEncoder().encode(secret);
  }

  private toAuthUser(
    userId: string,
    roleName: string | null,
    profile: Selectable<Userprofile> | null,
  ): AuthUser {
    return {
      userProfileId: profile?.userprofileid ?? 0,
      oscProfileId: null,
      internalId: userId,
      institutionName: profile?.institutionname ?? '',
      role: roleName,
      countryId: profile?.countryid ?? null,
    };
  }

  async signAccessToken(claims: JwtClaims): Promise<string> {
    return new SignJWT({
      sub: claims.sub,
      email: claims.email,
      role: claims.role,
      securityStampAtIssue: claims.securityStampAtIssue,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
      .sign(this.getSecret());
  }

  private async issueSessionForUser(
    user: Selectable<Aspnetusers>,
    roleName: string | null,
    profile: Selectable<Userprofile> | null,
  ): Promise<AuthSessionData> {
    const accessToken = await this.signAccessToken({
      sub: user.id,
      email: user.email ?? '',
      role: roleName,
      securityStampAtIssue: user.securitystamp ?? '',
    });

    const refreshToken = newRefreshToken();
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

    await this.repository.createSession(refreshToken, {
      user_id: user.id,
      security_stamp_at_issue: user.securitystamp ?? '',
      expires_at: expiresAt,
      created_at: now,
    });

    return {
      accessToken,
      refreshToken,
      user: this.toAuthUser(user.id, roleName, profile),
    };
  }

  async login(email: string, password: string): Promise<AuthSessionData> {
    const found = await this.repository.findUserWithRoleAndProfileByEmail(email);

    if (!found) {
      throw userNotFound();
    }

    if (!found.user.passwordhash || !verifyIdentityPassword(password, found.user.passwordhash)) {
      throw invalidCredentials();
    }

    return this.issueSessionForUser(found.user, found.roleName, found.profile);
  }

  async register(body: RegisterBody): Promise<AuthSessionData> {
    const { userId } = await this.userRegistrationService.register(body);

    const user = await this.repository.findUserWithRoleAndProfileById(userId);
    if (!user) {
      throw unauthenticated();
    }

    return this.issueSessionForUser(user.user, user.roleName, user.profile);
  }

  async refresh(refreshToken: string): Promise<AuthSessionData> {
    const found = await this.repository.findSessionById(refreshToken);

    if (!found || new Date(found.session.expires_at) <= new Date()) {
      throw sessionInvalidated();
    }

    if (found.session.security_stamp_at_issue !== found.user.securitystamp) {
      await this.repository.deleteSessionById(refreshToken);
      throw sessionInvalidated();
    }

    await this.repository.deleteSessionById(refreshToken);

    const newToken = newRefreshToken();
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

    await this.repository.createSession(newToken, {
      user_id: found.user.id,
      security_stamp_at_issue: found.user.securitystamp ?? '',
      expires_at: expiresAt,
      created_at: now,
    });

    const userDetails = await this.repository.findUserWithRoleAndProfileById(found.user.id);

    const accessToken = await this.signAccessToken({
      sub: found.user.id,
      email: found.user.email ?? '',
      role: userDetails?.roleName ?? null,
      securityStampAtIssue: found.user.securitystamp ?? '',
    });

    return {
      accessToken,
      refreshToken: newToken,
      user: this.toAuthUser(
        found.user.id,
        userDetails?.roleName ?? null,
        userDetails?.profile ?? null,
      ),
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.repository.deleteSessionById(refreshToken);
  }

  async me(userId: string): Promise<AuthUser> {
    const found = await this.repository.findUserWithRoleAndProfileById(userId);
    if (!found) {
      throw unauthenticated();
    }

    return this.toAuthUser(found.user.id, found.roleName, found.profile);
  }
}
