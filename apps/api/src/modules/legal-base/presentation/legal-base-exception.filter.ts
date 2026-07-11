import { type ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { LegalBaseErrorException } from './legal-base-error.exception';

interface ErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

@Catch(LegalBaseErrorException)
export class LegalBaseExceptionFilter implements ExceptionFilter {
  catch(exception: LegalBaseErrorException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const envelope: ErrorEnvelope = {
      success: false,
      error: { code: exception.code, message: exception.message },
    };

    response.status(exception.status).json(envelope);
  }
}
