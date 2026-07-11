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

export function registrationTokenExpired(): AuthErrorException {
  return new AuthErrorException({
    code: 'registration_token_expired',
    message: 'Lo sentimos la creación de cuenta expiró, vuelve a realizar el pre-registro.',
    status: HttpStatus.UNAUTHORIZED,
  });
}

export function weakPassword(): AuthErrorException {
  return new AuthErrorException({
    code: 'weak_password',
    message:
      'La contraseña debe tener al menos 6 caracteres; contener una mayúscula, un número y un carácter especial.',
    status: HttpStatus.BAD_REQUEST,
  });
}

export function passwordMismatch(): AuthErrorException {
  return new AuthErrorException({
    code: 'password_mismatch',
    message: 'La contraseña y la confirmación de contraseña no coinciden.',
    status: HttpStatus.BAD_REQUEST,
  });
}

export function emailTaken(): AuthErrorException {
  return new AuthErrorException({
    code: 'email_taken',
    message: 'El correo electrónico ya existe.',
    status: HttpStatus.CONFLICT,
  });
}

export function duplicateRegistryNumber(): AuthErrorException {
  return new AuthErrorException({
    code: 'duplicate_registry_number',
    message: 'Ya existe una OSC registrada con ese RFC o número de registro nacional.',
    status: HttpStatus.CONFLICT,
  });
}

export function resetTokenExpired(): AuthErrorException {
  return new AuthErrorException({
    code: 'reset_token_expired',
    message: 'La solicitud para restablecer contraseña ha expirado o no es válida.',
    status: HttpStatus.UNAUTHORIZED,
  });
}

export function resetMismatch(): AuthErrorException {
  return new AuthErrorException({
    code: 'reset_mismatch',
    message: 'La solicitud para restablecer contraseña no corresponde al correo ingresado.',
    status: HttpStatus.BAD_REQUEST,
  });
}

export function resetUserNotFound(): AuthErrorException {
  return new AuthErrorException({
    code: 'user_not_found',
    message: 'El correo electrónico no está asociado a un usuario o es incorrecto.',
    status: HttpStatus.BAD_REQUEST,
  });
}

export function resetPasswordMismatch(): AuthErrorException {
  return new AuthErrorException({
    code: 'password_mismatch',
    message: 'La contraseña y la confirmación no coinciden.',
    status: HttpStatus.BAD_REQUEST,
  });
}
