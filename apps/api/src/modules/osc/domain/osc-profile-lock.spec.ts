import { describe, expect, it } from 'vitest';
import { isOSCProfileReadOnly, needsResubmission } from './osc-profile-lock';

describe('osc-profile-lock', () => {
  describe('isOSCProfileReadOnly', () => {
    it('returns true for Sent status', () => {
      expect(isOSCProfileReadOnly('206430000')).toBe(true);
    });

    it('returns true for InReview status', () => {
      expect(isOSCProfileReadOnly('206430001')).toBe(true);
    });

    it('returns false for Approved status', () => {
      expect(isOSCProfileReadOnly('206430002')).toBe(false);
    });

    it('returns false for null status', () => {
      expect(isOSCProfileReadOnly(null)).toBe(false);
    });
  });

  describe('needsResubmission', () => {
    it('returns true for each CRM lifecycle status', () => {
      expect(needsResubmission('206430000')).toBe(true);
      expect(needsResubmission('206430001')).toBe(true);
      expect(needsResubmission('206430002')).toBe(true);
      expect(needsResubmission('206430003')).toBe(true);
      expect(needsResubmission('206430004')).toBe(true);
    });

    it('returns false for null status', () => {
      expect(needsResubmission(null)).toBe(false);
    });

    it('returns false for unknown status', () => {
      expect(needsResubmission('999999999')).toBe(false);
    });
  });
});
