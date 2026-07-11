import { describe, expect, it } from 'vitest';
import type { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from './roles.decorator';
import type { AuthenticatedRequest } from './jwt-auth.guard';

function createContext(role: string | null): {
  getHandler: () => object;
  getClass: () => object;
  switchToHttp: () => { getRequest: () => AuthenticatedRequest };
} {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () =>
        ({
          user: {
            userProfileId: 1,
            oscProfileId: null,
            internalId: '11111111-1111-1111-1111-111111111111',
            institutionName: 'QA',
            role,
            countryId: null,
          },
        }) as AuthenticatedRequest,
    }),
  };
}

function createReflector(requiredRoles: string[] | undefined): Reflector {
  return {
    getAllAndOverride: (key: string) => (key === ROLES_KEY ? requiredRoles : undefined),
  } as unknown as Reflector;
}

describe('RolesGuard', () => {
  it('allows a SysAdmin request through @Roles("SysAdmin")', () => {
    const guard = new RolesGuard(createReflector(['SysAdmin']));

    expect(guard.canActivate(createContext('SysAdmin') as never)).toBe(true);
  });

  it('denies an OSCApproved request through @Roles("SysAdmin")', () => {
    const guard = new RolesGuard(createReflector(['SysAdmin']));

    expect(() => guard.canActivate(createContext('OSCApproved') as never)).toThrow(
      'No tienes permiso para acceder a este recurso.',
    );
  });

  it('allows any authenticated request when no roles are required', () => {
    const guard = new RolesGuard(createReflector(undefined));

    expect(guard.canActivate(createContext('OSCApproved') as never)).toBe(true);
  });
});
