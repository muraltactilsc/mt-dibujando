import { describe, expect, it } from 'vitest';
import type { LegalBaseRepository } from '../infrastructure/legal-base.repository';
import {
  lastProtocolizationRequired,
  oscProfileLocked,
  userProfileNotFound,
} from '../presentation/legal-base-error.exception';
import { LegalBaseService } from './legal-base.service';

function mockRepository(overrides?: Partial<LegalBaseRepository>): LegalBaseRepository {
  return {
    findUserProfileById: () => Promise.resolve(null),
    findActiveOSCProfileByUserProfileId: () => Promise.resolve(null),
    findLegalBaseByUserProfileId: () => Promise.resolve(null),
    findLegalBaseByUserProfileIdAndOSCProfileId: () => Promise.resolve(null),
    findLegalBaseById: () => Promise.resolve(null),
    findMexicoCountryId: () => Promise.resolve(1),
    createLegalBase: () => Promise.reject(new Error('not implemented')),
    updateLegalBase: () => Promise.reject(new Error('not implemented')),
    ...overrides,
  };
}

const baseBody = {
  userProfileId: 1,
  organizationConstitutionDate: new Date('2020-01-15'),
  isAuthorized: true,
  goubernamentalAuthorizationDate: new Date('2023-01-01'),
  socialObjetive: 'Social objective',
};

describe('LegalBaseService', () => {
  describe('getLegalData', () => {
    it('throws user_profile_not_found when user profile is missing', async () => {
      const service = new LegalBaseService(mockRepository());
      await expect(service.getLegalData(1)).rejects.toThrow(userProfileNotFound());
    });

    it('returns default fields and computed isMexico/readOnly when no row exists', async () => {
      const service = new LegalBaseService(
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

      const data = await service.getLegalData(1);

      expect(data.legalBaseId).toBeNull();
      expect(data.userProfileId).toBe(1);
      expect(data.isMexico).toBe(true);
      expect(data.readOnly).toBe(false);
    });
  });

  describe('saveLegalData', () => {
    it('throws user_profile_not_found when user profile is missing', async () => {
      const service = new LegalBaseService(mockRepository());
      await expect(service.saveLegalData(baseBody)).rejects.toThrow(userProfileNotFound());
    });

    it('throws last_protocolization_required for a Mexican OSC when date is missing', async () => {
      const service = new LegalBaseService(
        mockRepository({
          findUserProfileById: () => Promise.resolve({ userprofileid: 1, countryid: 1 } as never),
        }),
      );

      await expect(
        service.saveLegalData({ ...baseBody, lastProtocolizationDate: undefined }),
      ).rejects.toThrow(lastProtocolizationRequired());
    });

    it('succeeds for a Mexican OSC when last protocolization date is provided', async () => {
      const service = new LegalBaseService(
        mockRepository({
          findUserProfileById: () => Promise.resolve({ userprofileid: 1, countryid: 1 } as never),
          createLegalBase: (values) =>
            Promise.resolve({
              legalbaseid: 1,
              ...values,
            } as never),
        }),
      );

      const result = await service.saveLegalData({
        ...baseBody,
        lastProtocolizationDate: new Date('2022-06-30'),
      });

      expect(result.legalBaseId).toBe(1);
      expect(result.needsResubmission).toBe(false);
    });

    it('succeeds for a non-Mexican OSC without last protocolization date', async () => {
      const service = new LegalBaseService(
        mockRepository({
          findUserProfileById: () => Promise.resolve({ userprofileid: 2, countryid: 2 } as never),
          createLegalBase: (values) =>
            Promise.resolve({
              legalbaseid: 2,
              ...values,
            } as never),
        }),
      );

      const result = await service.saveLegalData(baseBody);

      expect(result.legalBaseId).toBe(2);
    });

    it('throws osc_profile_locked when the OSC profile is read-only', async () => {
      const service = new LegalBaseService(
        mockRepository({
          findUserProfileById: () => Promise.resolve({ userprofileid: 1, countryid: 1 } as never),
          findActiveOSCProfileByUserProfileId: () =>
            Promise.resolve({
              dynamicsoscstatusid: '206430000',
            } as never),
        }),
      );

      await expect(
        service.saveLegalData({
          ...baseBody,
          lastProtocolizationDate: new Date('2022-06-30'),
        }),
      ).rejects.toThrow(oscProfileLocked());
    });
  });
});
