import { Module } from '@nestjs/common';
import { NotificationsService } from './application/notifications.service';
import { LoggingNotificationsAdapter } from './infrastructure/logging-notifications.adapter';
import { NOTIFICATIONS_PORT } from './domain/notifications.port';

@Module({
  providers: [
    NotificationsService,
    {
      provide: NOTIFICATIONS_PORT,
      useClass: LoggingNotificationsAdapter,
    },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
