import { Body, Controller, Get, Post, Query, UseFilters } from '@nestjs/common';
import { SaveGeneralDataBodySchema, type SaveGeneralDataBody } from '@dibujando/shared';
import { OSCService } from '../application/osc.service';
import { OSCExceptionFilter } from './osc-exception.filter';
import { ZodValidationPipe } from '../../../shared/zod-validation.pipe';

@Controller('api/osc')
@UseFilters(OSCExceptionFilter)
export class OSCController {
  constructor(private readonly oscService: OSCService) {}

  @Get('general-data')
  async getGeneralData(@Query('userProfileId') userProfileId: string) {
    const parsed = Number(userProfileId);
    const data = await this.oscService.getGeneralData(parsed);
    return { success: true, data };
  }

  @Post('general-data')
  async saveGeneralData(
    @Body(new ZodValidationPipe(SaveGeneralDataBodySchema)) body: SaveGeneralDataBody,
  ) {
    const data = await this.oscService.saveGeneralData(body);
    return { success: true, data };
  }
}
