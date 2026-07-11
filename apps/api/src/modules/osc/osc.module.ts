import { Module } from '@nestjs/common';
import { OSCService } from './application/osc.service';
import { OSCRepository } from './infrastructure/osc.repository';
import { OSCController } from './presentation/osc.controller';

@Module({
  controllers: [OSCController],
  providers: [OSCService, OSCRepository],
})
export class OSCModule {}
