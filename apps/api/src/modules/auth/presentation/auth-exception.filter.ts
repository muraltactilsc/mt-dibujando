import {
  type ArgumentsHost,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  type HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthErrorException } from './auth-error.exception';

interface ErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

@Catch(AuthErrorException, UnauthorizedException, ForbiddenException)
export class AuthExceptionFilter implements ExceptionFilter {
  catch(exception: AuthErrorException | HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let envelope: ErrorEnvelope;

    if (exception instanceof AuthErrorException) {
      envelope = {
        success: false,
        error: { code: exception.code, message: exception.message },
      };
      response.status(exception.status).json(envelope);
      return;
    }

    if (exception instanceof ForbiddenException) {
      const message =
        typeof exception.getResponse() === 'string'
          ? exception.getResponse()
          : ((exception.getResponse() as { message?: string }).message ?? 'Forbidden');
      envelope = {
        success: false,
        error: {
          code: 'forbidden_role',
          message: typeof message === 'string' ? message : 'Forbidden',
        },
      };
      response.status(403).json(envelope);
      return;
    }

    const message =
      typeof exception.getResponse() === 'string'
        ? exception.getResponse()
        : ((exception.getResponse() as { message?: string }).message ?? 'Unauthorized');
    envelope = {
      success: false,
      error: {
        code: 'unauthenticated',
        message: typeof message === 'string' ? message : 'Unauthorized',
      },
    };
    response.status(401).json(envelope);
  }
}
