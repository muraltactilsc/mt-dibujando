import { type ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { RegistrationErrorException } from './registration-error.exception';

interface ErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

@Catch(RegistrationErrorException)
export class RegistrationExceptionFilter implements ExceptionFilter {
  catch(exception: RegistrationErrorException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const envelope: ErrorEnvelope = {
      success: false,
      error: { code: exception.code, message: exception.message },
    };

    response.status(exception.status).json(envelope);
  }
}
