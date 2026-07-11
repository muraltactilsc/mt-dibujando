export interface NotificationsPort {
  sendPasswordResetEmail(email: string, resetUrl: string, institutionName: string): Promise<void>;
}

export const NOTIFICATIONS_PORT = Symbol('NOTIFICATIONS_PORT');
