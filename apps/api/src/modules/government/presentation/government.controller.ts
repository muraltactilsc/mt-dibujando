import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseFilters,
} from '@nestjs/common';
import { SaveGovernmentBodySchema, type SaveGovernmentBody } from '@dibujando/shared';
import { GovernmentService } from '../application/government.service';
import { GovernmentExceptionFilter } from './government-exception.filter';
import { ZodValidationPipe } from '../../../shared/zod-validation.pipe';

@Controller('api/osc/government')
@UseFilters(GovernmentExceptionFilter)
export class GovernmentController {
  constructor(private readonly governmentService: GovernmentService) {}

  @Get()
  async getGovernment(
    @Query('userProfileId') userProfileId: string,
    @Query('oscProfileId') oscProfileId?: string,
  ) {
    const parsedUserProfileId = Number(userProfileId);
    const parsedOSCProfileId = oscProfileId ? Number(oscProfileId) : undefined;

    const data = await this.governmentService.getGovernment(
      parsedUserProfileId,
      parsedOSCProfileId,
    );

    return { success: true, data };
  }

  @Post()
  async saveGovernment(
    @Body(new ZodValidationPipe(SaveGovernmentBodySchema)) body: SaveGovernmentBody,
  ) {
    const data = await this.governmentService.saveGovernment(body);
    return { success: true, data };
  }

  @Post('governing-body/:id/disable')
  async disableGoverningBody(@Param('id', ParseIntPipe) id: number) {
    await this.governmentService.disableGoverningBody(id);
    return { success: true, data: { disabled: true } };
  }
}
