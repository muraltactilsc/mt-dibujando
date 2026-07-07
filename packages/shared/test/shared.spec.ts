import { describe, expect, it } from 'vitest';
import { HealthStatusSchema } from '../src/index';

describe('HealthStatusSchema', () => {
  it('parses a valid status', () => {
    const result = HealthStatusSchema.parse({ status: 'ok' });
    expect(result).toEqual({ status: 'ok' });
  });

  it('rejects an invalid status', () => {
    expect(() => HealthStatusSchema.parse({ status: 42 })).toThrow();
  });
});
