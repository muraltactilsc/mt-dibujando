import { Controller, Get } from '@nestjs/common';
import { HealthService } from '../application/health.service';
import type { HealthResponse } from './health.schema';

@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('health')
  async check(): Promise<HealthResponse> {
    const data = await this.healthService.check();
    return { success: true, data };
  }
}
