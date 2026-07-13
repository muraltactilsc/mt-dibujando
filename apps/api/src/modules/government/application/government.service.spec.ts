import { describe, expect, it } from 'vitest';
import type { GovernmentRepository } from '../infrastructure/government.repository';
import {
  governingBodyNotFound,
  GovernmentErrorException,
  oscProfileLocked,
  userProfileNotFound,
} from '../presentation/government-error.exception';
import { GovernmentService } from './government.service';

const baseBody = {
  userProfileId: 1,
  presidencyName: 'María Elena Ríos',
  presidencyEmail: 'presidencia@qa.dibujando.test',
  legalRepresentativeName: 'Carlos Mendoza Hernández',
  legalRepresentativeEmail: 'legal@qa.dibujando.test',
  executiveGeneralManagementName: 'Ana Lucía Torres',
  executiveGeneralManagementEmail: 'direccion@qa.dibujando.test',
  programAndProjectOperationName: 'Luis Fernando Castillo',
  programAndProjectOperationEmail: 'programas@qa.dibujando.test',
  institutionalDevelopmentName: 'Diana Patricia Vargas',
  institutionalDevelopmentEmail: 'desarrollo@qa.dibujando.test',
  numberOfMembers: 5,
  governingBody: [
    {
      name: 'Juan Pérez',
      position: 'Tesorero',
      memberSince: 2020,
      isMemberOfOtherBody: false,
      rfc: 'RFC123456789',
    },
  ],
};

function mockRepository(overrides?: Partial<GovernmentRepository>): GovernmentRepository {
  return {
    findUserProfileById: () => Promise.resolve(null),
    findActiveOSCProfileByUserProfileId: () => Promise.resolve(null),
    findGovernmentByUserProfileId: () => Promise.resolve(null),
    findGovernmentByUserProfileIdAndOSCProfileId: () => Promise.resolve(null),
    findGovernmentById: () => Promise.resolve(null),
    createGovernment: () => Promise.reject(new Error('not implemented')),
    updateGovernment: () => Promise.reject(new Error('not implemented')),
    findGoverningBodiesByGovernmentId: () => Promise.resolve([]),
    findGoverningBodyById: () => Promise.resolve(null),
    replaceGoverningBodies: () => Promise.resolve(),
    disableGoverningBody: () => Promise.resolve(),
    withTransaction: (callback) => callback({} as never),
    ...overrides,
  };
}

describe('GovernmentService', () => {
  describe('getGovernment', () => {
    it('throws user_profile_not_found when user profile is missing', async () => {
      const service = new GovernmentService(mockRepository());
      await expect(service.getGovernment(1)).rejects.toThrow(userProfileNotFound());
    });

    it('returns default fields and computed isMexico/readOnly when no row exists', async () => {
      const service = new GovernmentService(
        mockRepository({
          findUserProfileById: () =>
            Promise.resolve({
              userprofileid: 1,
              countryid: 1,
              email: 'qa.auth@dibujando.test',
              institutionname: 'QA',
              fullinstitutionname: 'QA',
              internalid: 'id',
              nationalregistrynumber: null,
              externalid: null,
              fileid: null,
              statusid: 1,
              usercreateid: '1',
              userupdateid: null,
              datetimecreate: new Date(),
              datetimelastupdate: null,
            } as never),
        }),
      );

      const data = await service.getGovernment(1);

      expect(data.governmentId).toBeNull();
      expect(data.userProfileId).toBe(1);
      expect(data.isMexico).toBe(true);
      expect(data.readOnly).toBe(false);
      expect(data.governingBody).toHaveLength(0);
    });
  });

  describe('saveGovernment', () => {
    it('throws user_profile_not_found when user profile is missing', async () => {
      const service = new GovernmentService(mockRepository());
      await expect(service.saveGovernment(baseBody)).rejects.toThrow(userProfileNotFound());
    });

    it('throws validation_failed when governing body list is empty', async () => {
      const service = new GovernmentService(
        mockRepository({
          findUserProfileById: () => Promise.resolve({ userprofileid: 1, countryid: 1 } as never),
        }),
      );

      let caught: GovernmentErrorException | undefined;
      try {
        await service.saveGovernment({ ...baseBody, governingBody: [] });
      } catch (error) {
        caught = error as GovernmentErrorException;
      }

      expect(caught).toBeDefined();
      expect(caught!.code).toBe('validation_failed');
      expect(caught!.details).toContain(
        'Se requiere ingresar al menos un miembro de su Patronato o Consejo',
      );
    });

    it('throws validation_failed for a Mexican OSC when RFC is missing', async () => {
      const service = new GovernmentService(
        mockRepository({
          findUserProfileById: () => Promise.resolve({ userprofileid: 1, countryid: 1 } as never),
        }),
      );

      let caught: GovernmentErrorException | undefined;
      try {
        await service.saveGovernment({
          ...baseBody,
          governingBody: [
            {
              name: 'Juan Pérez',
              position: 'Tesorero',
              memberSince: 2020,
              isMemberOfOtherBody: false,
            },
          ],
        });
      } catch (error) {
        caught = error as GovernmentErrorException;
      }

      expect(caught).toBeDefined();
      expect(caught!.code).toBe('validation_failed');
      expect(caught!.details).toContain('El campo RFC es requerido.');
    });

    it('succeeds for a non-Mexican OSC without RFC', async () => {
      const service = new GovernmentService(
        mockRepository({
          findUserProfileById: () => Promise.resolve({ userprofileid: 2, countryid: 2 } as never),
          createGovernment: (values) =>
            Promise.resolve({
              governmentid: 2,
              ...values,
            } as never),
          withTransaction: (callback) => callback({} as never),
        }),
      );

      const result = await service.saveGovernment({
        ...baseBody,
        governingBody: [
          {
            name: 'Juan Pérez',
            position: 'Tesorero',
            memberSince: 2020,
            isMemberOfOtherBody: false,
          },
        ],
      });

      expect(result.governmentId).toBe(2);
      expect(result.needsResubmission).toBe(false);
    });

    it('throws osc_profile_locked when the OSC profile is read-only', async () => {
      const service = new GovernmentService(
        mockRepository({
          findUserProfileById: () => Promise.resolve({ userprofileid: 1, countryid: 1 } as never),
          findActiveOSCProfileByUserProfileId: () =>
            Promise.resolve({
              dynamicsoscstatusid: '206430000',
            } as never),
        }),
      );

      await expect(service.saveGovernment(baseBody)).rejects.toThrow(oscProfileLocked());
    });
  });

  describe('disableGoverningBody', () => {
    it('throws governing_body_not_found when the row is missing', async () => {
      const service = new GovernmentService(mockRepository());
      await expect(service.disableGoverningBody(999)).rejects.toThrow(governingBodyNotFound());
    });
  });
});
