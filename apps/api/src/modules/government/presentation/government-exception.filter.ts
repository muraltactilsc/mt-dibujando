import { type ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { GovernmentErrorException } from './government-error.exception';

interface ErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string[];
  };
}

@Catch(GovernmentErrorException)
export class GovernmentExceptionFilter implements ExceptionFilter {
  catch(exception: GovernmentErrorException, host: ArgumentsHost): void {
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
