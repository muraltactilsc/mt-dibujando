import { HttpStatus } from '@nestjs/common';

export interface InstitutionalBaseErrorDetails {
  code: string;
  message: string;
  status: HttpStatus;
  details?: string[];
}

export class InstitutionalBaseErrorException extends Error {
  readonly code: string;
  readonly status: HttpStatus;
  readonly details?: string[];

  constructor(details: InstitutionalBaseErrorDetails) {
    super(details.message);
    this.code = details.code;
    this.status = details.status;
    this.details = details.details;
    this.name = 'InstitutionalBaseErrorException';
  }
}

export function userProfileNotFound(): InstitutionalBaseErrorException {
  return new InstitutionalBaseErrorException({
    code: 'user_profile_not_found',
    message: 'El Id de Usuario no es válido.',
    status: HttpStatus.BAD_REQUEST,
  });
}

export function oscProfileLocked(): InstitutionalBaseErrorException {
  return new InstitutionalBaseErrorException({
    code: 'osc_profile_locked',
    message: 'El perfil de la OSC está bloqueado para edición.',
    status: HttpStatus.FORBIDDEN,
  });
}

export function institutionalBaseNotFound(): InstitutionalBaseErrorException {
  return new InstitutionalBaseErrorException({
    code: 'institutional_base_not_found',
    message: 'El registro de Base Institucional no existe.',
    status: HttpStatus.BAD_REQUEST,
  });
}

export function interventionModelProgramNotFound(): InstitutionalBaseErrorException {
  return new InstitutionalBaseErrorException({
    code: 'intervention_model_program_not_found',
    message: 'El programa del modelo de intervención no existe.',
    status: HttpStatus.BAD_REQUEST,
  });
}

export function volunteerActivityNotFound(): InstitutionalBaseErrorException {
  return new InstitutionalBaseErrorException({
    code: 'volunteer_activity_not_found',
    message: 'La actividad de voluntariado no existe.',
    status: HttpStatus.BAD_REQUEST,
  });
}

export function validationFailed(messages: string[]): InstitutionalBaseErrorException {
  return new InstitutionalBaseErrorException({
    code: 'validation_failed',
    message: 'La información proporcionada no es válida.',
    status: HttpStatus.BAD_REQUEST,
    details: messages,
  });
}
