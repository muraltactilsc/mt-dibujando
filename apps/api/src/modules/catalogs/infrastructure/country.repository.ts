import { Injectable } from '@nestjs/common';
import type { Selectable } from 'kysely';
import { db } from '../../../../db/database';
import type { Country } from '../../../../db/types';

@Injectable()
export class CountryRepository {
  async findActiveCountries(): Promise<Array<Pick<Selectable<Country>, 'countryid' | 'name'>>> {
    return db
      .selectFrom('country')
      .select(['countryid', 'name'])
      .where('statusid', '=', 1)
      .orderBy('name', 'asc')
      .execute();
  }
}
