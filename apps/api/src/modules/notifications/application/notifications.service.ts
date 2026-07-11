import { Inject, Injectable } from '@nestjs/common';
import { NOTIFICATIONS_PORT, type NotificationsPort } from '../domain/notifications.port';

@Injectable()
export class NotificationsService {
  constructor(@Inject(NOTIFICATIONS_PORT) private readonly port: NotificationsPort) {}

  async sendPasswordResetEmail(
    email: string,
    resetUrl: string,
    institutionName: string,
  ): Promise<void> {
    return this.port.sendPasswordResetEmail(email, resetUrl, institutionName);
  }
}
