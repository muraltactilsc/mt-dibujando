import { HttpStatus } from '@nestjs/common';

export interface AuthErrorDetails {
  code: string;
  message: string;
  status: HttpStatus;
}

export class AuthErrorException extends Error {
  readonly code: string;
  readonly status: HttpStatus;

  constructor(details: AuthErrorDetails) {
    super(details.message);
    this.code = details.code;
    this.status = details.status;
    this.name = 'AuthErrorException';
  }
}

export function userNotFound(): AuthErrorException {
  return new AuthErrorException({
    code: 'user_not_found',
    message: 'El correo electrónico no está asociado a un usuario o es incorrecto.',
    status: HttpStatus.UNAUTHORIZED,
  });
}

export function invalidCredentials(): AuthErrorException {
  return new AuthErrorException({
    code: 'invalid_credentials',
    message: 'El correo electrónico y la contraseña no coinciden.',
    status: HttpStatus.UNAUTHORIZED,
  });
}

export function sessionInvalidated(): AuthErrorException {
  return new AuthErrorException({
    code: 'session_invalidated',
    message: 'La sesión ha sido invalidada. Vuelve a iniciar sesión.',
    status: HttpStatus.UNAUTHORIZED,
  });
}

export function unauthenticated(
  message = 'No se encontró un token de autenticación válido.',
): AuthErrorException {
  return new AuthErrorException({
    code: 'unauthenticated',
    message,
    status: HttpStatus.UNAUTHORIZED,
  });
}

export function forbiddenRole(): AuthErrorException {
  return new AuthErrorException({
    code: 'forbidden_role',
    message: 'No tienes permiso para acceder a este recurso.',
    status: HttpStatus.FORBIDDEN,
  });
}
