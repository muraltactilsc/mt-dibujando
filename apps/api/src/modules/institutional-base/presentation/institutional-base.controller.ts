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
import { SaveInstitutionalBaseBodySchema, type SaveInstitutionalBaseBody } from '@dibujando/shared';
import { InstitutionalBaseService } from '../application/institutional-base.service';
import { InstitutionalBaseWriteService } from '../application/institutional-base-write.service';
import { InstitutionalBaseExceptionFilter } from './institutional-base-exception.filter';
import { ZodValidationPipe } from '../../../shared/zod-validation.pipe';

@Controller('api/osc/institutional-base')
@UseFilters(InstitutionalBaseExceptionFilter)
export class InstitutionalBaseController {
  constructor(
    private readonly institutionalBaseService: InstitutionalBaseService,
    private readonly writeService: InstitutionalBaseWriteService,
  ) {}

  @Get()
  async getInstitutionalBase(
    @Query('userProfileId') userProfileId: string,
    @Query('oscProfileId') oscProfileId?: string,
  ) {
    const parsedUserProfileId = Number(userProfileId);
    const parsedOSCProfileId = oscProfileId ? Number(oscProfileId) : undefined;

    const data = await this.institutionalBaseService.getInstitutionalBase(
      parsedUserProfileId,
      parsedOSCProfileId,
    );

    return { success: true, data };
  }

  @Post()
  async saveInstitutionalBase(
    @Body(new ZodValidationPipe(SaveInstitutionalBaseBodySchema)) body: SaveInstitutionalBaseBody,
  ) {
    const data = await this.writeService.saveInstitutionalBase(body);
    return { success: true, data };
  }

  @Post('intervention-programs/:id/disable')
  async disableInterventionModelProgram(@Param('id', ParseIntPipe) id: number) {
    await this.writeService.disableInterventionModelProgram(id);
    return { success: true, data: { disabled: true } };
  }

  @Post('volunteer-activities/:id/disable')
  async disableVolunteerActivity(@Param('id', ParseIntPipe) id: number) {
    await this.writeService.disableVolunteerActivity(id);
    return { success: true, data: { disabled: true } };
  }
}
