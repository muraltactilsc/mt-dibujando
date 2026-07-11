import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { RegisterBody } from '@dibujando/shared';
import { hashIdentityPassword } from '../domain/identity-password-verifier';
import { verifyRegistrationToken } from '../../registration/domain/registration-token';
import {
  duplicateRegistryNumber,
  emailTaken,
  passwordMismatch,
  registrationTokenExpired,
  weakPassword,
} from '../presentation/auth-error.exception';
import { AuthRepository } from '../infrastructure/auth.repository';

function isPasswordPolicyCompliant(password: string): boolean {
  if (password.length < 6) {
    return false;
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasNonAlphanumeric = /\W/.test(password);

  return hasUpperCase && hasLowerCase && hasDigit && hasNonAlphanumeric;
}

const OSC_NOT_APPROVED_ROLE_NAME = 'OSCNotApproved';

@Injectable()
export class UserRegistrationService {
  constructor(private readonly repository: AuthRepository) {}

  async register(body: RegisterBody): Promise<{ userId: string }> {
    try {
      await verifyRegistrationToken(body.registrationToken);
    } catch {
      throw registrationTokenExpired();
    }

    if (!isPasswordPolicyCompliant(body.password)) {
      throw weakPassword();
    }

    if (body.password !== body.confirmPassword) {
      throw passwordMismatch();
    }

    const existingUser = await this.repository.findUserByEmail(body.email);
    if (existingUser) {
      throw emailTaken();
    }

    const existingProfile = await this.repository.findActiveProfileByRegistryNumber(
      body.nationalRegistryNumber,
    );
    if (existingProfile) {
      throw duplicateRegistryNumber();
    }

    const userId = randomUUID();
    const securityStamp = randomUUID();
    const now = new Date();

    await this.repository.createUser({
      id: userId,
      email: body.email.toLowerCase(),
      username: body.email.toLowerCase(),
      passwordhash: hashIdentityPassword(body.password),
      securitystamp: securityStamp,
      emailconfirmed: false,
      lockoutenabled: true,
      accessfailedcount: 0,
      twofactorenabled: false,
      phonenumberconfirmed: false,
    });

    const roleId = await this.repository.findRoleIdByName(OSC_NOT_APPROVED_ROLE_NAME);
    if (roleId) {
      await this.repository.assignRole({ userid: userId, roleid: roleId });
    }

    await this.repository.createProfile({
      email: body.email,
      institutionname: body.institutionName.trim(),
      fullinstitutionname: body.institutionName.trim(),
      internalid: userId,
      countryid: body.countryId,
      nationalregistrynumber: body.nationalRegistryNumber.trim(),
      statusid: 1,
      usercreateid: '1',
      datetimecreate: now,
    });

    return { userId };
  }
}
