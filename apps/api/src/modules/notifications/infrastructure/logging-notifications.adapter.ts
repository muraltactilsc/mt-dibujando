import { Injectable, Logger } from '@nestjs/common';
import { NotificationsPort } from '../domain/notifications.port';

@Injectable()
export class LoggingNotificationsAdapter implements NotificationsPort {
  private readonly logger = new Logger(LoggingNotificationsAdapter.name);

  sendPasswordResetEmail(email: string, resetUrl: string, institutionName: string): Promise<void> {
    this.logger.log({
      recipient: email,
      subject: 'Restablecer contraseña',
      institutionName,
      resetUrl,
      note: 'Microsoft Graph sendMail not wired yet; this is a stub.',
    });
    return Promise.resolve();
  }
}
