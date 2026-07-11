import { Controller, Get, Query } from '@nestjs/common';
import { CatalogsRepository } from '../infrastructure/catalogs.repository';
import { CountryRepository } from '../infrastructure/country.repository';

@Controller('api/catalogs')
export class CatalogsController {
  constructor(
    private readonly countryRepository: CountryRepository,
    private readonly catalogsRepository: CatalogsRepository,
  ) {}

  @Get('countries')
  async getCountries() {
    const rows = await this.countryRepository.findActiveCountries();
    const data = rows.map((row) => ({ countryId: row.countryid, name: row.name }));
    return { success: true, data };
  }

  @Get('states')
  async getStates(@Query('countryId') countryId: string) {
    const rows = await this.catalogsRepository.findActiveStatesByCountry(Number(countryId));
    const data = rows.map((row) => ({ stateId: row.stateid, name: row.name }));
    return { success: true, data };
  }

  @Get('osc-types')
  async getOSCTypes() {
    const rows = await this.catalogsRepository.findActiveOSCTypes();
    const data = rows.map((row) => ({ oscTypeId: row.osctypeid, name: row.name }));
    return { success: true, data };
  }

  @Get('osc-type-constitutions')
  async getOSCTypeConstitutions() {
    const rows = await this.catalogsRepository.findActiveOSCTypeConstitutions();
    const data = rows.map((row) => ({
      oscTypeConstitutionId: row.osctypeconstitutionid,
      name: row.name,
    }));
    return { success: true, data };
  }

  @Get('action-lines')
  async getActionLines() {
    const rows = await this.catalogsRepository.findActiveActionLines();
    const data = rows.map((row) => ({ actionLineId: row.actionlineid, name: row.name }));
    return { success: true, data };
  }

  @Get('action-lines-secondary')
  async getActionLinesSecondary() {
    const rows = await this.catalogsRepository.findActiveActionLinesSecondary();
    const data = rows.map((row) => ({
      actionLineSecondaryId: row.actionlinesecondaryid,
      name: row.name,
    }));
    return { success: true, data };
  }

  @Get('osc-statuses')
  async getOSCStatuses() {
    const rows = await this.catalogsRepository.findActiveOSCStatuses();
    const data = rows.map((row) => ({
      oscStatusId: row.oscstatusid,
      dynamicsOSCStatusId: row.dynamicsoscstatusid,
      name: row.name,
    }));
    return { success: true, data };
  }
}
