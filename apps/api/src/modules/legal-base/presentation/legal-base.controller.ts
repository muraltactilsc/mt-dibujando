import { Body, Controller, Get, Post, Query, UseFilters } from '@nestjs/common';
import { SaveLegalBaseBodySchema, type SaveLegalBaseBody } from '@dibujando/shared';
import { LegalBaseService } from '../application/legal-base.service';
import { LegalBaseExceptionFilter } from './legal-base-exception.filter';
import { ZodValidationPipe } from '../../../shared/zod-validation.pipe';

@Controller('api/osc/legal-base')
@UseFilters(LegalBaseExceptionFilter)
export class LegalBaseController {
  constructor(private readonly legalBaseService: LegalBaseService) {}

  @Get()
  async getLegalBase(
    @Query('userProfileId') userProfileId: string,
    @Query('oscProfileId') oscProfileId?: string,
  ) {
    const parsedUserProfileId = Number(userProfileId);
    const parsedOSCProfileId = oscProfileId ? Number(oscProfileId) : undefined;

    const data = await this.legalBaseService.getLegalData(parsedUserProfileId, parsedOSCProfileId);

    return { success: true, data };
  }

  @Post()
  async saveLegalBase(
    @Body(new ZodValidationPipe(SaveLegalBaseBodySchema)) body: SaveLegalBaseBody,
  ) {
    const data = await this.legalBaseService.saveLegalData(body);
    return { success: true, data };
  }
}
