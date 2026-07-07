import { describe, expect, it, vi } from 'vitest';
import { HealthController } from '../src/modules/health/presentation/health.controller';
import { HealthService } from '../src/modules/health/application/health.service';
import type { HealthRepository } from '../src/modules/health/infrastructure/health.repository';

describe('HealthController', () => {
  it('returns the ok envelope', async () => {
    const repository: HealthRepository = {
      check: vi.fn().mockResolvedValue({ status: 'ok' }),
    };
    const service = new HealthService(repository);
    const controller = new HealthController(service);

    const result = await controller.check();

    expect(result).toEqual({ success: true, data: { status: 'ok' } });
  });
});
