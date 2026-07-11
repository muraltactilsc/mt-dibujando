import { Module } from '@nestjs/common';
import { CountryRepository } from './infrastructure/country.repository';
import { CatalogsController } from './presentation/catalogs.controller';

@Module({
  controllers: [CatalogsController],
  providers: [CountryRepository],
})
export class CatalogsModule {}
