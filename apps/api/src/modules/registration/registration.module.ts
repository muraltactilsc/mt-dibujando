import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { RegistrationService } from './application/registration.service';
import { RegistrationRepository } from './infrastructure/registration.repository';
import { RegistrationController } from './presentation/registration.controller';
import { RegistrationExceptionFilter } from './presentation/registration-exception.filter';

@Module({
  controllers: [RegistrationController],
  providers: [
    RegistrationService,
    RegistrationRepository,
    {
      provide: APP_FILTER,
      useClass: RegistrationExceptionFilter,
    },
  ],
})
export class RegistrationModule {}
