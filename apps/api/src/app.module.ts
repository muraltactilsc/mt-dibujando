import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { CatalogsModule } from './modules/catalogs/catalogs.module';
import { GovernmentModule } from './modules/government/government.module';
import { HealthModule } from './modules/health/health.module';
import { InstitutionalBaseModule } from './modules/institutional-base/institutional-base.module';
import { LegalBaseModule } from './modules/legal-base/legal-base.module';
import { OSCModule } from './modules/osc/osc.module';
import { RegistrationModule } from './modules/registration/registration.module';
import { RolesGuard } from './shared/roles.guard';

@Module({
  imports: [
    AuthModule,
    CatalogsModule,
    GovernmentModule,
    HealthModule,
    InstitutionalBaseModule,
    LegalBaseModule,
    OSCModule,
    RegistrationModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
