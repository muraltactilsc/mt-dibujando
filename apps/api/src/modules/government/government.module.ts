import { Module } from '@nestjs/common';
import { GovernmentService } from './application/government.service';
import { GovernmentRepository } from './infrastructure/government.repository';
import { GovernmentController } from './presentation/government.controller';

@Module({
  controllers: [GovernmentController],
  providers: [GovernmentService, GovernmentRepository],
})
export class GovernmentModule {}
