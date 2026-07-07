import { describe, expect, it } from 'vitest';
import { HealthStatusSchema } from '@dibujando/shared';

describe('shared contracts', () => {
  it('parses a valid health status', () => {
    const result = HealthStatusSchema.parse({ status: 'ok' });
    expect(result).toEqual({ status: 'ok' });
  });

  it('rejects an invalid health status', () => {
    expect(() => HealthStatusSchema.parse({ status: 42 })).toThrow();
  });
});
