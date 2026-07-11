import { Module } from '@nestjs/common';
import { LegalBaseService } from './application/legal-base.service';
import { LegalBaseRepository } from './infrastructure/legal-base.repository';
import { LegalBaseController } from './presentation/legal-base.controller';

@Module({
  controllers: [LegalBaseController],
  providers: [LegalBaseService, LegalBaseRepository],
})
export class LegalBaseModule {}
