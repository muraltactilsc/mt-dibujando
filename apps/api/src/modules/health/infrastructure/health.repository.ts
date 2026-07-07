import { Injectable } from '@nestjs/common';
import { sql } from 'kysely';
import { db } from '../../../../db/database';
import type { HealthStatus } from '../domain/health-status';

@Injectable()
export class HealthRepository {
  async check(): Promise<HealthStatus> {
    await sql`SELECT 1`.execute(db);
    return { status: 'ok' };
  }
}
