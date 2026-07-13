import { HttpStatus } from '@nestjs/common';

export interface GovernmentErrorDetails {
  code: string;
  message: string;
  status: HttpStatus;
  details?: string[];
}

export class GovernmentErrorException extends Error {
  readonly code: string;
  readonly status: HttpStatus;
  readonly details?: string[];

  constructor(details: GovernmentErrorDetails) {
    super(details.message);
    this.code = details.code;
    this.status = details.status;
    this.details = details.details;
    this.name = 'GovernmentErrorException';
  }
}

export function userProfileNotFound(): GovernmentErrorException {
  return new GovernmentErrorException({
    code: 'user_profile_not_found',
    message: 'El Id de Usuario no es válido.',
    status: HttpStatus.BAD_REQUEST,
  });
}

export function oscProfileLocked(): GovernmentErrorException {
  return new GovernmentErrorException({
    code: 'osc_profile_locked',
    message: 'El perfil de la OSC está bloqueado para edición.',
    status: HttpStatus.FORBIDDEN,
  });
}

export function governingBodyNotFound(): GovernmentErrorException {
  return new GovernmentErrorException({
    code: 'governing_body_not_found',
    message: 'El miembro del Patronato o Consejo no existe.',
    status: HttpStatus.BAD_REQUEST,
  });
}

export function validationFailed(messages: string[]): GovernmentErrorException {
  return new GovernmentErrorException({
    code: 'validation_failed',
    message: 'La información proporcionada no es válida.',
    status: HttpStatus.BAD_REQUEST,
    details: messages,
  });
}
