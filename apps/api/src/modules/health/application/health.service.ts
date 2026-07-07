import { Injectable } from '@nestjs/common';
import type { HealthStatus } from '../domain/health-status';
import { HealthRepository } from '../infrastructure/health.repository';

@Injectable()
export class HealthService {
  constructor(private readonly repository: HealthRepository) {}

  async check(): Promise<HealthStatus> {
    return this.repository.check();
  }
}
