import { Module } from '@nestjs/common';
import { InstitutionalBaseService } from './application/institutional-base.service';
import { InstitutionalBaseWriteService } from './application/institutional-base-write.service';
import { InstitutionalBaseFixedRepository } from './infrastructure/institutional-base-fixed.repository';
import { InstitutionalBaseRepeatableRepository } from './infrastructure/institutional-base-repeatable.repository';
import { InstitutionalBaseRepository } from './infrastructure/institutional-base.repository';
import { InstitutionalBaseController } from './presentation/institutional-base.controller';

@Module({
  controllers: [InstitutionalBaseController],
  providers: [
    InstitutionalBaseService,
    InstitutionalBaseWriteService,
    InstitutionalBaseRepository,
    InstitutionalBaseRepeatableRepository,
    InstitutionalBaseFixedRepository,
  ],
})
export class InstitutionalBaseModule {}
