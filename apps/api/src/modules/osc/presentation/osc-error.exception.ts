import { HttpStatus } from '@nestjs/common';

export interface OSCErrorDetails {
  code: string;
  message: string;
  status: HttpStatus;
}

export class OSCErrorException extends Error {
  readonly code: string;
  readonly status: HttpStatus;

  constructor(details: OSCErrorDetails) {
    super(details.message);
    this.code = details.code;
    this.status = details.status;
    this.name = 'OSCErrorException';
  }
}

export function userProfileNotFound(): OSCErrorException {
  return new OSCErrorException({
    code: 'user_profile_not_found',
    message: 'El Id de Usuario no es válido.',
    status: HttpStatus.BAD_REQUEST,
  });
}

export function oscProfileLocked(): OSCErrorException {
  return new OSCErrorException({
    code: 'osc_profile_locked',
    message: 'El perfil de la OSC está bloqueado para edición.',
    status: HttpStatus.FORBIDDEN,
  });
}
