import { Module } from '@nestjs/common';
import { CatalogsRepository } from './infrastructure/catalogs.repository';
import { CountryRepository } from './infrastructure/country.repository';
import { CatalogsController } from './presentation/catalogs.controller';

@Module({
  controllers: [CatalogsController],
  providers: [CatalogsRepository, CountryRepository],
})
export class CatalogsModule {}
