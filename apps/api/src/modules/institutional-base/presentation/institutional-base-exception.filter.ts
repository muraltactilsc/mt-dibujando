import { type ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { InstitutionalBaseErrorException } from './institutional-base-error.exception';

interface ErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string[];
  };
}

@Catch(InstitutionalBaseErrorException)
export class InstitutionalBaseExceptionFilter implements ExceptionFilter {
  catch(exception: InstitutionalBaseErrorException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const envelope: ErrorEnvelope = {
      success: false,
      error: {
        code: exception.code,
        message: exception.message,
        details: exception.details,
      },
    };

    response.status(exception.status).json(envelope);
  }
}
