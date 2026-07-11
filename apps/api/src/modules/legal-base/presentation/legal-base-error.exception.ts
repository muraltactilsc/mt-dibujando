import { HttpStatus } from '@nestjs/common';

export interface LegalBaseErrorDetails {
  code: string;
  message: string;
  status: HttpStatus;
}

export class LegalBaseErrorException extends Error {
  readonly code: string;
  readonly status: HttpStatus;

  constructor(details: LegalBaseErrorDetails) {
    super(details.message);
    this.code = details.code;
    this.status = details.status;
    this.name = 'LegalBaseErrorException';
  }
}

export function userProfileNotFound(): LegalBaseErrorException {
  return new LegalBaseErrorException({
    code: 'user_profile_not_found',
    message: 'El Id de Usuario no es válido.',
    status: HttpStatus.BAD_REQUEST,
  });
}

export function oscProfileLocked(): LegalBaseErrorException {
  return new LegalBaseErrorException({
    code: 'osc_profile_locked',
    message: 'El perfil de la OSC está bloqueado para edición.',
    status: HttpStatus.FORBIDDEN,
  });
}

export function lastProtocolizationRequired(): LegalBaseErrorException {
  return new LegalBaseErrorException({
    code: 'last_protocolization_required',
    message:
      'El campo Fecha de la última protocolización del acta constitutiva de la organización es requerido.',
    status: HttpStatus.BAD_REQUEST,
  });
}
