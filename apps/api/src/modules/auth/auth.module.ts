import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AuthService } from './application/auth.service';
import { UserRegistrationService } from './application/user-registration.service';
import { AuthRepository } from './infrastructure/auth.repository';
import { AuthController } from './presentation/auth.controller';
import { AuthExceptionFilter } from './presentation/auth-exception.filter';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRegistrationService,
    AuthRepository,
    {
      provide: APP_FILTER,
      useClass: AuthExceptionFilter,
    },
  ],
})
export class AuthModule {}
