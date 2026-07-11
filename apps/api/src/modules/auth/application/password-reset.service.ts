import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { hashIdentityPassword } from '../domain/identity-password-verifier';
import { isPasswordPolicyCompliant } from '../domain/password-policy';
import { signPasswordResetToken, verifyPasswordResetToken } from '../domain/password-reset-token';
import {
  resetMismatch,
  resetPasswordMismatch,
  resetTokenExpired,
  resetUserNotFound,
  weakPassword,
} from '../presentation/auth-error.exception';
import { AuthRepository } from '../infrastructure/auth.repository';
import { NotificationsService } from '../../notifications/application/notifications.service';

export interface ResetValidationResult {
  valid: boolean;
}

function getAppBaseUrl(): string {
  return process.env.APP_BASE_URL ?? 'http://localhost:8081';
}

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly notifications: NotificationsService,
  ) {}

  async forgotPassword(email: string): Promise<void> {
    const user = await this.repository.findUserByEmail(email);

    if (!user) {
      return;
    }

    const token = await signPasswordResetToken({
      sub: user.id,
      securityStampAtIssue: user.securitystamp ?? '',
    });

    const resetUrl = `${getAppBaseUrl()}/reset-password?code=${encodeURIComponent(token)}`;
    const profile = await this.repository.findProfileByUserId(user.id);
    const institutionName = profile?.institutionname ?? '';

    await this.notifications.sendPasswordResetEmail(user.email ?? '', resetUrl, institutionName);
  }

  async validateResetToken(code: string): Promise<ResetValidationResult> {
    try {
      const payload = await verifyPasswordResetToken(code);
      const user = await this.repository.findUserById(payload.sub);

      if (!user) {
        return { valid: false };
      }

      if ((user.securitystamp ?? '') !== payload.securityStampAtIssue) {
        return { valid: false };
      }

      return { valid: true };
    } catch {
      return { valid: false };
    }
  }

  async resetPassword(
    code: string,
    email: string,
    password: string,
    confirmPassword: string,
  ): Promise<void> {
    let payload: { sub: string; securityStampAtIssue: string };
    try {
      payload = await verifyPasswordResetToken(code);
    } catch {
      throw resetTokenExpired();
    }

    const user = await this.repository.findUserByEmail(email);
    if (!user) {
      throw resetUserNotFound();
    }

    if (user.id !== payload.sub) {
      throw resetMismatch();
    }

    if (!isPasswordPolicyCompliant(password)) {
      throw weakPassword();
    }

    if (password !== confirmPassword) {
      throw resetPasswordMismatch();
    }

    await this.repository.updatePasswordAndSecurityStamp(
      user.id,
      hashIdentityPassword(password),
      randomUUID(),
    );
  }
}
