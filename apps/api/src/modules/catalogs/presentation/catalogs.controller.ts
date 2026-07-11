import { Controller, Get } from '@nestjs/common';
import { CountryRepository } from '../infrastructure/country.repository';

@Controller('api/catalogs')
export class CatalogsController {
  constructor(private readonly countryRepository: CountryRepository) {}

  @Get('countries')
  async getCountries() {
    const rows = await this.countryRepository.findActiveCountries();
    const data = rows.map((row) => ({ countryId: row.countryid, name: row.name }));
    return { success: true, data };
  }
}
