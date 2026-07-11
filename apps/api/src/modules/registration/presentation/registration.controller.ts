import { Body, Controller, Get, Post, Req, UseFilters } from '@nestjs/common';
import type { Request } from 'express';
import { ValidateAnswersBodySchema, type ValidateAnswersBody } from '@dibujando/shared';
import { RegistrationService } from '../application/registration.service';
import { RegistrationExceptionFilter } from './registration-exception.filter';
import { ZodValidationPipe } from '../../../shared/zod-validation.pipe';

@Controller('api/registration')
@UseFilters(RegistrationExceptionFilter)
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Get('questions')
  async getQuestions() {
    const questions = await this.registrationService.getActiveQuestions();
    return { success: true, data: questions };
  }

  @Post('validate-answers')
  async validateAnswers(
    @Body(new ZodValidationPipe(ValidateAnswersBodySchema)) body: ValidateAnswersBody,
    @Req() request: Request,
  ) {
    const ip = request.ip ?? 'unknown';
    const result = await this.registrationService.validateAnswers(body.answerIds, ip);
    return { success: true, data: result };
  }
}
