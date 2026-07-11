import { HttpStatus } from '@nestjs/common';

export interface RegistrationErrorDetails {
  code: string;
  message: string;
  status: HttpStatus;
}

export class RegistrationErrorException extends Error {
  readonly code: string;
  readonly status: HttpStatus;

  constructor(details: RegistrationErrorDetails) {
    super(details.message);
    this.code = details.code;
    this.status = details.status;
    this.name = 'RegistrationErrorException';
  }
}

export function incompleteAnswers(): RegistrationErrorException {
  return new RegistrationErrorException({
    code: 'incomplete_answers',
    message: 'No ha respondido todas las preguntas.',
    status: HttpStatus.BAD_REQUEST,
  });
}

export function registrationTokenExpired(): RegistrationErrorException {
  return new RegistrationErrorException({
    code: 'registration_token_expired',
    message: 'Lo sentimos la creación de cuenta expiró, vuelve a realizar el pre-registro.',
    status: HttpStatus.UNAUTHORIZED,
  });
}
